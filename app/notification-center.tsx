import { NotificationCard } from "@/src/components/quotes/NotificationCard";
import { AppIcon, AppText, ScreenHeader } from "@/src/components/ui";
import { THEMES } from "@/src/constants/themes";
import { getNotificationHistory } from "@/src/services/database";
import { useThemeStore } from "@/src/stores";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationCenterScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  const fetchNotifications = async () => {
    const data = await getNotificationHistory();
    setNotifications(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Formater le temps (ex: "17:18")
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex-1 bg-abyss">
      <LinearGradient
        colors={[currentTheme.primary + "15", "transparent"]}
        className="absolute top-0 left-0 right-0 h-96"
      />
      
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />

        <ScreenHeader title="Entraînement" />

        <ScrollView 
          className="flex-1 px-6 pt-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentTheme.primary} />
          }
        >
          {notifications.length === 0 ? (
            <View className="items-center justify-center py-20 opacity-30">
              <AppIcon name="notification" size={64} color={currentTheme.foreground} />
              <AppText variant="bold" className="mt-4 text-center">Aucune notification pour le moment</AppText>
              <AppText size="xs" className="text-center mt-2 px-10">
                Tes citations et rappels d'entraînement apparaîtront ici.
              </AppText>
            </View>
          ) : (
            notifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                id={notif.id}
                quoteId={notif.quoteId}
                title={notif.title || "Motivation"}
                body={notif.body}
                time={formatTime(notif.sentAt)}
              />
            ))
          )}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
