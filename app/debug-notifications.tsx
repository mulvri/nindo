import { NotificationDebugPanel } from "@/src/components/debug/NotificationDebugPanel";
import { ScreenHeader } from "@/src/components/ui";
import { THEMES } from "@/src/constants/themes";
import { useThemeStore } from "@/src/stores";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function DebugNotificationsScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  return (
    <View className="flex-1" style={{ backgroundColor: currentTheme.background }}>
      <ScreenHeader
        title="Debug Notifications"
        onBack={() => router.back()}
      />
      <NotificationDebugPanel />
    </View>
  );
}
