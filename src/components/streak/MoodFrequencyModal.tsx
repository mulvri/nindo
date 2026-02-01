import { AppPoppinsText as AppText } from "@/src/components/ui/AppText";
import { THEMES } from "@/src/constants/themes";
import { getReminders, saveUserPreferences, updateReminder } from "@/src/services/database";
import { NotificationService } from "@/src/services/NotificationService";
import { useAppStore, useThemeStore } from "@/src/stores";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface MoodFrequencyModalProps {
  visible: boolean;
  onClose: () => void;
}

type FrequencyOption = "daily" | "2days" | "3weekly" | "weekly" | "disabled";

const FREQUENCY_OPTIONS: { id: FrequencyOption; label: string; description: string; icon: string }[] = [
  { id: "daily", label: "Chaque jour", description: "Suivi quotidien de ton humeur", icon: "sunny" },
  { id: "2days", label: "Tous les 2 jours", description: "Un check-in léger", icon: "partly-sunny" },
  { id: "3weekly", label: "3 fois par semaine", description: "Lun, Mer, Ven", icon: "calendar" },
  { id: "weekly", label: "Une fois par semaine", description: "Check-in hebdomadaire", icon: "calendar-outline" },
  { id: "disabled", label: "Désactivé", description: "Ne plus me demander", icon: "notifications-off" },
];

export function MoodFrequencyModal({ visible, onClose }: MoodFrequencyModalProps) {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const { userPrefs, setUserPrefs } = useAppStore();
  const insets = useSafeAreaInsets();

  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyOption>(
    (userPrefs?.moodReminderFrequency as FrequencyOption) || "daily"
  );
  const [saving, setSaving] = useState(false);

  const handleSelect = async (frequency: FrequencyOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFrequency(frequency);
  };

  const handleSave = async () => {
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const isEnabled = selectedFrequency !== "disabled";

    await saveUserPreferences({
      moodReminderFrequency: selectedFrequency,
      moodReminderEnabled: isEnabled
    });

    if (userPrefs) {
      setUserPrefs({
        ...userPrefs,
        moodReminderFrequency: selectedFrequency,
        moodReminderEnabled: isEnabled
      });
    }

    // Synchroniser avec la table reminders
    const remindersList = await getReminders();
    const moodReminder = remindersList.find((r: any) => r.type === "mood");
    if (moodReminder) {
      // Convertir la fréquence en repeatDays
      let repeatDays: number[];
      switch (selectedFrequency) {
        case "daily":
          repeatDays = [1, 2, 3, 4, 5, 6, 7];
          break;
        case "2days":
          repeatDays = [1, 3, 5, 7]; // Lun, Mer, Ven, Dim
          break;
        case "3weekly":
          repeatDays = [1, 3, 5]; // Lun, Mer, Ven
          break;
        case "weekly":
          repeatDays = [1]; // Lundi
          break;
        default:
          repeatDays = [];
      }

      await updateReminder(moodReminder.id, {
        enabled: isEnabled,
        repeatDays: JSON.stringify(repeatDays)
      });
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
            <View className="flex-row items-center mb-2">
              
              <View>
                <AppText variant="black" size="2xl" className="text-foreground">
                  Fréquence du Mood
                </AppText>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
              <View className="gap-3">
                {FREQUENCY_OPTIONS.map((option) => {
                  const isSelected = selectedFrequency === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => handleSelect(option.id)}
                      className={`flex-row items-center p-4 rounded-3xl ${
                        isSelected ? "" : "bg-abyss border border-white/10"
                      }`}
                      style={isSelected ? {
                        backgroundColor: currentTheme.primary,
                      } : undefined}
                    >
                      <View
                        className={`w-10 h-10 rounded-2xl items-center justify-center mr-4 ${
                          isSelected ? "bg-white/20" : "bg-primary/10"
                        }`}
                      >
                        <Ionicons
                          name={option.icon as any}
                          size={20}
                          color={isSelected ? "#fff" : currentTheme.primary}
                        />
                      </View>
                      <View className="flex-1">
                        <AppText
                          variant="bold"
                          size="base"
                          className={isSelected ? "text-white" : "text-foreground"}
                        >
                          {option.label}
                        </AppText>
                        <AppText size="xs" className={isSelected ? "text-white/70" : "text-gray-500"}>
                          {option.description}
                        </AppText>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={24} color="#fff" />
                      )}
                    </TouchableOpacity>
                  );
                })}
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
