import { AppIcon } from "@/src/components/ui/AppIcon";
import { AppText } from "@/src/components/ui/AppText";
import { THEMES } from "@/src/constants/themes";
import { useThemeStore } from "@/src/stores";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface StreakBrokenModalProps {
  visible: boolean;
  onClose: () => void;
  previousStreak: number;
  missedDays: number;
}

const MOTIVATIONAL_QUOTES = [
  { text: "Même les plus grands ninjas trébuchent parfois...", author: "Sagesse Shinobi" },
  { text: "Ceux qui ne peuvent pas reconnaître leurs erreurs sont voués à l'échec. Mais toi, tu te relèves.", author: "Itachi Uchiha" },
  { text: "Tomber sept fois, se relever huit. C'est ça, le nindo.", author: "Proverbe Ninja" },
  { text: "La vraie défaite, c'est d'abandonner. Tu es encore là.", author: "Rock Lee" },
  { text: "Chaque jour est une nouvelle chance de devenir plus fort.", author: "Goku" },
];

export function StreakBrokenModal({ visible, onClose, previousStreak, missedDays }: StreakBrokenModalProps) {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const insets = useSafeAreaInsets();
  const brokenScale = useSharedValue(1);
  const shakeX = useSharedValue(0);

  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withRepeat(withSequence(withTiming(10, { duration: 100 }), withTiming(-10, { duration: 100 })), 3, true),
        withTiming(0, { duration: 50 })
      );
      brokenScale.value = withSequence(withSpring(1.2), withTiming(0.8, { duration: 300 }), withSpring(1));
    }
  }, [visible]);

  const shakeAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));
  const scaleAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: brokenScale.value }] }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 bg-black/80"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(400).springify().damping(15)}
          exiting={SlideOutDown.duration(300)}
          className="bg-abyss rounded-t-[32px] w-full"
          style={[
            shakeAnimatedStyle,
            { 
              maxHeight: "90%",
              marginBottom: -50,
              paddingBottom: Math.max(insets.bottom, 24) + 50,
            }
          ]}
        >
          <View className="w-12 h-1.5 bg-gray-800 rounded-full self-center mt-3 mb-4" />
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="p-6 items-center">
              <Animated.View style={scaleAnimatedStyle}>
                <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-4 border border-primary/40">
                  <AppIcon name="streak_broken" size={48} />
                </View>
              </Animated.View>

              <AppText variant="black" size="2xl" className="text-foreground text-center mb-2 uppercase tracking-tighter">
                Streak Interrompu
              </AppText>

              <View className="flex-row items-center mb-4">
                <AppText variant="black" size="4xl" style={{ color: currentTheme.primary }}>{previousStreak}</AppText>
                <AppText variant="bold" size="lg" className="text-gray-500 ml-2">jours perdus</AppText>
              </View>

              {missedDays > 0 && (
                <AppText variant="medium" className="text-gray-500 mb-6">
                  {missedDays} jour{missedDays > 1 ? "s" : ""} d'absence
                </AppText>
              )}

              <View className="w-full bg-primary/5 rounded-2xl p-5 border border-primary/10 mb-8">
                <AppText size="lg" className="text-foreground text-center italic leading-7 mb-3">"{quote.text}"</AppText>
                <AppText variant="black" size="xs" className="text-gray-500 uppercase tracking-widest text-center">— {quote.author}</AppText>
              </View>

              <View className="w-full flex-row items-center justify-center mb-8 gap-4">
                <View className="h-px flex-1 bg-primary/10" />
                <AppText variant="black" className="text-gray-600 text-[10px] uppercase tracking-[3px]">Nouveau départ</AppText>
                <View className="h-px flex-1 bg-primary/10" />
              </View>

              <View className="flex-row items-center justify-center mb-8">
                <AppIcon name="streak_active" size={48} containerStyle={{ marginRight: 16 }} />
                <View>
                  <AppText variant="black" size="3xl" className="text-foreground">1</AppText>
                  <AppText variant="bold" className="text-gray-500">Ton nouveau streak</AppText>
                </View>
              </View>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onClose();
                }}
                className="w-full h-16 rounded-2xl items-center justify-center shadow-lg"
                style={{ backgroundColor: currentTheme.primary }}
              >
                <AppText variant="black" size="lg" className="text-white uppercase tracking-widest">
                  Reprendre l'entraînement
                </AppText>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
