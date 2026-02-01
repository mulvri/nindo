# Plan de Tests - Notifications et Rappels Nindo

## Problemes Identifies

### 1. Modal Mood a l'ouverture de l'app
**Symptome**: Le modal de mood ne s'affiche pas a l'ouverture de l'app.

**Cause potentielle dans `AppInitializer.tsx:111-123`**:
```tsx
shouldAskMoodToday().then((shouldAsk) => {
  if (shouldAsk) {
    setTimeout(() => {
      setShowMoodSelector(true);
    }, streakResult?.streakBroken ? 500 : 0);
  }
});
```

**Points de verification**:
- `shouldAskMoodToday()` retourne-t-elle `true` ?
- Le mood a-t-il deja ete selectionne aujourd'hui (`lastMoodDate === today`) ?
- `moodReminderEnabled` est-il `true` ?
- `moodReminderFrequency` est-il different de `"disabled"` ?

### 2. Notifications push ne se declenchent pas
**Symptome**: La notification de 5h n'arrive pas.

**Causes potentielles**:
1. **Permissions refusees** - `requestPermissions()` retourne `false`
2. **Trigger mal configure** - La syntaxe `weekday` n'est peut-etre pas supportee correctement par Expo
3. **Table `reminders` vide ou mal configuree** - Le rappel n'existe pas ou est desactive
4. **`syncNotifications()` non appele** - Les notifications ne sont pas reprogrammees

---

## Tests a Implementer

### TEST 1: Verification des Permissions
**Fichier**: `src/utils/debug/notificationDebug.ts`

```tsx
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

export async function testNotificationPermissions() {
  console.log("=== TEST PERMISSIONS ===");
  console.log("Platform:", Platform.OS);
  console.log("Is real device:", Device.isDevice);

  const { status } = await Notifications.getPermissionsAsync();
  console.log("Permission status:", status);

  return {
    platform: Platform.OS,
    isDevice: Device.isDevice,
    permissionStatus: status,
    canSendNotifications: status === "granted" && Device.isDevice && Platform.OS !== "web"
  };
}
```

### TEST 2: Verification des Rappels en Base
**Fichier**: `src/utils/debug/notificationDebug.ts`

```tsx
import { getReminders, getUserPreferences } from "@/src/services/database";

export async function testRemindersConfiguration() {
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

  console.log("User Prefs:", {
    moodReminderEnabled: prefs?.moodReminderEnabled,
    moodReminderFrequency: prefs?.moodReminderFrequency,
    streakReminderEnabled: prefs?.streakReminderEnabled,
    lastMoodDate: prefs?.lastMoodDate
  });

  const moodReminder = reminders.find(r => r.type === "mood");

  return {
    remindersCount: reminders.length,
    reminders,
    moodReminderExists: !!moodReminder,
    moodReminderEnabled: moodReminder?.enabled,
    moodReminderTime: moodReminder?.startTime,
    userPrefs: {
      moodReminderEnabled: prefs?.moodReminderEnabled,
      moodReminderFrequency: prefs?.moodReminderFrequency,
      lastMoodDate: prefs?.lastMoodDate
    }
  };
}
```

### TEST 3: Verification des Notifications Programmees
**Fichier**: `src/utils/debug/notificationDebug.ts`

```tsx
import * as Notifications from "expo-notifications";

export async function testScheduledNotifications() {
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

  return {
    count: scheduled.length,
    notifications: scheduled.map(n => ({
      id: n.identifier,
      title: n.content.title,
      type: n.content.data?.type,
      trigger: n.trigger
    }))
  };
}
```

### TEST 4: Test de `shouldAskMoodToday()`
**Fichier**: `src/utils/debug/notificationDebug.ts`

```tsx
import { shouldAskMoodToday, getUserPreferences, getTodayMood } from "@/src/services/database";
import { formatDateToYYYYMMDD, getTodayMidnight } from "@/src/utils";

export async function testShouldAskMood() {
  console.log("=== TEST SHOULD ASK MOOD ===");

  const prefs = await getUserPreferences();
  const todayStr = formatDateToYYYYMMDD(getTodayMidnight());
  const shouldAsk = await shouldAskMoodToday();
  const todayMood = await getTodayMood();

  console.log("Today:", todayStr);
  console.log("Last mood date:", prefs?.lastMoodDate);
  console.log("Mood already selected today:", prefs?.lastMoodDate === todayStr);
  console.log("Mood reminder enabled:", prefs?.moodReminderEnabled);
  console.log("Mood frequency:", prefs?.moodReminderFrequency);
  console.log("Should ask mood today:", shouldAsk);
  console.log("Today's mood:", todayMood);

  return {
    today: todayStr,
    lastMoodDate: prefs?.lastMoodDate,
    alreadySelectedToday: prefs?.lastMoodDate === todayStr,
    moodReminderEnabled: prefs?.moodReminderEnabled,
    moodFrequency: prefs?.moodReminderFrequency,
    shouldAskMood: shouldAsk,
    currentMood: todayMood
  };
}
```

### TEST 5: Test d'Envoi de Notification Immediate
**Fichier**: `src/utils/debug/notificationDebug.ts`

```tsx
import * as Notifications from "expo-notifications";

export async function testSendImmediateNotification() {
  console.log("=== TEST IMMEDIATE NOTIFICATION ===");

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Nindo",
        body: "Si tu vois ca, les notifications fonctionnent!",
        data: { type: "test" }
      },
      trigger: null // Envoi immediat
    });

    console.log("Notification envoyee avec ID:", id);
    return { success: true, notificationId: id };
  } catch (error) {
    console.error("Erreur envoi notification:", error);
    return { success: false, error: String(error) };
  }
}
```

### TEST 6: Test de Notification Programmee (5 secondes)
**Fichier**: `src/utils/debug/notificationDebug.ts`

```tsx
import * as Notifications from "expo-notifications";

export async function testScheduledNotification5Seconds() {
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
    return { success: true, notificationId: id, delaySeconds: 5 };
  } catch (error) {
    console.error("Erreur programmation notification:", error);
    return { success: false, error: String(error) };
  }
}
```

### TEST 7: Sync et Verification Complete
**Fichier**: `src/utils/debug/notificationDebug.ts`

```tsx
import { NotificationService } from "@/src/services/NotificationService";

export async function testFullSync() {
  console.log("=== TEST FULL SYNC ===");

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
    beforeCount: beforeScheduled.length,
    afterCount: afterScheduled.length,
    scheduledNotifications: afterScheduled.map(n => ({
      id: n.identifier,
      title: n.content.title,
      type: n.content.data?.type,
      trigger: n.trigger
    }))
  };
}
```

---

## Composant de Debug UI

### Fichier: `src/components/debug/NotificationDebugPanel.tsx`

```tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import {
  testNotificationPermissions,
  testRemindersConfiguration,
  testScheduledNotifications,
  testShouldAskMood,
  testSendImmediateNotification,
  testScheduledNotification5Seconds,
  testFullSync
} from "@/src/utils/debug/notificationDebug";

export function NotificationDebugPanel() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async (testFn: () => Promise<any>, name: string) => {
    setLoading(true);
    try {
      const result = await testFn();
      setResults({ name, ...result });
      Alert.alert("Test Complete", `${name}\n\nVoir les details dans la console.`);
    } catch (error) {
      Alert.alert("Erreur", String(error));
    } finally {
      setLoading(false);
    }
  };

  const tests = [
    { name: "Permissions", fn: testNotificationPermissions },
    { name: "Config Rappels", fn: testRemindersConfiguration },
    { name: "Notifs Programmees", fn: testScheduledNotifications },
    { name: "Should Ask Mood", fn: testShouldAskMood },
    { name: "Notif Immediate", fn: testSendImmediateNotification },
    { name: "Notif 5 secondes", fn: testScheduledNotification5Seconds },
    { name: "Full Sync", fn: testFullSync }
  ];

  const runAllTests = async () => {
    setLoading(true);
    const allResults: any = {};

    for (const test of tests.slice(0, 4)) { // Skip les tests qui envoient des notifs
      try {
        allResults[test.name] = await test.fn();
      } catch (e) {
        allResults[test.name] = { error: String(e) };
      }
    }

    setResults(allResults);
    console.log("=== ALL TEST RESULTS ===", JSON.stringify(allResults, null, 2));
    setLoading(false);
  };

  return (
    <ScrollView className="flex-1 p-4 bg-black">
      <Text className="text-xl font-bold text-white mb-4">Debug Notifications</Text>

      {tests.map((test, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => runTest(test.fn, test.name)}
          disabled={loading}
          className="bg-gray-800 p-4 rounded-lg mb-2"
        >
          <Text className="text-white font-medium">{test.name}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={runAllTests}
        disabled={loading}
        className="bg-orange-500 p-4 rounded-lg mt-4"
      >
        <Text className="text-white font-bold text-center">
          {loading ? "En cours..." : "Lancer tous les diagnostics"}
        </Text>
      </TouchableOpacity>

      {results && (
        <View className="mt-4 bg-gray-900 p-4 rounded-lg">
          <Text className="text-green-400 font-mono text-xs">
            {JSON.stringify(results, null, 2)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
```

---

## Page de Debug Accessible

### Fichier: `app/debug-notifications.tsx`

```tsx
import { NotificationDebugPanel } from "@/src/components/debug/NotificationDebugPanel";
import { Stack } from "expo-router";

export default function DebugNotificationsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Debug Notifications" }} />
      <NotificationDebugPanel />
    </>
  );
}
```

---

## Acces depuis Settings

Ajouter dans `app/settings.tsx` un bouton "Debug Notifications" visible uniquement en dev:

```tsx
{__DEV__ && (
  <TouchableOpacity
    onPress={() => router.push("/debug-notifications")}
    className="bg-red-900 p-4 rounded-lg mt-4"
  >
    <Text className="text-white font-bold">Debug Notifications (DEV)</Text>
  </TouchableOpacity>
)}
```

---

## Problemes Potentiels Identifies

### 1. L'heure du rappel n'est pas verifiee pour le modal
**Fichier**: `src/components/AppInitializer.tsx` et `src/services/database/client.ts`

Le modal s'affiche des l'ouverture de l'app si `shouldAskMoodToday()` retourne `true`.
Il ne verifie PAS l'heure configuree dans le rappel.

**Comportement attendu**: Le modal doit s'afficher **une seule fois par jour**, et seulement **apres l'heure configuree** dans le rappel mood.

**Correction a implementer dans `shouldAskMoodToday()`**:
```tsx
export async function shouldAskMoodToday(): Promise<boolean> {
  const prefs = await getUserPreferences();
  if (!prefs) return false;

  // Si mood deja selectionne aujourd'hui, ne pas demander
  const todayStr = formatDateToYYYYMMDD(getTodayMidnight());
  if (prefs.lastMoodDate === todayStr) {
    return false;
  }

  // Verifier si les rappels mood sont actives
  if (!prefs.moodReminderEnabled || prefs.moodReminderFrequency === "disabled") {
    return false;
  }

  // NOUVEAU: Verifier l'heure configuree dans le rappel mood
  const allReminders = await getReminders();
  const moodReminder = allReminders.find(r => r.type === "mood" && r.enabled);

  if (moodReminder) {
    const [reminderHour, reminderMinute] = (moodReminder.startTime || "08:00").split(":").map(Number);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const reminderMinutes = reminderHour * 60 + reminderMinute;

    // Ne pas afficher le modal avant l'heure configuree
    if (currentMinutes < reminderMinutes) {
      return false;
    }
  }

  // ... reste de la logique de frequence
}
```

### 2. Trigger `weekday` potentiellement non supporte
**Fichier**: `src/services/NotificationService.ts:206-209`

```tsx
const trigger = Platform.OS === "android"
  ? ({ type: "daily", hour, minute, weekday, channelId: "default" } as any)
  : ({ type: "calendar", hour, minute, weekday, repeats: true } as any);
```

Le champ `weekday` dans un trigger `daily` sur Android n'est peut-etre pas supporte.
Expo Notifications utilise:
- Android: `type: "daily"` avec `hour` et `minute` (pas `weekday`)
- iOS: `type: "calendar"` avec `hour`, `minute`, `weekday` et `repeats: true`

**Solution potentielle**: Utiliser `type: "weekly"` avec `weekday` sur Android.

### 3. Migration initiale des rappels
**Fichier**: `src/services/database/client.ts:200-241`

La migration initiale des rappels ne se fait que si la table `reminders` est vide.
Si l'utilisateur a fait l'onboarding AVANT cette migration, les rappels n'existent peut-etre pas.

---

## Actions Recommandees

1. **Implementer les tests de debug** - Creer les fichiers ci-dessus
2. **Lancer les diagnostics** - Identifier exactement ou ca bloque
3. **Corriger les triggers** - Utiliser la bonne syntaxe selon la plateforme
4. **Verifier la migration** - S'assurer que les rappels existent en base
5. **Ajouter des logs detailles** - Dans `syncNotifications()` et `scheduleSimpleReminder()`

---

## Verification Manuelle Rapide

Dans la console de l'app (via Expo Go), executer:

```javascript
// Dans le composant AppInitializer ou settings, ajouter temporairement:
useEffect(() => {
  async function debug() {
    const { getReminders, getUserPreferences } = require("@/src/services/database");
    const Notifications = require("expo-notifications");

    console.log("=== DEBUG NINDO ===");

    const reminders = await getReminders();
    console.log("Reminders:", reminders);

    const prefs = await getUserPreferences();
    console.log("Prefs:", {
      moodReminderEnabled: prefs?.moodReminderEnabled,
      moodReminderFrequency: prefs?.moodReminderFrequency,
      lastMoodDate: prefs?.lastMoodDate
    });

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log("Scheduled notifications:", scheduled.length);
    scheduled.forEach(n => console.log(n.content.title, n.trigger));
  }
  debug();
}, []);
```

---

## Resume

| Test | But | Priorite |
|------|-----|----------|
| Permissions | Verifier que l'app peut envoyer des notifs | HAUTE |
| Config Rappels | Verifier que le rappel mood existe a 5h | HAUTE |
| Notifs Programmees | Voir combien de notifs sont programmees | HAUTE |
| Should Ask Mood | Comprendre pourquoi le modal ne s'affiche pas | HAUTE |
| Notif Immediate | Tester si les notifs fonctionnent du tout | MOYENNE |
| Notif 5 secondes | Tester les notifs programmees | MOYENNE |
| Full Sync | Verifier que syncNotifications() fonctionne | MOYENNE |
