import { ACHIEVEMENT_DEFINITIONS, AchievementBadge, AchievementHelpModal } from "@/src/components/achievements";
import { AppText, ScreenHeader } from "@/src/components/ui";
import { THEMES } from "@/src/constants/themes";
import { getUnlockedAchievements } from "@/src/services/database";
import { useThemeStore } from "@/src/stores";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Achievement {
  id: number;
  achievementId: string;
  unlockedAt: string;
  notified: boolean | null;
}

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const achievements = await getUnlockedAchievements();
      setUnlockedAchievements(achievements);
    } catch (error) {
      console.error("Failed to load achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalAchievements = Object.keys(ACHIEVEMENT_DEFINITIONS).length;
  const unlockedCount = unlockedAchievements.length;
  const progressPercentage = (unlockedCount / totalAchievements) * 100;

  return (
    <View className="flex-1 bg-abyss" style={{ paddingTop: insets.top }}>
      <ScreenHeader 
        title="Exploits" 
        badge={{
          value: `${unlockedCount}/${totalAchievements}`,
          color: currentTheme.primary
        }}
      />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Progress Card - More compact */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(500)}
          className="bg-surface rounded-3xl p-5 mt-4 mb-6 border border-white/5"
          style={{ borderColor: `${currentTheme.primary}20` }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <AppText variant="bold" size="xs" className="text-gray-500 mb-0.5 uppercase tracking-wider">
                Progression
              </AppText>
              <AppText variant="black" size="3xl" className="text-foreground tracking-tighter">
                {Math.round(progressPercentage)}%
              </AppText>
            </View>
            <View 
              className="w-12 h-12 rounded-2xl items-center justify-center border border-white/10"
              style={{ backgroundColor: `${currentTheme.primary}15`, borderColor: `${currentTheme.primary}30` }}
            >
              <Ionicons name="trophy" size={24} color={currentTheme.primary} />
            </View>
          </View>

          {/* Progress Bar Container - Thinner */}
          <View className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
            <View
              className="h-full rounded-full"
              style={{ 
                width: `${Math.max(progressPercentage, 5)}%`, 
                backgroundColor: currentTheme.primary,
              }}
            />
          </View>
        </Animated.View>


        {/* Collection Section */}
        <View className="mb-4 flex-row items-center justify-between">
          <AppText variant="black" size="xl" className="text-foreground uppercase tracking-tight">
            Ma Collection
          </AppText>
        </View>

        <View className="flex-row flex-wrap mb-10">
          {Object.entries(ACHIEVEMENT_DEFINITIONS)
            .sort(([, a], [, b]) => a.streakRequired - b.streakRequired)
            .map(([key, achievement], index) => {
              const unlocked = unlockedAchievements.find(
                (a) => a.achievementId === achievement.id
              );

              return (
                <Animated.View 
                  key={key} 
                  entering={FadeInDown.delay(200 + index * 50).duration(500)}
                  className="items-center mb-6"
                  style={{ width: '33.33%' }}
                >
                  <AchievementBadge
                    achievementId={achievement.id}
                    unlocked={!!unlocked}
                    unlockedAt={unlocked?.unlockedAt}
                    size="medium"
                    showTitle={false}
                  />
                </Animated.View>
              );
            })}
        </View>

        {/* Motivation Section */}
        {unlockedCount < totalAchievements && (
          <Animated.View 
            entering={FadeInDown.delay(600).duration(500)}
            className="mb-12 bg-surface rounded-3xl p-6 border border-white/5"
            style={{ borderColor: `${currentTheme.primary}10` }}
          >
            <View className="flex-row items-start">
              <View 
                className="w-10 h-10 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${currentTheme.primary}20` }}
              >
                <Ionicons name="sparkles" size={20} color={currentTheme.primary} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <AppText variant="bold" size="base" className="text-foreground mb-1">
                    Continue ton Nindo !
                  </AppText>
                  <Pressable 
                    onPress={() => setShowHelp(true)}
                    className="p-1 -mr-2 -mt-2 opacity-80 active:opacity-100"
                  >
                    <Ionicons name="help-circle-outline" size={22} color={currentTheme.primary} />
                  </Pressable>
                </View>
                <AppText size="xs" className="text-gray-400 leading-5 pr-2">
                  Chaque jour d'entraînement te rapproche de la légende. Maintiens ton streak pour
                  débloquer de nouveaux exploits ! 🔥
                </AppText>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>
      
      <AchievementHelpModal 
        visible={showHelp} 
        onClose={() => setShowHelp(false)} 
      />
    </View>
  );
}
