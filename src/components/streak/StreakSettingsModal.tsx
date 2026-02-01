import { AppPoppinsText as AppText } from "@/src/components/ui/AppText";
import { THEMES } from "@/src/constants/themes";
import { getReminders, saveUserPreferences, updateReminder } from "@/src/services/database";
import { NotificationService } from "@/src/services/NotificationService";
import { useAppStore, useThemeStore } from "@/src/stores";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "../ui/AppIcon";

interface StreakSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function StreakSettingsModal({ visible, onClose }: StreakSettingsModalProps) {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const { userPrefs, setUserPrefs } = useAppStore();
  const insets = useSafeAreaInsets();

  const [streakEnabled, setStreakEnabled] = useState(userPrefs?.streakReminderEnabled !== false);
  const [reminderEnabled, setReminderEnabled] = useState(userPrefs?.streakReminderEnabled ?? true);
  const [saving, setSaving] = useState(false);

  const handleToggleStreak = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = !streakEnabled;
    setStreakEnabled(newValue);
    if (!newValue) {
      setReminderEnabled(false);
    }
  };

  const handleToggleReminder = () => {
    if (!streakEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReminderEnabled(!reminderEnabled);
  };

  const handleSave = async () => {
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const isEnabled = streakEnabled && reminderEnabled;

    await saveUserPreferences({
      streakReminderEnabled: isEnabled,
    });

    if (userPrefs) {
      setUserPrefs({
        ...userPrefs,
        streakReminderEnabled: isEnabled,
      });
    }

    // Synchroniser avec la table reminders
    const remindersList = await getReminders();
    const streakReminder = remindersList.find((r: any) => r.type === "streak");
    if (streakReminder) {
      await updateReminder(streakReminder.id, { enabled: isEnabled });
    }

    // Resynchroniser les notifications
    await NotificationService.syncNotifications();

    setSaving(false);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 bg-black/70"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(350).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(300).easing(Easing.in(Easing.cubic))}
          className="bg-surface rounded-t-[32px] w-full"
          style={{ 
            maxHeight: "85%",
            marginBottom: -50,
            paddingBottom: Math.max(insets.bottom, 24) + 50,
          }}
        >
          <View className="w-12 h-1.5 bg-gray-600/30 rounded-full self-center mt-3 mb-6" />

          <View className="px-6">
            <View className="flex-row items-center mb-6">
              
              <View>
                <AppText variant="black" size="2xl" className="text-foreground">
                  Paramètres de Série
                </AppText>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                onPress={handleToggleStreak}
                className={`flex-row items-center justify-between p-4 rounded-3xl mb-4 ${
                  streakEnabled ? "" : "bg-abyss border border-white/10"
                }`}
                style={streakEnabled ? { backgroundColor: currentTheme.primary } : undefined}
              >
                <View className="flex-row items-center flex-1">
                  <View className={`w-12 h-12 rounded-3xl items-center justify-center mr-4 ${streakEnabled ? "bg-white/20" : "bg-primary/20"}`}>
                    <AppIcon name="streak_active" size={24} color={streakEnabled ? "#fff" : currentTheme.primary} />
                  </View>
                  <View className="flex-1">
                    <AppText variant="bold" className={`text-base ${streakEnabled ? "text-white" : "text-foreground"}`}>
                      Suivre la série
                    </AppText>
                    <AppText size="xs" className={streakEnabled ? "text-white/70" : "text-gray-500"}>
                      Maintiens ta motivation jour après jour
                    </AppText>
                  </View>
                </View>
                <View
                  className={`w-14 h-8 rounded-full px-1 justify-center ${
                    streakEnabled ? "bg-white/20" : "bg-gray-600"
                  }`}
                >
                  <View
                    className="w-6 h-6 rounded-full bg-white shadow"
                    style={{ transform: [{ translateX: streakEnabled ? 22 : 0 }] }}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleToggleReminder}
                disabled={!streakEnabled}
                className={`flex-row items-center justify-between p-4 rounded-3xl mb-2 ${
                  !streakEnabled ? "opacity-30" : (reminderEnabled ? "" : "bg-abyss border border-white/10")
                }`}
                style={reminderEnabled && streakEnabled ? { backgroundColor: currentTheme.primary } : undefined}
              >
                <View className="flex-row items-center flex-1">
                  <View className={`w-12 h-12 rounded-3xl items-center justify-center mr-4 ${reminderEnabled && streakEnabled ? "bg-white/20" : "bg-primary/20"}`}>
                    <AppIcon name="notification" size={24} color={reminderEnabled && streakEnabled ? "#fff" : currentTheme.primary} />
                  </View>
                  <View className="flex-1">
                    <AppText variant="bold" className={`text-base ${reminderEnabled && streakEnabled ? "text-white" : "text-foreground"}`}>
                      Rappel de série
                    </AppText>
                    <AppText size="xs" className={reminderEnabled && streakEnabled ? "text-white/70" : "text-gray-500"}>
                      Notification si tu n'as pas validé
                    </AppText>
                  </View>
                </View>
                <View
                  className={`w-14 h-8 rounded-full px-1 justify-center ${
                    reminderEnabled && streakEnabled ? "bg-white/20" : "bg-gray-600"
                  }`}
                >
                  <View
                    className="w-6 h-6 rounded-full bg-white shadow"
                    style={{ transform: [{ translateX: reminderEnabled && streakEnabled ? 22 : 0 }] }}
                  />
                </View>
              </TouchableOpacity>

              <View 
                className="mt-4 p-4 rounded-3xl bg-surface border border-white/5"
                style={{ borderColor: `${currentTheme.primary}20` }}
              >
                <AppText variant="black" size="xs" className="text-gray-500 text-center leading-5 uppercase tracking-widest pl-1 mb-1">Information</AppText>
                <AppText size="xs" className="text-gray-500 text-center leading-5">
                  Le rappel ne s'affiche que si tu n'as pas encore ouvert l'app dans la journée.
                </AppText>
              </View>

              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="mt-6 mb-1 py-4 rounded-2xl items-center"
                style={{ backgroundColor: currentTheme.primary }}
              >
                <AppText variant="black" size="lg" className="text-white uppercase tracking-wide">
                  {saving ? "Enregistrement..." : "Confirmer"}
                </AppText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
