import { AppPoppinsText as AppText } from "@/src/components/ui/AppText";
import { THEMES } from "@/src/constants/themes";
import { updateReminder } from "@/src/services/database";
import { useThemeStore } from "@/src/stores";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { SettingsModal } from "./SettingsModal";

interface EditReminderModalProps {
  visible: boolean;
  reminder: any;
  onClose: () => void;
  onSave: () => void;
}

const DAYS = [
  { id: 1, label: "L" },
  { id: 2, label: "M" },
  { id: 3, label: "M" },
  { id: 4, label: "J" },
  { id: 5, label: "V" },
  { id: 6, label: "S" },
  { id: 7, label: "D" },
];

export function EditReminderModal({ visible, reminder, onClose, onSave }: EditReminderModalProps) {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (reminder) {
      setFormData({
        ...reminder,
        repeatDays: JSON.parse(reminder.repeatDays || "[1,2,3,4,5,6,7]")
      });
    }
  }, [reminder, visible]);

  if (!formData) return null;

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const dataToSave = {
      ...formData,
      repeatDays: JSON.stringify(formData.repeatDays)
    };

    if (formData.id) {
      await updateReminder(formData.id, dataToSave);
    }
    
    onSave();
    onClose();
  };


  const toggleDay = (dayId: number) => {
    const newDays = formData.repeatDays.includes(dayId)
      ? formData.repeatDays.filter((id: number) => id !== dayId)
      : [...formData.repeatDays, dayId].sort();
    setFormData({ ...formData, repeatDays: newDays });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const adjustCount = (val: number) => {
    const next = Math.max(1, Math.min(20, (formData.count || 1) + val));
    setFormData({ ...formData, count: next });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const adjustTime = (field: "startTime" | "endTime", delta: number) => {
    const [h, m] = formData[field].split(":").map(Number);
    let totalMinutes = h * 60 + m + delta;
    if (totalMinutes < 0) totalMinutes = 0;
    if (totalMinutes > 1439) totalMinutes = 1439;
    
    const newH = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const newM = (totalMinutes % 60).toString().padStart(2, "0");
    setFormData({ ...formData, [field]: `${newH}:${newM}` });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SettingsModal
      visible={visible}
      onClose={onClose}
      title="Modifier le rappel"
    >
      <View className="bg-abyss/50 rounded-3xl p-2 mb-6">
        {/* Count selector */}
        {formData.type === 'quote' && (
          <View className="flex-row items-center justify-between p-4 border-b border-white/5">
            <AppText className="text-gray-400">Nombre de doses/jour</AppText>
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => adjustCount(-1)} className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                <AppText className="text-2xl text-foreground">−</AppText>
              </TouchableOpacity>
              <AppText variant="bold" className="mx-4 text-foreground text-lg">{formData.count}x</AppText>
              <TouchableOpacity onPress={() => adjustCount(1)} className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                <AppText className="text-2xl text-foreground">+</AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Time pickers */}
        <View className="flex-row items-center justify-between p-4 border-b border-white/5">
          <AppText className="text-gray-400">
            {formData.type === 'quote' ? "Commencer à" : "Heure du rappel"}
          </AppText>
          <View className="flex-row items-center">
             <TouchableOpacity onPress={() => adjustTime("startTime", -30)} className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                <AppText className="text-2xl text-foreground">−</AppText>
              </TouchableOpacity>
            <AppText variant="bold" className="mx-4 text-foreground text-lg">{formData.startTime}</AppText>
            <TouchableOpacity onPress={() => adjustTime("startTime", 30)} className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                <AppText className="text-2xl text-foreground">+</AppText>
              </TouchableOpacity>
          </View>
        </View>

        {formData.type === 'quote' && (
          <View className="flex-row items-center justify-between p-4 border-b border-white/5">
            <AppText className="text-gray-400">Finir à</AppText>
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => adjustTime("endTime", -30)} className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                  <AppText className="text-2xl text-foreground">−</AppText>
                </TouchableOpacity>
              <AppText variant="bold" className="mx-4 text-foreground text-lg">{formData.endTime}</AppText>
              <TouchableOpacity onPress={() => adjustTime("endTime", 30)} className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                  <AppText className="text-2xl text-foreground">+</AppText>
                </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Days selector */}
        <View className="p-4">
          <AppText className="text-gray-400 mb-4">Répéter</AppText>
          <View className="flex-row justify-between">
            {DAYS.map((day) => {
              const active = formData.repeatDays.includes(day.id);
              return (
                <TouchableOpacity 
                  key={day.id}
                  onPress={() => toggleDay(day.id)}
                  className={`w-10 h-10 rounded-full items-center justify-center ${active ? '' : 'bg-gray-800'}`}
                  style={active ? { backgroundColor: currentTheme.primary + '30', borderWidth: 1, borderColor: currentTheme.primary } : {}}
                >
                  <AppText variant="bold" className={active ? "text-foreground" : "text-gray-500"}>{day.label}</AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSave}
        className="w-full py-5 rounded-[32px] items-center justify-center mb-4"
        style={{ backgroundColor: currentTheme.primary }}
      >
        <AppText variant="black" className="text-white uppercase tracking-wider">Sauvegarder</AppText>
      </TouchableOpacity>
    </SettingsModal>
  );
}
