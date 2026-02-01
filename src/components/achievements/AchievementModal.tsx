import { AppText } from "@/src/components/ui";
import { useThemeStore } from "@/src/stores";
import { getAchievementMessage } from "@/src/utils";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Dimensions, Modal, Pressable, ScrollView, View } from "react-native";
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    RotateInDownLeft,
    SlideInDown,
    SlideOutDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    ZoomIn
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "../ui/AppIcon";
import { ACHIEVEMENT_DEFINITIONS } from "./AchievementBadge";

const { width } = Dimensions.get("window");

interface AchievementModalProps {
  visible: boolean;
  achievementId: string;
  onClose: () => void;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  visible,
  achievementId,
  onClose,
}) => {
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();
  const achievement = ACHIEVEMENT_DEFINITIONS[achievementId as keyof typeof ACHIEVEMENT_DEFINITIONS];

  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      shimmer.value = withRepeat(
        withTiming(1, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }
  }, [visible]);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.3 + shimmer.value * 0.7,
    };
  });

  if (!achievement) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 bg-black/80"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        {/* Particules flottantes (uniquement quand visible) */}
        <View className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={i}
              entering={RotateInDownLeft.delay(i * 100).duration(800)}
              style={{
                position: "absolute",
                left: (width / 8) * i,
                top: 100 + Math.random() * 200,
              }}
            >
              <AppIcon name="sparkles" size={20} color={achievement.color} />
            </Animated.View>
          ))}
        </View>

        {/* Modal Content - Achievement themed bottom sheet */}
        <Animated.View
          entering={SlideInDown.duration(400).springify().damping(15)}
          exiting={SlideOutDown.duration(300)}
          className="bg-surface rounded-t-[32px] w-full"
          style={{
            maxHeight: "90%",
            marginBottom: -50,
            paddingBottom: Math.max(insets.bottom, 24) + 50
          }}
        >
          <View className="w-12 h-1.5 bg-white/10 rounded-full self-center mt-3 mb-2" />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="p-8 items-center">
                {/* Badge principal avec animation */}
                <Animated.View
                    entering={ZoomIn.delay(400).duration(500)}
                    className="items-center justify-center rounded-full border-4 mb-8"
                    style={[
                    {
                        width: 140,
                        height: 140,
                        backgroundColor: achievement.color + "20",
                        borderColor: achievement.color,
                    },
                    shimmerStyle,
                    ]}
                >
                    {/* @ts-ignore */}
                    <AppIcon name={achievement.icon} size={70} color={achievement.color} set="Ionicons" />
                </Animated.View>

                {/* Titre */}
                <Animated.View entering={FadeIn.delay(600).duration(500)} className="items-center w-full">
                    <AppText variant="black" size="sm" className="mb-2 tracking-[4px] uppercase text-center" style={{ color: achievement.color }}>
                        Achievement Débloqué !
                    </AppText>
                    <AppText variant="black" size="3xl" className="text-foreground text-center mb-4 uppercase tracking-tighter">
                        {achievement.title}
                    </AppText>
                    <AppText variant="medium" size="lg" className="text-gray-400 text-center mb-8 leading-6">
                        {achievement.description}
                    </AppText>
                </Animated.View>

                {/* Message motivant */}
                <Animated.View
                    entering={FadeIn.delay(800).duration(500)}
                    className="w-full bg-white/5 rounded-2xl p-6 mb-8 border border-white/10"
                >
                    <AppText variant="medium" size="lg" className="text-foreground text-center italic leading-7">
                    "{getAchievementMessage(achievement.id)}"
                    </AppText>
                </Animated.View>

                {/* Bouton fermer */}
                <Animated.View entering={FadeIn.delay(1000).duration(500)} className="w-full">
                    <Pressable
                    onPress={onClose}
                    className="h-16 rounded-2xl items-center justify-center shadow-2xl flex-row"
                    style={{ backgroundColor: achievement.color }}
                    >
                    <AppText variant="black" size="xl" className="text-white uppercase tracking-widest mr-2">Continuer</AppText>
                    <AppIcon name="rocket" size={24} color="white" />
                    </Pressable>
                </Animated.View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};
