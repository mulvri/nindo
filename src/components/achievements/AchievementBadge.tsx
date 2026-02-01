import { AppText } from "@/src/components/ui";
import { THEMES } from "@/src/constants/themes";
import { useThemeStore } from "@/src/stores";
import React from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AppIcon } from "../ui/AppIcon";

// Définition des achievements
export const ACHIEVEMENT_DEFINITIONS = {
  streak_3: {
    id: "streak_3",
    title: "Genin Déterminé",
    description: "Ouvre l'app pendant 3 jours consécutifs",
    icon: "flame",
    color: "#FF6B35",
    streakRequired: 3,
  },
  streak_7: {
    id: "streak_7",
    title: "Semaine du Guerrier",
    description: "Maintiens un streak de 7 jours",
    icon: "trophy",
    color: "#FFD93D",
    streakRequired: 7,
  },
  streak_14: {
    id: "streak_14",
    title: "Chunin Persistant",
    description: "Atteins 14 jours de suite",
    icon: "medal",
    color: "#4ECDC4",
    streakRequired: 14,
  },
  streak_30: {
    id: "streak_30",
    title: "Volonté Inébranlable",
    description: "Complète 30 jours d'affilée",
    icon: "star",
    color: "#FF6B9D",
    streakRequired: 30,
  },
  streak_60: {
    id: "streak_60",
    title: "Hokage en Formation",
    description: "Maintiens 60 jours de streak",
    icon: "ribbon",
    color: "#B565D8",
    streakRequired: 60,
  },
  streak_100: {
    id: "streak_100",
    title: "Légende Shinobi",
    description: "Atteins le légendaire 100 jours",
    icon: "diamond",
    color: "#FFD700",
    streakRequired: 100,
  },
};

interface AchievementBadgeProps {
  achievementId: string;
  unlocked: boolean;
  unlockedAt?: string;
  size?: "small" | "medium" | "large";
  showTitle?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievementId,
  unlocked,
  unlockedAt,
  size = "medium",
  showTitle = true,
}) => {
  const achievement = ACHIEVEMENT_DEFINITIONS[achievementId as keyof typeof ACHIEVEMENT_DEFINITIONS];
  if (!achievement) return null;

  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const achievementColor = achievement.id === "streak_3" ? currentTheme.primary : achievement.color;

  const sizeMap = {
    small: { container: 60, icon: 24, text: "xs" as const },
    medium: { container: 80, icon: 32, text: "sm" as const },
    large: { container: 100, icon: 40, text: "base" as const },
  };

  const dimensions = sizeMap[size];

  return (
    <Animated.View 
      entering={FadeInDown.duration(400)}
      className="items-center"
    >
      {/* Badge Container */}
      <View
        className={`items-center justify-center rounded-full border-4 relative ${
          unlocked ? "" : "opacity-30"
        }`}
        style={{
          width: dimensions.container,
          height: dimensions.container,
          backgroundColor: unlocked ? achievementColor + "20" : "#333",
          borderColor: unlocked ? achievementColor : "#555",
        }}
      >
        <AppIcon
          name={achievement.icon as any}
          size={dimensions.icon}
          color={unlocked ? achievementColor : "#888"}
          set="Ionicons"
        />

        {/* Locked overlay - Now INSIDE the container to avoid duplication/misalignment */}
        {!unlocked && (
          <View 
            className="absolute inset-0 items-center justify-center rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
          >
            <AppIcon name="lock" size={dimensions.icon / 1.5} color="#fff" set="Ionicons" />
          </View>
        )}
      </View>

      {/* Title */}
      {showTitle && (
        <View className="mt-2 items-center max-w-[100px]">
          <AppText
            variant="black"
            size={dimensions.text}
            className={`text-center ${
              unlocked ? "text-foreground" : "text-gray-600"
            }`}
            numberOfLines={1}
          >
            {achievement.title}
          </AppText>
          {unlocked && unlockedAt && (
            <AppText className="text-[10px] text-gray-500 mt-1">
              {new Date(unlockedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              })}
            </AppText>
          )}
        </View>
      )}
    </Animated.View>
  );
};
