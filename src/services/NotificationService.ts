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

export const NotificationService = {
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
   * Planifie les notifications de citations pour un rappel spécifique
   */
  async scheduleQuoteNotificationsForReminder(reminder: any) {
    if (!reminder.enabled || reminder.count === 0) return;

    const { getFilteredQuotes } = require("./database");
    let allQuotes = await getFilteredQuotes();
    
    if (reminder.category && reminder.category !== "General") {
      // Pour l'instant on filtre par mood si la catégorie match
      allQuotes = allQuotes.filter((q: any) => q.mood === reminder.category);
    }

    if (allQuotes.length === 0) return;

    // Mélanger et prendre 'count' citations
    const selectedQuotes = allQuotes.sort(() => 0.5 - Math.random()).slice(0, reminder.count);

    // Répartir sur la plage horaire
    const [startH, startM] = (reminder.startTime || "09:00").split(":").map(Number);
    const [endH, endM] = (reminder.endTime || "21:00").split(":").map(Number);
    
    const startTimeInMinutes = startH * 60 + startM;
    const endTimeInMinutes = endH * 60 + endM;
    const totalMinutes = endTimeInMinutes - startTimeInMinutes;
    
    if (totalMinutes <= 0) return;

    const interval = totalMinutes / reminder.count;
    const days = JSON.parse(reminder.repeatDays || "[1,2,3,4,5,6,7]");

    for (let i = 0; i < selectedQuotes.length; i++) {
      const quote = selectedQuotes[i];
      const timeOffset = Math.floor(i * interval + Math.random() * (interval * 0.5));
      const targetTotalMinutes = startTimeInMinutes + timeOffset;
      const hour = Math.floor(targetTotalMinutes / 60);
      const minute = targetTotalMinutes % 60;

      // Planifier pour chaque jour actif
      for (const weekday of days) {
        const trigger = Platform.OS === "android"
          ? ({
              type: "daily",
              hour,
              minute,
              weekday, // Expo Notifications supports weekday for daily on Android? Check docs. Usually it's 'day' for weekly.
              channelId: "default",
            } as any)
          : ({
              type: "calendar",
              hour,
              minute,
              weekday, 
              repeats: true,
            } as any);

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

    for (const weekday of days) {
      const trigger = Platform.OS === "android"
        ? ({ type: "daily", hour, minute, weekday, channelId: "default" } as any)
        : ({ type: "calendar", hour, minute, weekday, repeats: true } as any);

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
