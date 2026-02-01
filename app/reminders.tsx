import { AppText, ScreenHeader } from "@/src/components/ui";
import { AppIcon } from "@/src/components/ui/AppIcon";
import { THEMES } from "@/src/constants/themes";
import { getReminders, updateReminder } from "@/src/services/database";
import { NotificationService } from "@/src/services/NotificationService";
import { useThemeStore } from "@/src/stores";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Switch, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EditReminderModal } from "../src/components/settings/EditReminderModal";

import Animated, { FadeInDown } from "react-native-reanimated";

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any>(null);
  const router = useRouter();
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  const fetchReminders = async () => {
    const data = await getReminders();
    setReminders(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReminders();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleToggle = async (reminder: any) => {
    const newStatus = !reminder.enabled;
    await updateReminder(reminder.id, { enabled: newStatus });
    await fetchReminders();
    NotificationService.syncNotifications();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatDays = (daysJson: string) => {
    const days = JSON.parse(daysJson || "[]");
    if (days.length === 7) return "Tous les jours";
    if (days.length === 5 && !days.includes(6) && !days.includes(7)) return "Semaine";
    
    const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    return days.map((d: number) => dayNames[d - 1]).join(", ");
  };

  return (
    <View className="flex-1 bg-abyss">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <ScreenHeader title="Rappels" />

        <ScrollView 
          className="flex-1 px-6 pt-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentTheme.primary} />
          }
        >
          <Animated.View entering={FadeInDown.duration(500).delay(100)}>
            <View className="mb-4 pl-1">
              <AppText size="sm" className="text-gray-400">
                 Configurez votre routine quotidienne pour que la motivation s'adapte à vos habitudes
              </AppText>
            </View>

            <View className="flex-row items-center mb-6 bg-surface/30 p-4 rounded-2xl border border-white/5">
              <View className="opacity-50">
                <AppIcon name="info" size={20} color={currentTheme.foreground} />
              </View>
              <AppText size="xs" className="text-gray-400 ml-3 flex-1">
                Les notifications ne fonctionnent pas ? Vérifie les paramètres de ton appareil.
              </AppText>
            </View>
          </Animated.View>

          {reminders.map((reminder, index) => (
            <Animated.View 
              key={reminder.id} 
              entering={FadeInDown.duration(500).delay(200 + index * 100)}
            >
              <TouchableOpacity 
                onPress={() => setEditingReminder(reminder)}
                activeOpacity={0.7}
                className={`p-6 rounded-3xl mb-4 flex-row items-center justify-between ${
                  reminder.enabled ? "bg-surface" : "bg-abyss border border-white/5 opacity-60"
                }`}
                style={reminder.enabled ? { borderColor: `${currentTheme.primary}15`, borderWidth: 1 } : {}}
              >
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-2">
                    <AppText variant="bold" size="lg" className="text-foreground">
                      {reminder.type === 'mood' ? 'Mood Quotidien' : 
                       reminder.type === 'quote' ? 'Citations Ninja' : 'Rappel de Série'}
                    </AppText>
                    <AppText size="xs" className="text-gray-500">
                      {reminder.type === 'quote' ? `${reminder.startTime} - ${reminder.endTime}` : reminder.startTime}
                    </AppText>
                  </View>
                  <View className="flex-row items-center">
                    <AppText size="sm" className="text-gray-400">
                      {reminder.type === 'quote' ? `${reminder.count}X` : '1X'}
                    </AppText>
                    <View className="w-1 h-1 rounded-full bg-gray-600 mx-2" />
                    <AppText size="sm" className="text-gray-400">
                      {formatDays(reminder.repeatDays)}
                    </AppText>
                  </View>
                </View>
                
                <Switch
                  value={!!reminder.enabled}
                  onValueChange={() => handleToggle(reminder)}
                  trackColor={{ false: "#333", true: currentTheme.primary + "80" }}
                  thumbColor={reminder.enabled ? currentTheme.primary : "#666"}
                  ios_backgroundColor="#333"
                  className="ml-4"
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </SafeAreaView>

      <EditReminderModal 
        visible={!!editingReminder}
        reminder={editingReminder}
        onClose={() => setEditingReminder(null)}
        onSave={async () => {
          await fetchReminders();
          NotificationService.syncNotifications();
        }}
      />
    </View>
  );
}
