import { MoodQuickSelector } from "@/src/components/mood/MoodQuickSelector";
import { QuoteCard } from "@/src/components/quotes";
import { SettingsModal } from "@/src/components/settings/SettingsModal";
import { StreakBrokenModal } from "@/src/components/streak";
import { AppText } from "@/src/components/ui";
import { AppIcon } from "@/src/components/ui/AppIcon";
import { MOODS } from "@/src/constants";
import { THEMES } from "@/src/constants/themes";
import { useAppStore, useThemeStore } from "@/src/stores";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useRef } from "react";
import { Dimensions, FlatList, TouchableOpacity, View } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Page() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const {
    showMoodSelector,
    setShowMoodSelector,
    showStreakBrokenModal,
    setShowStreakBrokenModal,
    streakResult,
    firstName,
    currentMood,
    setCurrentMood,
    quotes,
    initialRouteName,
  } = useAppStore();

  const flatListRef = useRef<FlatList>(null);

  // GARDE : Ne pas afficher l'accueil si on doit aller vers l'onboarding
  if (initialRouteName === "onboarding") {
    return <View className="flex-1 bg-abyss" />;
  }

  // Filter quotes by mood from preloaded data
  const quotesList = useMemo(() => {
    if (!currentMood) return quotes;
    return quotes.filter((q) => q.mood === currentMood);
  }, [quotes, currentMood]);

  const handleMoodSelected = (moodId: string) => {
    setCurrentMood(moodId);
    setShowMoodSelector(false);
  };

  const handleStreakBrokenClose = () => {
    setShowStreakBrokenModal(false);
  };

  const currentTheme = THEMES[theme] || THEMES.light;

  return (
    <View className="flex-1 bg-abyss">
      {quotesList.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={quotesList}
          keyExtractor={(item) => `${item.id}`}
          renderItem={({ item, index }) => (
            <QuoteCard quote={item} index={index} />
          )}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={SCREEN_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          getItemLayout={(_, index) => ({
            length: SCREEN_HEIGHT,
            offset: SCREEN_HEIGHT * index,
            index,
          })}
          windowSize={3}
          removeClippedSubviews={true}
          contentContainerStyle={{ paddingTop: 0 }}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-10">
          <AppText className="text-5xl mb-6">🏜️</AppText>
          <AppText className="text-xl font-bold text-center text-foreground mb-2">
            Pas de Chakra ici...
          </AppText>
          <AppText className="text-gray-400 text-center">
            Aucune citation disponible pour le moment.
          </AppText>
        </View>
      )}


      {/* Modal Mood - Style identique aux paramètres */}
      <SettingsModal
        visible={showMoodSelector}
        onClose={() => setShowMoodSelector(false)}
        title="Mood Actuel"
      >
        <View className="flex-row items-center mb-6">
          <View className="w-12 h-12 rounded-2xl bg-blue-500/20 items-center justify-center mr-4">
            <AppIcon name="mood_selector" size={24} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <AppText variant="bold" className="text-foreground text-base">Ton état d'esprit</AppText>
            <AppText size="xs" className="text-gray-500">Les citations s'adaptent à tes émotions</AppText>
          </View>
        </View>
        <MoodQuickSelector onMoodChange={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowMoodSelector(false);
        }} />
      </SettingsModal>
      {showStreakBrokenModal && (
        <StreakBrokenModal
          visible={showStreakBrokenModal}
          onClose={handleStreakBrokenClose}
          previousStreak={streakResult?.previousStreak || 0}
          missedDays={streakResult?.missedDays || 0}
        />
      )}

      {/* Boutons Header - Absolute en haut à droite */}
      <View className="absolute top-14 right-6 flex-row gap-3">
        {/* Bouton Mood */}
        <TouchableOpacity
          onPress={() => setShowMoodSelector(true)}
          className="bg-surface p-3 rounded-2xl border border-white/5"
          style={{ borderColor: `${currentTheme.primary}20` }}
        >
          <AppIcon 
            name={MOODS.find(m => m.id === currentMood)?.icon || "mood_selector"} 
            size={22} 
            color={currentTheme.primary} 
          />
        </TouchableOpacity>

        {/* Bouton Dashboard */}
        <TouchableOpacity
          onPress={() => router.push("/general")}
          className="bg-surface p-3 rounded-2xl border border-white/5"
          style={{ borderColor: `${currentTheme.primary}20` }}
        >
          <Ionicons name="apps" size={22} color={currentTheme.foreground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
