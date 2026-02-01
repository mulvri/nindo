import { FONT_STYLES, MOODS } from "@/src/constants";
import { THEMES } from "@/src/constants/themes";
import { Quote, toggleFavorite } from "@/src/services/database";
import { useFontStore, useThemeStore } from "@/src/stores";
import * as Haptics from "expo-haptics";
import React, { useCallback, useRef, useState } from "react";
import { Dimensions, Pressable, Share, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { AppText } from "../ui";
import { AppIcon } from "../ui/AppIcon";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface QuoteCardProps {
  quote: Quote;
  index: number;
}

export const QuoteCard = ({ quote: initialQuote }: QuoteCardProps) => {
  const [quote, setQuote] = useState(initialQuote);
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const { quoteFontScale } = useFontStore();
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const lastTap = useRef<number>(0);
  const heartScale = useSharedValue(0);

  const moodInfo = MOODS.find((m) => m.id === quote.mood);

  const handlePress = useCallback(async () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      const newFavoriteStatus = !quote.isFavorite;

      // Heart burst animation & Haptics (only on favorite)
      if (newFavoriteStatus) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowHeartBurst(true);
        heartScale.value = withSequence(
          withSpring(2.5, { damping: 10 }),
          withTiming(0, { duration: 500 })
        );
        setTimeout(() => setShowHeartBurst(false), 800);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      setQuote(prev => ({ ...prev, isFavorite: newFavoriteStatus }));
      await toggleFavorite(quote.id, newFavoriteStatus);
    } else {
      // Single tap feel
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    lastTap.current = now;
  }, [quote, heartScale]);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `"${quote.text}"\n\n— ${quote.author}, ${quote.anime}\n\nVia Nindo 🥷`,
      });
    } catch (error) {
      console.error("Error sharing quote:", error);
    }
  }, [quote]);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const customFont = quote.isUserCreated 
    ? FONT_STYLES.find((f) => f.id === quote.fontStyle) 
    : null;

  return (
    <Pressable onPress={handlePress} style={{ height: SCREEN_HEIGHT }}>
      <View className="flex-1 justify-center px-8">
        {/* Heart Burst Animation remains absolute */}
        {showHeartBurst && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={[
              heartAnimatedStyle,
              { position: "absolute", alignSelf: "center", zIndex: 50 },
            ]}
          >
            <AppIcon name="heart" size={80} color="#EF4444" />
          </Animated.View>
        )}

        <Animated.View entering={FadeIn.duration(800)}>
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                className="bg-primary px-3 py-1 rounded-lg"
                style={{ transform: [{ rotate: "-1deg" }] }}
              >
                <AppText variant="bold" size="xs" className="text-white uppercase tracking-widest">
                  {quote.isUserCreated ? "Custom" : quote.anime}
                </AppText>
              </View>
              {moodInfo && (
                <AppIcon 
                  // @ts-ignore
                  name={moodInfo.icon} 
                  size={24} 
                  color={currentTheme.primary} 
                  containerStyle={{ marginLeft: 12, opacity: 0.8 }} 
                />
              )}
            </View>

            {quote.isFavorite && (
              <Animated.View entering={FadeIn}>
                <AppIcon name="heart" size={24} color="#EF4444" />
              </Animated.View>
            )}
          </View>

          <AppText
            variant="semibold"
            className="text-foreground mb-10 leading-tight"
            style={[
              {
                fontSize: 24 * quoteFontScale,
              },
              quote.isUserCreated && customFont ? {
                fontFamily: customFont.fontFamily,
              } : undefined
            ]}
          >
            "{quote.text}"
          </AppText>

          <Animated.View
            entering={FadeIn.delay(400)}
            className="flex-row items-center justify-between"
          >
            <View className="border-l-4 border-primary pl-4">
              <AppText variant="semibold" size="lg" className="text-foreground uppercase tracking-tighter">
                {quote.author}
              </AppText>
              <AppText variant="regular" size="xs" className="text-gray-400 mt-1">
                {quote.isUserCreated ? "— Citation personnelle" : "— Murmure du Sensei"}
              </AppText>
            </View>
            <Pressable
              onPress={handleShare}
              className="p-3"
              hitSlop={10}
            >
              <AppIcon name="share" size={24} color={currentTheme.primary} />
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </Pressable>
  );
};

