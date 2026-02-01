import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getReminders, getUserPreferences, getTodayMood } from "@/src/services/database";
import { NotificationService } from "@/src/services/NotificationService";
import { formatDateToYYYYMMDD, getTodayMidnight } from "@/src/utils";

export interface DebugResult {
  success: boolean;
  [key: string]: any;
}

/**
 * TEST 1: Verification des permissions de notification
 */
export async function testNotificationPermissions(): Promise<DebugResult> {
  console.log("=== TEST PERMISSIONS ===");
  console.log("Platform:", Platform.OS);
  console.log("Is real device:", Device.isDevice);

  const { status } = await Notifications.getPermissionsAsync();
  console.log("Permission status:", status);

  const canSend = status === "granted" && Device.isDevice && Platform.OS !== "web";

  return {
    success: canSend,
    platform: Platform.OS,
    isDevice: Device.isDevice,
    permissionStatus: status,
    canSendNotifications: canSend,
    message: canSend
      ? "Les notifications sont activees"
      : `Probleme: ${!Device.isDevice ? "Simulateur detecte" : status !== "granted" ? "Permission refusee" : "Web non supporte"}`
  };
}

/**
 * TEST 2: Verification de la configuration des rappels en base
 */
export async function testRemindersConfiguration(): Promise<DebugResult> {
  console.log("=== TEST REMINDERS CONFIG ===");

  const reminders = await getReminders();
  const prefs = await getUserPreferences();

  console.log("Nombre de rappels:", reminders.length);
  reminders.forEach((r, i) => {
    console.log(`Rappel ${i + 1}:`, {
      type: r.type,
      enabled: r.enabled,
      startTime: r.startTime,
      repeatDays: r.repeatDays,
      count: r.count
    });
  });

  const moodReminder = reminders.find(r => r.type === "mood");
  const streakReminder = reminders.find(r => r.type === "streak");
  const quoteReminder = reminders.find(r => r.type === "quote");

  console.log("User Prefs:", {
    moodReminderEnabled: prefs?.moodReminderEnabled,
    moodReminderFrequency: prefs?.moodReminderFrequency,
    streakReminderEnabled: prefs?.streakReminderEnabled,
    lastMoodDate: prefs?.lastMoodDate
  });

  const issues: string[] = [];
  if (reminders.length === 0) issues.push("Aucun rappel en base");
  if (!moodReminder) issues.push("Rappel mood manquant");
  if (moodReminder && !moodReminder.enabled) issues.push("Rappel mood desactive");
  if (!prefs?.moodReminderEnabled) issues.push("moodReminderEnabled = false dans userPrefs");
  if (prefs?.moodReminderFrequency === "disabled") issues.push("moodReminderFrequency = disabled");

  return {
    success: issues.length === 0,
    remindersCount: reminders.length,
    reminders: reminders.map(r => ({
      type: r.type,
      enabled: r.enabled,
      startTime: r.startTime,
      endTime: r.endTime,
      repeatDays: r.repeatDays,
      count: r.count
    })),
    moodReminder: moodReminder ? {
      exists: true,
      enabled: moodReminder.enabled,
      time: moodReminder.startTime,
      days: moodReminder.repeatDays
    } : { exists: false },
    streakReminder: streakReminder ? {
      exists: true,
      enabled: streakReminder.enabled,
      time: streakReminder.startTime
    } : { exists: false },
    quoteReminder: quoteReminder ? {
      exists: true,
      enabled: quoteReminder.enabled,
      count: quoteReminder.count
    } : { exists: false },
    userPrefs: {
      moodReminderEnabled: prefs?.moodReminderEnabled,
      moodReminderFrequency: prefs?.moodReminderFrequency,
      streakReminderEnabled: prefs?.streakReminderEnabled,
      lastMoodDate: prefs?.lastMoodDate
    },
    issues,
    message: issues.length === 0
      ? "Configuration OK"
      : `Problemes: ${issues.join(", ")}`
  };
}

/**
 * TEST 3: Verification des notifications actuellement programmees
 */
export async function testScheduledNotifications(): Promise<DebugResult> {
  console.log("=== TEST SCHEDULED NOTIFICATIONS ===");

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  console.log("Nombre de notifications programmees:", scheduled.length);
  scheduled.forEach((n, i) => {
    console.log(`Notification ${i + 1}:`, {
      id: n.identifier,
      title: n.content.title,
      body: n.content.body?.substring(0, 50),
      trigger: n.trigger,
      data: n.content.data
    });
  });

  const moodNotifs = scheduled.filter(n => n.content.data?.type === "mood_reminder");
  const streakNotifs = scheduled.filter(n => n.content.data?.type === "streak_danger");
  const quoteNotifs = scheduled.filter(n => n.content.data?.type === "quote");

  return {
    success: scheduled.length > 0,
    totalCount: scheduled.length,
    moodNotificationsCount: moodNotifs.length,
    streakNotificationsCount: streakNotifs.length,
    quoteNotificationsCount: quoteNotifs.length,
    notifications: scheduled.map(n => ({
      id: n.identifier,
      title: n.content.title,
      type: n.content.data?.type,
      trigger: n.trigger
    })),
    message: scheduled.length > 0
      ? `${scheduled.length} notification(s) programmee(s)`
      : "Aucune notification programmee!"
  };
}

/**
 * TEST 4: Test de la logique shouldAskMoodToday
 */
export async function testShouldAskMood(): Promise<DebugResult> {
  console.log("=== TEST SHOULD ASK MOOD ===");

  const prefs = await getUserPreferences();
  const todayStr = formatDateToYYYYMMDD(getTodayMidnight());
  const todayMood = await getTodayMood();
  const reminders = await getReminders();
  const moodReminder = reminders.find(r => r.type === "mood");

  const now = new Date();
  const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  // Calculer si l'heure du rappel est passee
  let reminderTimePassed = true;
  if (moodReminder?.startTime) {
    const [reminderHour, reminderMinute] = moodReminder.startTime.split(":").map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const reminderMinutes = reminderHour * 60 + reminderMinute;
    reminderTimePassed = currentMinutes >= reminderMinutes;
  }

  const alreadySelectedToday = prefs?.lastMoodDate === todayStr;
  const moodEnabled = prefs?.moodReminderEnabled !== false;
  const frequencyOk = prefs?.moodReminderFrequency !== "disabled";

  // Logique actuelle (sans verification d'heure)
  const wouldShowWithCurrentLogic = !alreadySelectedToday && moodEnabled && frequencyOk;

  // Logique corrigee (avec verification d'heure)
  const shouldShowWithFixedLogic = wouldShowWithCurrentLogic && reminderTimePassed;

  console.log("Today:", todayStr);
  console.log("Current time:", currentTimeStr);
  console.log("Reminder time:", moodReminder?.startTime);
  console.log("Reminder time passed:", reminderTimePassed);
  console.log("Last mood date:", prefs?.lastMoodDate);
  console.log("Already selected today:", alreadySelectedToday);
  console.log("Mood reminder enabled:", moodEnabled);
  console.log("Frequency:", prefs?.moodReminderFrequency);
  console.log("Would show (current logic):", wouldShowWithCurrentLogic);
  console.log("Should show (fixed logic):", shouldShowWithFixedLogic);

  const issues: string[] = [];
  if (alreadySelectedToday) issues.push("Mood deja selectionne aujourd'hui");
  if (!moodEnabled) issues.push("moodReminderEnabled = false");
  if (!frequencyOk) issues.push("Frequence = disabled");
  if (!reminderTimePassed) issues.push(`Heure du rappel (${moodReminder?.startTime}) pas encore passee`);
  if (!moodReminder) issues.push("Pas de rappel mood en base");

  return {
    success: shouldShowWithFixedLogic,
    today: todayStr,
    currentTime: currentTimeStr,
    reminderTime: moodReminder?.startTime || "N/A",
    reminderTimePassed,
    lastMoodDate: prefs?.lastMoodDate,
    alreadySelectedToday,
    moodReminderEnabled: moodEnabled,
    moodFrequency: prefs?.moodReminderFrequency,
    currentMood: todayMood,
    wouldShowWithCurrentLogic,
    shouldShowWithFixedLogic,
    issues,
    message: issues.length === 0
      ? "Le modal devrait s'afficher"
      : `Le modal ne s'affiche pas car: ${issues.join(", ")}`
  };
}

/**
 * TEST 5: Envoi d'une notification immediate
 */
export async function testSendImmediateNotification(): Promise<DebugResult> {
  console.log("=== TEST IMMEDIATE NOTIFICATION ===");

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Nindo",
        body: "Si tu vois ca, les notifications fonctionnent!",
        data: { type: "test" }
      },
      trigger: null
    });

    console.log("Notification envoyee avec ID:", id);
    return {
      success: true,
      notificationId: id,
      message: "Notification envoyee! Verifie si elle apparait."
    };
  } catch (error) {
    console.error("Erreur envoi notification:", error);
    return {
      success: false,
      error: String(error),
      message: `Erreur: ${error}`
    };
  }
}

/**
 * TEST 6: Notification programmee dans 5 secondes
 */
export async function testScheduledNotification5Seconds(): Promise<DebugResult> {
  console.log("=== TEST SCHEDULED NOTIFICATION (5s) ===");

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Rappel Nindo",
        body: "Cette notification etait programmee pour dans 5 secondes!",
        data: { type: "test_scheduled" }
      },
      trigger: {
        type: "timeInterval",
        seconds: 5
      } as any
    });

    console.log("Notification programmee pour 5s avec ID:", id);
    return {
      success: true,
      notificationId: id,
      delaySeconds: 5,
      message: "Notification programmee! Elle arrivera dans 5 secondes."
    };
  } catch (error) {
    console.error("Erreur programmation notification:", error);
    return {
      success: false,
      error: String(error),
      message: `Erreur: ${error}`
    };
  }
}

/**
 * TEST 7: Sync complet et verification
 */
export async function testFullSync(): Promise<DebugResult> {
  console.log("=== TEST FULL SYNC ===");

  try {
    // 1. Avant sync
    const beforeScheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log("Avant sync - notifications:", beforeScheduled.length);

    // 2. Sync
    await NotificationService.syncNotifications();
    console.log("Sync effectue");

    // 3. Apres sync
    const afterScheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log("Apres sync - notifications:", afterScheduled.length);

    return {
      success: afterScheduled.length > 0,
      beforeCount: beforeScheduled.length,
      afterCount: afterScheduled.length,
      difference: afterScheduled.length - beforeScheduled.length,
      scheduledNotifications: afterScheduled.map(n => ({
        id: n.identifier,
        title: n.content.title,
        type: n.content.data?.type,
        trigger: n.trigger
      })),
      message: afterScheduled.length > 0
        ? `Sync OK: ${afterScheduled.length} notification(s) programmee(s)`
        : "Sync termine mais aucune notification programmee"
    };
  } catch (error) {
    console.error("Erreur sync:", error);
    return {
      success: false,
      error: String(error),
      message: `Erreur sync: ${error}`
    };
  }
}

/**
 * Lancer tous les diagnostics (sauf ceux qui envoient des notifs)
 */
export async function runAllDiagnostics(): Promise<Record<string, DebugResult>> {
  console.log("=== RUNNING ALL DIAGNOSTICS ===");

  const results: Record<string, DebugResult> = {};

  results.permissions = await testNotificationPermissions();
  results.remindersConfig = await testRemindersConfiguration();
  results.scheduledNotifications = await testScheduledNotifications();
  results.shouldAskMood = await testShouldAskMood();

  console.log("=== ALL DIAGNOSTICS COMPLETE ===");
  console.log(JSON.stringify(results, null, 2));

  return results;
}
