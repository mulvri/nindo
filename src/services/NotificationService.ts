import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Variable pour éviter les listeners multiples
let listenersSetup = false;

export const NotificationService = {
  /**
   * Configure les listeners pour les notifications
   * Appelé une seule fois au démarrage de l'app
   */
  setupListeners() {
    if (listenersSetup) return;
    listenersSetup = true;

    // Listener quand une notification est reçue (app au premier plan)
    Notifications.addNotificationReceivedListener((notification) => {
      console.log("Nindo: Notification reçue:", notification.request.content.title);
      // Reprogrammer les notifications après réception
      // pour maintenir le cycle hebdomadaire
      this.syncNotifications();
    });

    // Listener quand l'utilisateur interagit avec la notification
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Nindo: Notification cliquée:", response.notification.request.content.data);
      // On peut naviguer vers un écran spécifique ici si nécessaire
    });
  },

  /**
   * Demande les permissions pour les notifications
   */
  async requestPermissions() {
    if (Platform.OS === "web") return false;

    if (!Device.isDevice) {
      console.warn("Nindo: Les notifications ne fonctionnent que sur un appareil réel.");
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Nindo: Permission de notification refusée.");
      return false;
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF6B35",
      });
    }

    return true;
  },

  /**
   * Annule toutes les notifications programmées
   */
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Planifie la notification de rappel de mood quotidien
   */
  async scheduleMoodReminder(time: string, firstName: string) {
    if (!time) return;

    const [hours, minutes] = time.split(":").map(Number);

    const trigger = Platform.OS === "android" 
      ? ({
          type: "daily",
          hour: hours,
          minute: minutes,
          channelId: "default",
        } as unknown as Notifications.NotificationTriggerInput)
      : ({
          type: "calendar",
          hour: hours,
          minute: minutes,
          repeats: true,
        } as unknown as Notifications.NotificationTriggerInput);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Dojo de Nindo",
        body: `Hey ${firstName || "Ninja"}, quel est ton mood aujourd'hui ?`,
        data: { type: "mood_reminder" },
      },
      trigger,
    });

    // Optionnel : Suivi 2h après si pas de réponse (à gérer au lancement de l'app ou via task manager)
    // Pour simplifier, on planifie juste la principale ici.
  },

  /**
   * Planifie la notification de streak en danger
   */
  async scheduleStreakDangerReminder(firstName: string) {
    const trigger = Platform.OS === "android"
      ? ({
          type: "daily",
          hour: 20,
          minute: 0,
          channelId: "default",
        } as unknown as Notifications.NotificationTriggerInput)
      : ({
          type: "calendar",
          hour: 20,
          minute: 0,
          repeats: true,
        } as unknown as Notifications.NotificationTriggerInput);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Flamme en danger !",
        body: `${firstName || "Ninja"}, ton streak est sur le point de s'éteindre ! Ouvre l'app pour le sauver.`,
        data: { type: "streak_danger" },
      },
      trigger,
    });
  },

  /**
   * Calcule la prochaine date pour un jour de la semaine donné
   * @param targetWeekday 1=Lundi, 7=Dimanche (format ISO)
   * @param hour Heure cible
   * @param minute Minute cible
   */
  getNextDateForWeekday(targetWeekday: number, hour: number, minute: number): Date {
    const now = new Date();
    const currentDay = now.getDay(); // 0=Dimanche, 1=Lundi, ..., 6=Samedi

    // Convertir targetWeekday (1=Lundi, 7=Dimanche) vers JS (0=Dimanche, 6=Samedi)
    const jsTargetDay = targetWeekday === 7 ? 0 : targetWeekday;

    // Calculer les jours jusqu'au prochain jour cible
    let daysUntilTarget = jsTargetDay - currentDay;
    if (daysUntilTarget < 0) {
      daysUntilTarget += 7;
    }

    // Si c'est aujourd'hui, vérifier si l'heure est passée
    if (daysUntilTarget === 0) {
      const targetTime = hour * 60 + minute;
      const currentTime = now.getHours() * 60 + now.getMinutes();
      if (currentTime >= targetTime) {
        daysUntilTarget = 7; // Programmer pour la semaine prochaine
      }
    }

    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysUntilTarget);
    targetDate.setHours(hour, minute, 0, 0);

    return targetDate;
  },

  /**
   * Planifie les notifications de citations pour un rappel spécifique
   * - La première notification est à l'heure de début exacte
   * - Les suivantes sont distribuées uniformément jusqu'à l'heure de fin
   * - Maximum 10 notifications par jour
   */
  async scheduleQuoteNotificationsForReminder(reminder: any) {
    // Limiter entre 1 et 10
    const count = Math.min(10, Math.max(1, reminder.count || 1));
    if (!reminder.enabled || count === 0) return;

    const { getFilteredQuotes } = require("./database");
    let allQuotes = await getFilteredQuotes();

    if (reminder.category && reminder.category !== "General") {
      // Pour l'instant on filtre par mood si la catégorie match
      allQuotes = allQuotes.filter((q: any) => q.mood === reminder.category);
    }

    if (allQuotes.length === 0) return;

    // Mélanger et prendre 'count' citations
    const selectedQuotes = allQuotes.sort(() => 0.5 - Math.random()).slice(0, count);

    // Répartir sur la plage horaire
    const [startH, startM] = (reminder.startTime || "09:00").split(":").map(Number);
    const [endH, endM] = (reminder.endTime || "21:00").split(":").map(Number);

    const startTimeInMinutes = startH * 60 + startM;
    const endTimeInMinutes = endH * 60 + endM;
    const totalMinutes = endTimeInMinutes - startTimeInMinutes;

    if (totalMinutes <= 0) return;

    // Calcul de l'intervalle entre chaque notification
    // Si count = 1, la seule notification est à startTime
    // Si count > 1, on distribue uniformément entre startTime et endTime
    const interval = count > 1 ? totalMinutes / (count - 1) : 0;
    const days = JSON.parse(reminder.repeatDays || "[1,2,3,4,5,6,7]");

    for (let i = 0; i < selectedQuotes.length; i++) {
      const quote = selectedQuotes[i];
      // Première notification à l'heure exacte, les autres distribuées uniformément
      const timeOffset = i === 0 ? 0 : Math.floor(i * interval);
      const targetTotalMinutes = startTimeInMinutes + timeOffset;
      const hour = Math.floor(targetTotalMinutes / 60);
      const minute = targetTotalMinutes % 60;

      // Planifier pour chaque jour actif
      for (const weekday of days) {
        // Calculer la prochaine date pour ce jour de la semaine
        const nextDate = this.getNextDateForWeekday(weekday, hour, minute);

        // Utiliser un trigger de type "date" qui est supporté sur toutes les plateformes
        const trigger: Notifications.NotificationTriggerInput = {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: nextDate,
          channelId: Platform.OS === "android" ? "default" : undefined,
        };

        await Notifications.scheduleNotificationAsync({
          content: {
            title: reminder.title || "Inspiration du Ninja",
            body: `"${quote.text}" — ${quote.author}`,
            data: {
              type: "quote",
              quoteId: quote.id,
              author: quote.author,
              anime: quote.anime
            },
          },
          trigger,
        });
      }
    }
  },

  /**
   * Planifie un rappel simple (mood ou streak)
   */
  async scheduleSimpleReminder(reminder: any) {
    if (!reminder.enabled) return;

    const [hour, minute] = (reminder.startTime || "08:00").split(":").map(Number);
    const days = JSON.parse(reminder.repeatDays || "[1,2,3,4,5,6,7]");

    // Programmer une notification pour chaque jour actif
    for (const weekday of days) {
      // Calculer la prochaine date pour ce jour de la semaine
      const nextDate = this.getNextDateForWeekday(weekday, hour, minute);

      const trigger: Notifications.NotificationTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: nextDate,
        channelId: Platform.OS === "android" ? "default" : undefined,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.type === "mood" ? "Dojo de Nindo" : "Flamme en danger !",
          body: reminder.type === "mood"
            ? "Quel est ton mood aujourd'hui ?"
            : "Ton streak est sur le point de s'éteindre !",
          data: { type: reminder.type === "mood" ? "mood_reminder" : "streak_danger" },
        },
        trigger,
      });
    }
  },

  /**
   * Met à jour toutes les notifications selon les préférences
   */
  async syncNotifications() {
    const { getReminders } = require("./database");
    const remindersList = await getReminders();

    await this.cancelAllNotifications();

    for (const reminder of remindersList) {
      if (!reminder.enabled) continue;

      if (reminder.type === "quote") {
        await this.scheduleQuoteNotificationsForReminder(reminder);
      } else {
        await this.scheduleSimpleReminder(reminder);
      }
    }
  },

  /**
   * Notification immédiate pour un achievement
   */
  async sendMilestoneNotification(title: string, body: string) {
    const { addNotificationToHistory } = require("./database");
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title || `Nouvel Achievement !`,
        body: body || `Bravo, tu as débloqué un nouveau badge !`,
        data: { type: "milestone" },
      },
      trigger: null,
    });

    await addNotificationToHistory({
      title: title || "Achievement",
      body: body || "Nouveau badge débloqué",
      type: "milestone"
    });
  }
};
