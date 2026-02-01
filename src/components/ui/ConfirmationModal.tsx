/**
 * Reusable confirmation modal component
 * Used for destructive actions like delete, reset, etc.
 */

import { THEMES } from "@/src/constants/themes";
import { useThemeStore } from "@/src/stores";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
    ZoomIn,
    ZoomOut,
} from "react-native-reanimated";
import { AppText } from "./AppText";

export type ConfirmationVariant = "danger" | "warning" | "info";

export interface ConfirmationModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when modal is closed (cancelled) */
  onClose: () => void;
  /** Callback when action is confirmed */
  onConfirm: () => void;
  /** Title of the modal */
  title: string;
  /** Description/message explaining the action */
  message: string;
  /** Text for the confirm button (default: "Confirmer") */
  confirmText?: string;
  /** Text for the cancel button (default: "Annuler") */
  cancelText?: string;
  /** Icon name from Ionicons (default based on variant) */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Visual variant affecting colors */
  variant?: ConfirmationVariant;
  /** Whether the confirm action is loading */
  isLoading?: boolean;
}

const VARIANT_CONFIG = {
  danger: {
    icon: "warning" as const,
    iconColor: "#EF4444",
    iconBg: "rgba(239, 68, 68, 0.15)",
    buttonColor: "#EF4444",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  warning: {
    icon: "alert-circle" as const,
    iconColor: "#F59E0B",
    iconBg: "rgba(245, 158, 11, 0.15)",
    buttonColor: "#F59E0B",
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  info: {
    icon: "information-circle" as const,
    iconColor: "#3B82F6",
    iconBg: "rgba(59, 130, 246, 0.15)",
    buttonColor: "#3B82F6",
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
};

export function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  icon,
  variant = "danger",
  isLoading = false,
}: ConfirmationModalProps) {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const isDark = currentTheme.isDark;

  const config = {
    ...VARIANT_CONFIG[variant],
    ...(variant === "info" ? {
      iconColor: currentTheme.primary,
      iconBg: `${currentTheme.primary}26`, // ~15% opacity
      buttonColor: currentTheme.primary,
      borderColor: `${currentTheme.primary}4D`, // ~30% opacity
    } : {})
  };

  const effectiveIcon = icon || config.icon;

  const handleConfirm = () => {
    if (isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center px-6">
        {/* Backdrop */}
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          className="absolute inset-0 bg-black/70"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          entering={ZoomIn.duration(250).springify()}
          exiting={ZoomOut.duration(200)}
          className="w-full max-w-sm rounded-[32px] p-8 border border-white/5"
          style={{
            backgroundColor: currentTheme.surface,
            borderColor: `${currentTheme.primary}20`,
          }}
        >
          {/* Icon */}
          <View className="items-center mb-5">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: config.iconBg }}
            >
              <Ionicons
                name={effectiveIcon}
                size={32}
                color={config.iconColor}
              />
            </View>
          </View>

          {/* Title */}
          <AppText
            variant="black"
            size="xl"
            className="text-foreground text-center mb-2"
          >
            {title}
          </AppText>

          {/* Message */}
          <AppText
            variant="medium"
            className="text-center mb-6 leading-6"
            style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}
          >
            {message}
          </AppText>

          {/* Buttons */}
          <View className="flex-row gap-3">
            {/* Cancel Button */}
            {Boolean(cancelText) && (
              <Pressable
                onPress={handleCancel}
                className="flex-1 h-12 rounded-3xl items-center justify-center"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                }}
              >
                <AppText variant="bold" className="text-gray-400">
                  {cancelText}
                </AppText>
              </Pressable>
            )}

            {/* Confirm Button */}
            <Pressable
              onPress={handleConfirm}
              disabled={isLoading}
              className="flex-1 h-12 rounded-3xl items-center justify-center"
              style={{
                backgroundColor: config.buttonColor,
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              <AppText variant="bold" className="text-white">
                {isLoading ? "..." : confirmText}
              </AppText>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * Pre-configured delete confirmation modal
 */
export function DeleteConfirmationModal({
  visible,
  onClose,
  onConfirm,
  itemName = "cet élément",
  isLoading,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  isLoading?: boolean;
}) {
  return (
    <ConfirmationModal
      visible={visible}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Supprimer ?"
      message={`Es-tu sûr de vouloir supprimer ${itemName} ? Cette action est irréversible.`}
      confirmText="Supprimer"
      cancelText="Annuler"
      icon="trash-outline"
      variant="danger"
      isLoading={isLoading}
    />
  );
}

/**
 * Pre-configured reset confirmation modal
 */
export function ResetConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title = "Réinitialiser ?",
  message = "Es-tu sûr de vouloir tout réinitialiser ? Cette action est irréversible et toutes tes données seront perdues.",
  isLoading,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
}) {
  return (
    <ConfirmationModal
      visible={visible}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      message={message}
      confirmText="Réinitialiser"
      cancelText="Annuler"
      icon="refresh"
      variant="danger"
      isLoading={isLoading}
    />
  );
}
