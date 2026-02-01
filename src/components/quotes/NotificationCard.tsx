import * as Haptics from "expo-haptics";
import React from "react";
import { Share, TouchableOpacity, View } from "react-native";
import { THEMES } from "../../constants/themes";
import { toggleFavorite } from "../../services/database";
import { useThemeStore } from "../../stores";
import { AppText } from "../ui";
import { AppIcon } from "../ui/AppIcon";

interface NotificationCardProps {
  id: number;
  quoteId?: number;
  title: string;
  body: string;
  time: string;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  id,
  quoteId,
  title,
  body,
  time,
  isFavorite: initialIsFavorite,
  onFavoritePress
}) => {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const [isFavorite, setIsFavorite] = React.useState(initialIsFavorite);

  const handleFavorite = async () => {
    if (!quoteId) return;
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    await toggleFavorite(quoteId, newStatus);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (onFavoritePress) onFavoritePress();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${body}\n\n— Partagé depuis Nindo`,
      });
    } catch (error) {
      console.error("Erreur partage:", error);
    }
  };

  return (
    <View 
      className="mb-4 rounded-[40px] overflow-hidden border border-white/10"
      style={{ 
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        // Note: Expo blur is tricky without extra deps, but we use semi-transparent bg for the effect
      }}
    >
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="bg-black/40 w-12 h-12 rounded-2xl items-center justify-center mr-4">
              <AppIcon name="quote" size={20} color="#fff" />
            </View>
            <View>
              <AppText size="xs" className="text-white/50 mb-0.5">{time}</AppText>
              <AppText variant="black" size="lg" className="text-white uppercase tracking-tighter">
                {title}
              </AppText>
            </View>
          </View>
          <TouchableOpacity className="p-2">
            <AppIcon name="up" size={16} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        </View>

        <AppText className="text-white/80 leading-relaxed mb-6 text-base" style={{ fontFamily: "Poppins_400Regular" }}>
          {body}
        </AppText>

        <View className="flex-row items-center border-t border-white/5 pt-4">
          <TouchableOpacity 
            onPress={handleFavorite}
            className="flex-1 items-center justify-center py-2"
          >
            <AppText variant="bold" className={isFavorite ? "text-primary" : "text-white/80"}>
              {isFavorite ? "Favori !" : "Favori"}
            </AppText>
          </TouchableOpacity>
          
          <View className="w-[1px] h-4 bg-white/10" />

          <TouchableOpacity 
            onPress={handleShare}
            className="flex-1 items-center justify-center py-2"
          >
            <AppText variant="bold" className="text-white/80">Partager</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
