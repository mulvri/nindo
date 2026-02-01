import { AppText } from "@/src/components/ui";
import { MOODS } from "@/src/constants";
import { THEMES } from "@/src/constants/themes";
import { selectDailyMood } from "@/src/services/database";
import { useThemeStore } from "@/src/stores";
import { getMoodDescription } from "@/src/utils";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    FadeIn,
    FadeInDown,
    FadeOut,
    SlideInDown,
    SlideOutDown,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "../ui/AppIcon";

interface MoodSelectorProps {
  visible: boolean;
  onClose: () => void;
  onMoodSelected?: (moodId: string) => void;
  firstName?: string;
}
interface MoodItemProps {
  mood: (typeof MOODS)[0];
  isSelected: boolean;
  onSelect: () => void;
  delay: number;
  primaryColor: string;
  surfaceColor: string;
  foregroundColor: string;
}

function MoodItem({ mood, isSelected, onSelect, delay, primaryColor, surfaceColor, foregroundColor }: MoodItemProps) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.9),
      withSpring(1.1),
      withSpring(1)
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={animatedStyle}
    >
      <Pressable
        onPress={handlePress}
        style={[
          styles.moodItem,
          {
            backgroundColor: surfaceColor,
            borderColor: isSelected ? primaryColor : `${primaryColor}1A`,
          },
          isSelected && { backgroundColor: `${primaryColor}15` }
        ]}
      >
        <View style={[styles.moodEmojiContainer, { backgroundColor: `${primaryColor}0D` }]}>
          {/* @ts-ignore */}
          <AppIcon name={mood.icon} size={30} color={foregroundColor} />
        </View>
        <View style={styles.moodTextContainer}>
          <AppText style={[styles.moodName, { color: foregroundColor }]}>{mood.name}</AppText>
          <AppText style={styles.moodDescription}>
            {getMoodDescription(mood.id)}
          </AppText>
        </View>
        {isSelected && (
          <View style={[styles.checkContainer, { backgroundColor: primaryColor }]}>
            <AppIcon name="check" size={20} color="#fff" />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export function MoodSelector({
  visible,
  onClose,
  onMoodSelected,
  firstName,
}: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  // Early return - don't render anything if not visible
  if (!visible) {
    return null;
  }

  const isDark = currentTheme.isDark;

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
  };

  const handleConfirm = async () => {
    if (!selectedMood) return;

    setIsSubmitting(true);
    try {
      await selectDailyMood(selectedMood, "app");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onMoodSelected?.(selectedMood);
      onClose();
    } catch (error) {
      console.error("Failed to save mood:", error);
    } finally {
      setIsSubmitting(false);
      setSelectedMood(null);
    }
  };

  const greeting = firstName ? `Hey ${firstName} !` : "Hey Ninja !";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={styles.backdrop}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />

        <Animated.View
          entering={SlideInDown.duration(350).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(300).easing(Easing.in(Easing.cubic))}
          style={[
            styles.bottomSheet,
            {
              backgroundColor: currentTheme.surface,
              paddingBottom: Math.max(insets.bottom, 24), // Adjusted paddingBottom
              borderColor: `${currentTheme.primary}4D` // Updated borderColor
            }
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.content}>
            {/* Header */}
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <AppText style={[styles.greeting, { color: currentTheme.foreground }]}>
                {greeting}
              </AppText>
              <AppText style={styles.subtitle}>
                Quel est ton mood de ninja aujourd'hui ?
              </AppText>
            </Animated.View>

            {/* Mood List */}
            <View style={styles.moodList}>
              {MOODS.map((mood, index) => (
                <MoodItem
                  key={mood.id}
                  mood={mood}
                  isSelected={selectedMood === mood.id}
                  onSelect={() => handleMoodSelect(mood.id)}
                  delay={150 + index * 50}
                  primaryColor={currentTheme.primary}
                  surfaceColor={currentTheme.surface}
                  foregroundColor={currentTheme.foreground}
                />
              ))}
            </View>

            {/* Confirm Button */}
            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <Pressable
                onPress={handleConfirm}
                disabled={!selectedMood || isSubmitting}
                style={[
                  styles.confirmButton,
                  {
                    backgroundColor: selectedMood
                      ? currentTheme.primary
                      : (isDark ? '#1A1A1A' : '#E5E5E5')
                  }
                ]}
              >
                <AppText
                  style={[
                    styles.confirmButtonText,
                    { color: selectedMood ? '#FFFFFF' : '#6B7280' }
                  ]}
                >
                  {isSubmitting ? "Enregistrement..." : "Confirmer mon mood"}
                </AppText>
              </Pressable>
            </Animated.View>

            {/* Skip Button */}
            <Pressable onPress={onClose} style={styles.skipButton}>
              <AppText style={styles.skipButtonText}>
                Passer pour l'instant
              </AppText>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backdropPressable: {
    flex: 1,
  },
  bottomSheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#4B5563',
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Poppins_900Black',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#9CA3AF',
    fontFamily: 'Poppins_400Regular',
    marginBottom: 24,
    fontSize: 16,
  },
  moodList: {
    marginBottom: 24,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 2,
  },
  moodEmojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  moodEmoji: {
    fontSize: 30,
  },
  moodTextContainer: {
    flex: 1,
  },
  moodName: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
  moodDescription: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
  skipButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  skipButtonText: {
    color: '#6B7280',
    fontFamily: 'Poppins_500Medium',
  },
});
