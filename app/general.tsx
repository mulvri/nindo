import { MoodFrequencyModal, StreakCard, StreakSettingsModal } from "@/src/components/streak";
import { AppText, NavigationCard, ScreenHeader } from "@/src/components/ui";
import { useAppStore, useThemeStore } from "@/src/stores";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function GeneralScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const { streakCount, bestStreak, streakHistory, userStats } = useAppStore();
  const router = useRouter();
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [showStreakSettings, setShowStreakSettings] = useState(false);

  return (
    <View className="flex-1 bg-abyss" style={{ paddingTop: insets.top }}>
      <ScreenHeader
        title="Général"
        rightAction={{
          icon: "settings-outline",
          onPress: () => router.push("/settings"),
          useIonicons: true,
        }}
      />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Streak Section */}
        <AppText variant="black" size="xl" className="text-foreground uppercase mb-4 tracking-tight">
          Streak
        </AppText>
        <Animated.View entering={FadeInDown.duration(500)} className="mb-6">
          <StreakCard
            streakCount={streakCount}
            bestStreak={bestStreak}
            history={streakHistory}
            onPress={() => setShowStreakSettings(true)}
          />
        </Animated.View>

        {/* Navigation Cards */}
        <NavigationCard
          title="Centre d'Entraînement"
          subtitle="Retrouve tes doses d'inspiration"
          icon="notifications"
          variant="primary"
          onPress={() => router.push("/notification-center")}
          className="mb-4"
        />

        <NavigationCard
          title="Mes Favoris"
          subtitle={`${userStats?.totalFavorites || 0} citations sauvegardées`}
          icon="heart"
          variant="primary"
          onPress={() => router.push("/favorites")}
          className="mb-4"
        />

        <NavigationCard
          title="Mood Evolution"
          subtitle="Ton parcours émotionnel"
          icon="stats-chart"
          variant="outlined"
          onPress={() => router.push("/mood-history")}
          className="mb-4"
        />

        <NavigationCard
          title="Mes Créations"
          subtitle="Tes citations personnelles"
          icon="document-text"
          variant="outlined"
          onPress={() => router.push("/my-quotes")}
          className="mb-10"
        />
      </ScrollView>

      {/* Modal de fréquence du mood */}
      <MoodFrequencyModal
        visible={showFrequencyModal}
        onClose={() => setShowFrequencyModal(false)}
      />

      {/* Modal paramètres de série */}
      <StreakSettingsModal
        visible={showStreakSettings}
        onClose={() => setShowStreakSettings(false)}
      />
    </View>
  );
}
