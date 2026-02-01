/**
 * Reusable progress bar component
 */

import { THEMES } from "@/src/constants/themes";
import { useThemeStore } from "@/src/stores";
import React from "react";
import { View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { AppText } from "./AppText";

export interface ProgressBarProps {
  /** Progress value (0-100) */
  progress: number;
  /** Color of the progress fill */
  color?: string;
  /** Background color of the bar */
  backgroundColor?: string;
  /** Height of the bar (default: 8) */
  height?: number;
  /** Whether to show the percentage label */
  showLabel?: boolean;
  /** Position of the label */
  labelPosition?: "inside" | "right" | "above";
  /** Whether to animate the progress change */
  animated?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Additional class names for the container */
  className?: string;
}

export function ProgressBar({
  progress,
  color,
  backgroundColor,
  height = 8,
  showLabel = false,
  labelPosition = "right",
  animated = true,
  animationDuration = 500,
  className = "",
}: ProgressBarProps) {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  const effectiveColor = color || currentTheme.primary;
  const effectiveBgColor = backgroundColor || (currentTheme.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)");

  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  // Animated width
  const animatedWidth = useSharedValue(animated ? 0 : clampedProgress);

  React.useEffect(() => {
    if (animated) {
      animatedWidth.value = withTiming(clampedProgress, {
        duration: animationDuration,
      });
    } else {
      animatedWidth.value = clampedProgress;
    }
  }, [clampedProgress, animated, animationDuration]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  const renderLabel = () => (
    <AppText variant="bold" size="sm" className="text-primary">
      {Math.round(clampedProgress)}%
    </AppText>
  );

  if (labelPosition === "above" && showLabel) {
    return (
      <View className={className}>
        <View className="flex-row justify-between items-center mb-1">
          {renderLabel()}
        </View>
        <View
          className="rounded-full overflow-hidden"
          style={{ height, backgroundColor: effectiveBgColor }}
        >
          <Animated.View
            className="h-full rounded-full"
            style={[animatedStyle, { backgroundColor: effectiveColor }]}
          />
        </View>
      </View>
    );
  }

  return (
    <View className={`flex-row items-center ${className}`}>
      <View
        className="flex-1 rounded-full overflow-hidden"
        style={{ height, backgroundColor: effectiveBgColor }}
      >
        <Animated.View
          className="h-full rounded-full"
          style={[animatedStyle, { backgroundColor: effectiveColor }]}
        />
      </View>
      {showLabel && labelPosition === "right" && (
        <View className="ml-3">{renderLabel()}</View>
      )}
    </View>
  );
}

/**
 * Labeled progress bar with icon and text
 */
export interface LabeledProgressBarProps extends Omit<ProgressBarProps, "showLabel" | "labelPosition"> {
  /** Label text */
  label: string;
  /** Optional icon component */
  icon?: React.ReactNode;
  /** Additional info text (e.g., "X jours") */
  info?: string;
}

export function LabeledProgressBar({
  label,
  icon,
  info,
  progress,
  color,
  height = 8,
  ...rest
}: LabeledProgressBarProps) {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const effectiveColor = color || currentTheme.primary;

  return (
    <View>
      {/* Header Row */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          {icon}
          <AppText
            variant="bold"
            size="sm"
            className="text-foreground flex-1 ml-2"
            numberOfLines={1}
          >
            {label}
          </AppText>
        </View>
        <AppText
          variant="black"
          size="sm"
          className="ml-2"
          style={{ color: effectiveColor }}
        >
          {Math.round(progress)}%
        </AppText>
      </View>

      {/* Progress Bar */}
      <ProgressBar progress={progress} color={color} height={height} {...rest} />

      {/* Info Text */}
      {info && (
        <AppText size="xs" className="text-gray-500 mt-1">
          {info}
        </AppText>
      )}
    </View>
  );
}
