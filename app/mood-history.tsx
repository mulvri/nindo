import { MoodCalendar, MoodStats, MoodTrendGraph } from "@/src/components/mood";
import { AppText, ScreenHeader } from "@/src/components/ui";
import { THEMES } from "@/src/constants/themes";
import { useThemeStore } from "@/src/stores";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MoodHistoryScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();

  const currentTheme = THEMES[theme] || THEMES.light;

  return (
    <SafeAreaView className="flex-1 bg-abyss">
      {/* Header */}
      <ScreenHeader title="Historique" />

      <ScrollView className="flex-1 px-6 py-6">
        {/* Statistiques */}
        <View className="mb-6">
          <MoodStats />
        </View>

        {/* Graphique de tendance */}
        <View className="mb-6">
          <MoodTrendGraph />
        </View>

        {/* Calendrier */}
        <View>
          <MoodCalendar />
        </View>

        {/* Info Card */}
        <View
          className="mt-6 mb-10 bg-surface rounded-3xl p-5 border border-white/5"
          style={{ borderColor: `${currentTheme.primary}20` }}
        >
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={24} color="#4ECDC4" />
            <View className="flex-1 ml-3">
              <AppText variant="bold" size="sm" className="text-foreground mb-2">
                À propos de tes moods
              </AppText>
              <AppText size="xs" className="text-gray-400 leading-5">
                Chaque jour, sélectionne ton mood pour recevoir des citations adaptées à ton état
                d'esprit. Ton calendrier te montre l'évolution de tes émotions dans le temps. 🎭
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
