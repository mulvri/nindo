import { THEMES } from "@/src/constants/themes";
import { useThemeStore } from "@/src/stores";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { AppPoppinsText as AppText } from "../ui/AppText";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type Period = 7 | 30 | 90;

interface TimePeriodSelectorProps {
  selected: Period;
  onSelect: (period: Period) => void;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 7, label: "7J" },
  { value: 30, label: "30J" },
  { value: 90, label: "90J" },
];

export const TimePeriodSelector = ({
  selected,
  onSelect,
}: TimePeriodSelectorProps) => {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  return (
    <View className="flex-row bg-white/5 rounded-2xl p-1">
      {PERIODS.map((period) => (
        <PeriodButton
          key={period.value}
          label={period.label}
          isSelected={selected === period.value}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect(period.value);
          }}
          color={currentTheme.primary}
        />
      ))}
    </View>
  );
};

interface PeriodButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  color: string;
}

const PeriodButton = ({
  label,
  isSelected,
  onPress,
  color,
}: PeriodButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <View
        className={`px-3 py-2 rounded-xl ${isSelected ? "" : "bg-transparent"}`}
        style={isSelected ? { backgroundColor: color } : undefined}
      >
        <AppText
          variant="bold"
          size="xs"
          className={isSelected ? "text-white" : "text-gray-400"}
        >
          {label}
        </AppText>
      </View>
    </AnimatedPressable>
  );
};
