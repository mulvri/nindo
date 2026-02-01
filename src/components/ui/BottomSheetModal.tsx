/**
 * Reusable bottom sheet modal component
 * Consolidates the repeated modal pattern across the app
 */

import { THEMES } from "@/src/constants/themes";
import { useThemeStore } from "@/src/stores";
import React from "react";
import { Modal, Pressable, ScrollView, View, ViewStyle } from "react-native";
import Animated, {
    AnimatedStyle,
    Easing,
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon, IconConcept } from "./AppIcon";
import { AppText } from "./AppText";

export type BottomSheetVariant = "default" | "celebration" | "warning" | "danger";

export interface BottomSheetModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when the modal is closed */
  onClose: () => void;
  /** Content to render inside the modal */
  children: React.ReactNode;
  /** Optional title text */
  title?: string;
  /** Optional emoji shown before title */
  emoji?: string;
  /** Optional icon shown before title (alternative to emoji) */
  icon?: IconConcept;
  /** Icon color if using icon prop */
  iconColor?: string;
  /** Visual variant of the modal */
  variant?: BottomSheetVariant;
  /** Maximum height of the modal (default: 85%) */
  maxHeight?: string | number;
  /** Custom border color */
  borderColor?: string;
  /** Whether to show the drag handle (default: true) */
  showHandle?: boolean;
  /** Whether to show the header with title (default: true if title provided) */
  showHeader?: boolean;
  /** Custom animated style for the content container */
  contentAnimatedStyle?: AnimatedStyle<ViewStyle>;
  /** Extra padding at bottom */
  extraBottomPadding?: number;
  /** Background opacity for backdrop (default: 0.7) */
  backdropOpacity?: number;
  /** Custom background class for the sheet */
  backgroundClass?: string;
}

/**
 * Get variant-specific styles
 */
function getVariantStyles(variant: BottomSheetVariant, primaryColor: string) {
  switch (variant) {
    case "celebration":
      return {
        borderColor: primaryColor,
        borderWidth: 0,
        backdropOpacity: 0.8,
      };
    case "warning":
      return {
        borderColor: "#FFA500",
        borderWidth: 0,
        backdropOpacity: 0.8,
      };
    case "danger":
      return {
        borderColor: "#FF4444",
        borderWidth: 0,
        backdropOpacity: 0.8,
      };
    default:
      return {
        borderColor: `${primaryColor}4D`,
        borderWidth: 0,
        backdropOpacity: 0.7,
      };
  }
}

export function BottomSheetModal({
  visible,
  onClose,
  children,
  title,
  emoji,
  icon,
  iconColor,
  variant = "default",
  maxHeight = "85%",
  borderColor: customBorderColor,
  showHandle = true,
  showHeader = true,
  contentAnimatedStyle,
  extraBottomPadding = 0,
  backdropOpacity: customBackdropOpacity,
  backgroundClass = "bg-surface",
}: BottomSheetModalProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  if (!visible) return null;

  const variantStyles = getVariantStyles(variant, currentTheme.primary);
  const effectiveBackdropOpacity = customBackdropOpacity ?? variantStyles.backdropOpacity;

  const hasHeader = showHeader && (title || emoji || icon);
  const isDark = currentTheme.isDark;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${effectiveBackdropOpacity})` }}
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        {/* Content */}
        <Animated.View
          entering={SlideInDown.duration(350).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(300).easing(Easing.in(Easing.cubic))}
          className={`${backgroundClass} rounded-t-[32px] w-full`}
          style={[
            {
              maxHeight: maxHeight as any,
              marginBottom: -50,
              paddingBottom: Math.max(insets.bottom, 24) + 50 + extraBottomPadding,
            },
            contentAnimatedStyle
          ]}
        >
          {/* Handle */}
          {showHandle && (
            <View
              className={`w-12 h-1.5 rounded-full self-center mt-3 ${
                hasHeader ? "mb-6" : "mb-4"
              }`}
              style={{
                backgroundColor: isDark ? "rgba(75,85,99,0.3)" : "rgba(156,163,175,0.5)",
              }}
            />
          )}

          {/* Header */}
          {hasHeader && (
            <View className="px-6">
              <View className="flex-row items-center mb-2">
                {emoji && (
                  <AppText className="text-3xl mr-3">{emoji}</AppText>
                )}
                {icon && !emoji && (
                  <View className="mr-3">
                    <AppIcon
                      name={icon}
                      size={28}
                      color={iconColor || currentTheme.primary}
                    />
                  </View>
                )}
                {title && (
                  <AppText
                    variant="black"
                    size="2xl"
                    className="text-foreground"
                  >
                    {title}
                  </AppText>
                )}
              </View>
            </View>
          )}

          {/* Scrollable Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className={hasHeader ? "mt-4" : ""}
            contentContainerStyle={{ paddingHorizontal: hasHeader ? 24 : 0 }}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * Simplified wrapper for common bottom sheet with title
 */
export function SimpleBottomSheet({
  visible,
  onClose,
  title,
  emoji,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  emoji?: string;
  children: React.ReactNode;
}) {
  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={title}
      emoji={emoji}
    >
      {children}
    </BottomSheetModal>
  );
}
