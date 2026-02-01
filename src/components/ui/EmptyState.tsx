/**
 * Reusable empty state component
 * Used when a list or content area has no data to display
 */

import { THEMES } from "@/src/constants/themes";
import { useThemeStore } from "@/src/stores";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { AppIcon, IconConcept } from "./AppIcon";
import { AppText } from "./AppText";

export interface EmptyStateProps {
  /** Icon to display (AppIcon concept or Ionicons name) */
  icon: IconConcept | keyof typeof Ionicons.glyphMap;
  /** Whether to use Ionicons instead of AppIcon */
  useIonicons?: boolean;
  /** Size of the icon (default: 48) */
  iconSize?: number;
  /** Main title text */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional CTA button label */
  ctaLabel?: string;
  /** CTA button callback */
  onCtaPress?: () => void;
  /** Background color for the icon container */
  iconBackgroundColor?: string;
  /** Additional class names */
  className?: string;
}

export function EmptyState({
  icon,
  useIonicons = true,
  iconSize = 48,
  title,
  subtitle,
  ctaLabel,
  onCtaPress,
  iconBackgroundColor,
  className = "",
}: EmptyStateProps) {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  const iconColor = currentTheme.isDark ? "#4B5563" : "#9CA3AF";

  return (
    <View className={`flex-1 justify-center items-center px-10 ${className}`}>
      {/* Icon Container */}
      <View
        className="p-8 rounded-full mb-6 border border-foreground/10"
        style={{
          backgroundColor: iconBackgroundColor || currentTheme.surface,
        }}
      >
        {useIonicons ? (
          <Ionicons
            name={icon as keyof typeof Ionicons.glyphMap}
            size={iconSize}
            color={iconColor}
          />
        ) : (
          <AppIcon name={icon as IconConcept} size={iconSize} color={iconColor} />
        )}
      </View>

      {/* Title */}
      <AppText
        variant="bold"
        size="xl"
        className="text-center mb-2 text-foreground"
      >
        {title}
      </AppText>

      {/* Subtitle */}
      {subtitle && (
        <AppText className="text-gray-400 text-center mb-8">{subtitle}</AppText>
      )}

      {/* CTA Button */}
      {ctaLabel && onCtaPress && (
        <TouchableOpacity
          onPress={onCtaPress}
          className="px-8 py-4 rounded-full"
          style={{ backgroundColor: currentTheme.primary }}
        >
          <AppText variant="bold" className="text-white uppercase">
            {ctaLabel}
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}
