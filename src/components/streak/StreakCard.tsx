import { AppText } from "@/src/components/ui";
import { THEMES } from "@/src/constants/themes";
import { StreakHistory } from "@/src/services/database";
import { useThemeStore } from "@/src/stores";
import { getFlameSize, getStreakMotivationMessage } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { AppIcon } from "../ui/AppIcon";

interface StreakCardProps {
  streakCount: number;
  bestStreak: number;
  history?: StreakHistory[];
  daysToShow?: number;
  onPress?: () => void;
}

interface DayData {
  date: Date;
  dateStr: string;
  status: "completed" | "missed" | "grace" | "future" | "today" | "unknown";
  isToday: boolean;
}

const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function StreakCard({ streakCount, bestStreak, history, daysToShow = 7, onPress }: StreakCardProps) {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const flameScale = useSharedValue(1);
  const flameRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  // Calculate days for calendar
  const days = useMemo(() => {
    if (!history) return [];

    const result: DayData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const historyMap = new Map<string, StreakHistory>();
    for (const entry of history) {
      historyMap.set(entry.date, entry);
    }

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const isToday = i === 0;

      const historyEntry = historyMap.get(dateStr);

      let status: DayData["status"];
      if (isToday) {
        status = historyEntry ? historyEntry.status as DayData["status"] : "today";
      } else if (historyEntry) {
        status = historyEntry.status as DayData["status"];
      } else {
        status = "unknown";
      }

      result.push({ date, dateStr, status, isToday });
    }

    return result;
  }, [history, daysToShow]);

  // Animate flame based on streak count
  useEffect(() => {
    const baseScale = Math.min(1 + streakCount * 0.02, 1.5);
    flameScale.value = withSpring(baseScale);

    flameRotation.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(3, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1000 }),
        withTiming(0.2, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [streakCount]);

  const flameAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: flameScale.value },
      { rotate: `${flameRotation.value}deg` },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flameScale.value = withSequence(
      withSpring(flameScale.value * 1.2),
      withSpring(flameScale.value)
    );
    onPress?.();
  };

  const isNewRecord = streakCount >= bestStreak && streakCount > 0;

  const getStatusStyles = (status: DayData["status"]) => {
    switch (status) {
      case "completed":
        return {
          bg: `${currentTheme.primary}20`,
          border: currentTheme.primary,
          icon: "checkmark" as const,
          iconColor: currentTheme.primary,
        };
      case "grace":
        return {
          bg: "#FFA50020",
          border: "#FFA500",
          icon: "shield-checkmark" as const,
          iconColor: "#FFA500",
        };
      case "missed":
        return {
          bg: "#FF444420",
          border: "#FF4444",
          icon: "close" as const,
          iconColor: "#FF4444",
        };
      case "today":
        return {
          bg: `${currentTheme.primary}20`,
          border: currentTheme.primary,
          icon: "ellipse" as const,
          iconColor: currentTheme.primary,
        };
      case "future":
        return {
          bg: "#33333320",
          border: "#333333",
          icon: null,
          iconColor: "#666",
        };
      default:
        return {
          bg: "#22222220",
          border: "#222222",
          icon: null,
          iconColor: "#444",
        };
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <View
        className="bg-surface rounded-3xl border border-white/5 overflow-hidden"
        style={{ borderColor: `${currentTheme.primary}20` }}
      >
        {/* Background Glow */}
        <Animated.View
          style={[
            glowAnimatedStyle,
            {
              position: "absolute",
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: 75,
              backgroundColor: currentTheme.primary,
            },
          ]}
        />

        {/* Hero Section */}
        <View className="p-5">
          <View className="flex-row items-center">
            {/* Flame Icon */}
            <View className="relative mr-4">
              <Animated.View
                style={flameAnimatedStyle}
                className="w-16 h-16 rounded-full items-center justify-center"
              >
                <AppIcon
                  name={streakCount > 0 ? "streak_active" : "streak_frozen"}
                  size={getFlameSize(streakCount)}
                  color={streakCount > 0 ? currentTheme.primary : "#AEC6CF"}
                />
              </Animated.View>
            </View>

            {/* Streak Info */}
            <View className="flex-1">
              <View className="flex-row items-baseline">
                <AppText
                  variant="black"
                  size="4xl"
                  style={{ color: theme === "light" ? "#000" : (streakCount > 0 ? currentTheme.primary : "#9CA3AF") }}
                >
                  {streakCount}
                </AppText>
                <AppText
                  variant="bold"
                  size="lg"
                  className="ml-2"
                  style={{ color: theme === "light" ? "#000" : (streakCount > 0 ? currentTheme.primary : "#9CA3AF") }}
                >
                  jour(s)
                </AppText>
              </View>

              <AppText variant="medium" className="text-gray-500 text-xs">
                Flamme de Persévérance
              </AppText>
            </View>

            {/* Best Streak Badge */}
            <View className="items-end">
              <View
                className={`flex-row items-center px-3 py-1.5 rounded-full ${
                  isNewRecord ? "bg-primary/20" : "bg-white/5"
                }`}
                style={isNewRecord ? { backgroundColor: `${currentTheme.primary}20` } : undefined}
              >
                <AppIcon
                  name={isNewRecord ? "trophy" : "medal-outline"}
                  size={14}
                  color={isNewRecord ? currentTheme.primary : "#888"}
                  set="Ionicons"
                />
                <AppText
                  variant="bold"
                  size="sm"
                  className={`ml-1.5 ${
                    isNewRecord ? "text-primary" : "text-gray-500"
                  }`}
                  style={isNewRecord ? { color: currentTheme.primary } : undefined}
                >
                  {bestStreak}
                </AppText>
              </View>
              <AppText variant="medium" className="text-[10px] text-gray-600 mt-1">
                {isNewRecord ? "Record !" : "Meilleur"}
              </AppText>
            </View>
          </View>

          {/* Motivation Message */}
          {streakCount > 0 && (
            <View className="mt-4 pt-4 border-t border-white/5">
              <AppText variant="regular" size="xs" className="text-gray-400">
                {getStreakMotivationMessage(streakCount)}
              </AppText>
            </View>
          )}
        </View>

        {/* Calendar Section */}
        {history && days.length > 0 && (
          <View className="px-5 pb-5 pt-2 border-t border-white/5">
            <AppText variant="bold" size="xs" className="text-gray-400 uppercase tracking-wider mb-3">
              Derniers {daysToShow} jours
            </AppText>
            <View className="flex-row justify-between">
              {days.map((day, index) => {
                const styles = getStatusStyles(day.status);
                const dayOfWeek = DAYS_FR[day.date.getDay()];
                const dayNumber = day.date.getDate();

                return (
                  <Animated.View
                    key={day.dateStr}
                    entering={FadeInDown.delay(index * 50).springify()}
                    className="items-center"
                  >
                    <AppText variant="medium" className="text-[10px] text-gray-500 mb-1">
                      {dayOfWeek}
                    </AppText>
                    <View
                      className="rounded-xl items-center justify-center border-[1px]"
                      style={{
                        width: 36,
                        height: 36,
                        backgroundColor: styles.bg,
                        borderColor: styles.border,
                      }}
                    >
                      {styles.icon ? (
                        <Ionicons name={styles.icon} size={22} color={styles.iconColor} />
                      ) : (
                        <AppText variant="bold" className="text-gray-500">{dayNumber}</AppText>
                      )}
                    </View>
                    {day.isToday && (
                      <View
                        className="w-1.5 h-1.5 rounded-full mt-1"
                        style={{ backgroundColor: currentTheme.primary }}
                      />
                    )}
                  </Animated.View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}
