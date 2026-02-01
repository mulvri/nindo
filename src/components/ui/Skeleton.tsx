import React, { useEffect } from "react";
import { View, ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
}

export const Skeleton = ({
  width,
  height,
  borderRadius = 12,
  style,
  className,
  ...props
}: SkeletonProps) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
      className={`bg-surface ${className || ""}`}
      {...props}
    />
  );
};

export const QuoteSkeleton = () => {
  return (
    <View className="m-4 p-8 rounded-3xl border-2 border-foreground/5 bg-surface min-h-[400px] justify-center">
      <Skeleton width={100} height={20} className="mb-6" />
      <Skeleton width="100%" height={30} className="mb-2" />
      <Skeleton width="80%" height={30} className="mb-8" />
      <View className="flex-row items-center border-l-4 border-foreground/10 pl-4">
        <View>
          <Skeleton width={120} height={24} className="mb-2" />
          <Skeleton width={80} height={16} />
        </View>
      </View>
    </View>
  );
};
