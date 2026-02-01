import { SettingsModal } from "@/src/components/settings/SettingsModal";
import { AppText } from "@/src/components/ui";
import { THEMES } from "@/src/constants/themes";
import { useThemeStore } from "@/src/stores";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, View } from "react-native";
import { AppIcon } from "../ui/AppIcon";
import { ACHIEVEMENT_DEFINITIONS } from "./AchievementBadge";

interface AchievementHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AchievementHelpModal: React.FC<AchievementHelpModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  React.useEffect(() => {
    if (visible) {
      Haptics.selectionAsync();
    }
  }, [visible]);

  return (
    <SettingsModal
      visible={visible}
      onClose={onClose}
      title="Guide des Exploits"
    >
      {/* Header descriptif */}
      <View className="flex-row items-center mb-6">
        <View className="w-12 h-12 rounded-2xl bg-primary/20 items-center justify-center mr-4">
          <AppIcon name="trophy" size={24} color={currentTheme.primary} />
        </View>
        <View className="flex-1">
          <AppText variant="bold" className="text-foreground text-base">Paliers de maîtrise</AppText>
          <AppText size="xs" className="text-gray-500">La régularité est la clé du succès</AppText>
        </View>
      </View>

      {/* Steps List */}
      <View className="space-y-3 mb-6">
        {Object.values(ACHIEVEMENT_DEFINITIONS)
          .sort((a, b) => a.streakRequired - b.streakRequired)
          .map((achievement) => (
          <View 
            key={achievement.id} 
            className="flex-row items-center bg-abyss p-4 rounded-3xl border border-white/10"
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: achievement.color + "20" }}
            >
              <Ionicons name={achievement.icon as any} size={24} color={achievement.color} />
            </View>
            <View className="flex-1">
              <AppText variant="bold" className="text-foreground text-base">
                {achievement.streakRequired} Jours
              </AppText>
              <AppText variant="medium" size="xs" className="uppercase tracking-widest" style={{ color: achievement.color }}>
                {achievement.title}
              </AppText>
            </View>
          </View>
        ))}
      </View>

      {/* Close Button */}
      <Pressable
        onPress={onClose}
        className="h-14 rounded-3xl items-center justify-center"
        style={{ backgroundColor: currentTheme.primary }}
      >
        <AppText variant="bold" className="text-white">Compris !</AppText>
      </Pressable>
    </SettingsModal>
  );
};
