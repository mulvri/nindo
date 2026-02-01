import { AppText } from "@/src/components/ui/AppText";
import { MOODS } from "@/src/constants/onboarding";
import { THEMES } from "@/src/constants/themes";
import { selectDailyMood } from "@/src/services/database";
import { useAppStore, useThemeStore } from "@/src/stores";
import * as Haptics from "expo-haptics";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface MoodQuickSelectorProps {
  onMoodChange?: (moodId: string) => void;
}

export function MoodQuickSelector({ onMoodChange }: MoodQuickSelectorProps) {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const { userPrefs, setCurrentMood, setUserPrefs } = useAppStore();
  const currentMood = userPrefs?.currentDayMood;

  const handleSelectMood = async (moodId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Sauvegarder en base
    await selectDailyMood(moodId, "app");

    // Mettre à jour le store
    setCurrentMood(moodId);

    // Mettre à jour les prefs locales
    if (userPrefs) {
      setUserPrefs({
        ...userPrefs,
        currentDayMood: moodId,
      });
    }

    // Callback optionnel
    onMoodChange?.(moodId);
  };

  return (
    <View className="flex-row flex-wrap gap-2">
      {MOODS.map((mood) => {
        const isSelected = currentMood === mood.id;
        return (
          <TouchableOpacity
            key={mood.id}
            onPress={() => handleSelectMood(mood.id)}
            className={`px-3 py-2 rounded-3xl flex-row items-center ${
              isSelected ? "" : "bg-abyss border border-white/10"
            }`}
            style={isSelected ? { backgroundColor: currentTheme.primary } : undefined}
          >
            <AppText className="mr-1">{mood.emoji}</AppText>
            <AppText
              variant="bold"
              size="xs"
              className={`${
                isSelected ? "text-white" : "text-gray-400"
              }`}
            >
              {mood.name}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
