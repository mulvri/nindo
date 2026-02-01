import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { AppPoppinsText as AppText } from "./AppText";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
  emoji?: string;
}

export const SelectableChip = ({
  label,
  selected,
  onPress,
  color = "#000",
  emoji,
}: SelectableChipProps) => {
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
      className="m-1"
    >
      <View
        className={`px-4 py-3 rounded-2xl border-2 flex-row items-center ${
          selected ? "border-primary" : ""
        } ${!selected ? "bg-surface" : ""}`}
        style={selected ? { backgroundColor: color } : { borderColor: "rgba(255, 255, 255, 0.1)" }}
      >
        {emoji && <AppText className="mr-2 text-base">{emoji}</AppText>}
        <AppText
          variant="bold"
          size="sm"
          className={`${selected ? "text-white" : "text-gray-400"}`}
        >
          {label}
        </AppText>
      </View>
    </AnimatedPressable>
  );
};
