/**
 * Reusable toggle switch component
 * Styled consistently with the app design
 */

import { THEMES } from "@/src/constants/themes";
import { useThemeStore } from "@/src/stores";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

export type ToggleSwitchSize = "sm" | "md" | "lg";

export interface ToggleSwitchProps {
  /** Current value of the switch */
  value: boolean;
  /** Callback when value changes */
  onValueChange: (value: boolean) => void;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Color when active (defaults to primary theme color) */
  activeColor?: string;
  /** Color when inactive */
  inactiveColor?: string;
  /** Size of the switch */
  size?: ToggleSwitchSize;
  /** Whether to trigger haptic feedback */
  hapticFeedback?: boolean;
}

const SIZE_CONFIG = {
  sm: { width: 40, height: 24, thumbSize: 18, padding: 3 },
  md: { width: 52, height: 30, thumbSize: 24, padding: 3 },
  lg: { width: 64, height: 36, thumbSize: 28, padding: 4 },
};

export function ToggleSwitch({
  value,
  onValueChange,
  disabled = false,
  activeColor,
  inactiveColor,
  size = "md",
  hapticFeedback = true,
}: ToggleSwitchProps) {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  const effectiveActiveColor = activeColor || currentTheme.primary;
  const effectiveInactiveColor = inactiveColor || (currentTheme.isDark ? "#374151" : "#D1D5DB");

  const config = SIZE_CONFIG[size];
  const translateX = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    translateX.value = withSpring(value ? 1 : 0, {
      damping: 15,
      stiffness: 120,
    });
  }, [value]);

  const handlePress = () => {
    if (disabled) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onValueChange(!value);
  };

  const trackAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      translateX.value,
      [0, 1],
      [effectiveInactiveColor, effectiveActiveColor]
    ),
  }));

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          translateX.value * (config.width - config.thumbSize - config.padding * 2),
      },
    ],
  }));

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View
        className="rounded-full justify-center"
        style={[
          {
            width: config.width,
            height: config.height,
            padding: config.padding,
          },
          trackAnimatedStyle,
        ]}
      >
        <Animated.View
          className="rounded-full bg-white shadow-sm"
          style={[
            {
              width: config.thumbSize,
              height: config.thumbSize,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 2,
              elevation: 2,
            },
            thumbAnimatedStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

/**
 * Toggle switch with label and description
 */
export interface LabeledToggleSwitchProps extends ToggleSwitchProps {
  /** Main label text */
  label: string;
  /** Optional description text */
  description?: string;
  /** Icon component to show before label */
  icon?: React.ReactNode;
}

export function LabeledToggleSwitch({
  label,
  description,
  icon,
  ...toggleProps
}: LabeledToggleSwitchProps) {
  const { AppText } = require("./AppText");

  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center flex-1 mr-4">
        {icon && <View className="mr-3">{icon}</View>}
        <View className="flex-1">
          <AppText variant="bold" className="text-foreground">
            {label}
          </AppText>
          {description && (
            <AppText size="xs" className="text-gray-500 mt-0.5">
              {description}
            </AppText>
          )}
        </View>
      </View>
      <ToggleSwitch {...toggleProps} />
    </View>
  );
}
