/**
 * Reusable screen header component
 * Standardizes the header pattern across all screens
 */

import { THEMES } from "@/src/constants/themes";
import { useThemeStore } from "@/src/stores";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { AppIcon, IconConcept } from "./AppIcon";
import { AppText } from "./AppText";

export interface ScreenHeaderProps {
  /** The title to display in the header */
  title: string;
  /** Custom back action (defaults to router.back()) */
  onBack?: () => void;
  /** Whether to show the back button (default: true) */
  showBackButton?: boolean;
  /** Right side action button */
  rightAction?: {
    icon: IconConcept | keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    /** Use Ionicons instead of AppIcon */
    useIonicons?: boolean;
  };
  /** Optional badge/counter */
  badge?: {
    value: string | number;
    color?: string;
  };
  /** Additional class names for the container */
  className?: string;
  /** Whether to add border at the bottom */
  borderBottom?: boolean;
}

export function ScreenHeader({
  title,
  onBack,
  showBackButton = true,
  rightAction,
  badge,
  className = "",
  borderBottom = false,
}: ScreenHeaderProps) {
  const router = useRouter();
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const iconColor = currentTheme.foreground;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      className={`px-4 py-3 flex-row items-center border-b ${
        borderBottom ? "border-white/5" : "border-transparent"
      } ${className}`}
    >
      {/* Left: Back Button Container */}
      <View className="w-12 items-start justify-center">
        {showBackButton && (
          <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={28} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center: Title Container - Flex 1 to take all space and center text */}
      <View className="flex-1 flex-row items-center justify-center">
        <AppText
          variant="black"
          size="2xl"
          className="uppercase tracking-tighter text-foreground text-center"
          numberOfLines={1}
        >
          {title}
        </AppText>
      </View>

      {/* Right: Action Button Container */}
      <View className="items-end justify-center min-w-[48px]">
        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress} className="p-1 -mr-1">
              {rightAction.useIonicons ? (
                <Ionicons
                  name={rightAction.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={iconColor}
                />
              ) : (
                <AppIcon
                  name={rightAction.icon as IconConcept}
                  size={24}
                  color={iconColor}
                />
              )}
          </TouchableOpacity>
        ) : badge ? (
          <View
            className="px-3 py-1 rounded-full items-center justify-center"
            style={{ backgroundColor: badge.color || currentTheme.primary }}
          >
            <AppText variant="bold" size="xs" className="text-white">
              {badge.value}
            </AppText>
          </View>
        ) : (
          <View className="w-2" />
        )}
      </View>
    </View>
  );
}
