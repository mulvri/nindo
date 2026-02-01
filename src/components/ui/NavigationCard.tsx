/**
 * Reusable navigation card component
 * Used for navigation items with icon, title, subtitle and chevron
 */

import { THEMES } from "@/src/constants/themes";
import { useThemeStore } from "@/src/stores";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View, ViewStyle } from "react-native";
import { AppIcon, IconConcept } from "./AppIcon";
import { AppText } from "./AppText";

export type NavigationCardVariant = "default" | "primary" | "outlined";

export interface NavigationCardProps {
  /** Main title text */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Icon to display (AppIcon concept or Ionicons name) */
  icon: IconConcept | keyof typeof Ionicons.glyphMap;
  /** Whether to use Ionicons instead of AppIcon */
  useIonicons?: boolean;
  /** Icon color */
  iconColor?: string;
  /** Background color for the icon container */
  iconBackgroundColor?: string;
  /** Callback when card is pressed */
  onPress: () => void;
  /** Visual variant of the card */
  variant?: NavigationCardVariant;
  /** Optional badge value */
  badge?: string | number;
  /** Additional class names */
  className?: string;
  /** Custom style for the card */
  style?: ViewStyle;
}

export function NavigationCard({
  title,
  subtitle,
  icon,
  useIonicons = true,
  iconColor,
  iconBackgroundColor,
  onPress,
  variant = "default",
  badge,
  className = "",
  style,
}: NavigationCardProps) {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  // Determine styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          containerClass: "bg-primary border border-primary",
          titleClass: "text-white",
          subtitleClass: "text-white/70",
          chevronColor: "#fff",
          defaultIconColor: "#fff",
          defaultIconBg: "rgba(255,255,255,0.2)",
          shadow: {
            shadowColor: currentTheme.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          },
        };
      case "outlined":
        return {
          containerClass: "bg-surface border border-white/5",
          titleClass: "text-foreground",
          subtitleClass: "text-gray-500",
          chevronColor: currentTheme.isDark ? "#fff" : "#000",
          defaultIconColor: currentTheme.isDark ? "#fff" : "#000",
          defaultIconBg: currentTheme.isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          shadow: {},
          borderColor: `${currentTheme.primary}20`,
          borderWidth: 1,
        };
      default:
        return {
          containerClass: "bg-surface border border-white/5",
          titleClass: "text-foreground",
          subtitleClass: "text-gray-500",
          chevronColor: currentTheme.isDark ? "#fff" : "#000",
          defaultIconColor: currentTheme.isDark ? "#fff" : "#000",
          defaultIconBg: currentTheme.isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          shadow: {},
          borderColor: `${currentTheme.primary}20`,
          borderWidth: 1,
        };
    }
  };

  const styles = getVariantStyles();
  const effectiveIconColor = iconColor || styles.defaultIconColor;
  const effectiveIconBg = iconBackgroundColor || styles.defaultIconBg;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-3xl p-6 ${styles.containerClass} ${className}`}
      style={[styles.shadow, { borderColor: (styles as any).borderColor || undefined, borderWidth: (styles as any).borderWidth || undefined }, style]}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {/* Icon Badge */}
          <View
            className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
            style={{ backgroundColor: effectiveIconBg }}
          >
            {useIonicons ? (
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={28}
                color={effectiveIconColor}
              />
            ) : (
              <AppIcon
                name={icon as IconConcept}
                size={28}
                color={effectiveIconColor}
              />
            )}
          </View>

          {/* Text Content */}
          <View className="flex-1">
            <View className="flex-row items-center">
              <AppText
                variant="black"
                size="xl"
                className={`uppercase tracking-tight ${styles.titleClass}`}
              >
                {title}
              </AppText>
              {badge !== undefined && (
                <View
                  className="ml-2 px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: variant === "primary" ? "rgba(255,255,255,0.3)" : currentTheme.primary }}
                >
                  <AppText variant="bold" size="xs" className="text-white">
                    {badge}
                  </AppText>
                </View>
              )}
            </View>
            {subtitle && (
              <AppText size="xs" variant="bold" className={styles.subtitleClass}>
                {subtitle}
              </AppText>
            )}
          </View>
        </View>

        {/* Chevron */}
        <Ionicons
          name="chevron-forward"
          size={24}
          color={effectiveIconColor}
        />
      </View>
    </TouchableOpacity>
  );
}
