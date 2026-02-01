import { AppText } from "@/src/components/ui/AppText";
import { THEMES } from "@/src/constants/themes";
import { getMoodHistory } from "@/src/services/database";
import { useThemeStore } from "@/src/stores";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { AppIcon, IconConcept } from "../ui/AppIcon";

interface MoodEntry {
  date: string;
  mood: string;
  selectedAt: string;
  source: string;
}

export const MoodCalendar = () => {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  // Mood definitions avec icones
  const MOODS = {
    shonen: { icon: "shonen" as IconConcept, label: "Esprit Shonen", color: currentTheme.primary },
    zen: { icon: "zen" as IconConcept, label: "Maître Zen", color: "#4ECDC4" },
    shadow: { icon: "shadow" as IconConcept, label: "Shinobi de l'Ombre", color: "#95A3B3" },
    friendship: { icon: "friendship" as IconConcept, label: "Pouvoir de l'Amitié", color: "#FFD93D" },
    fire: { icon: "fire" as IconConcept, label: "Volonté de Feu", color: "#FF6B9D" },
  };

  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadMoodHistory();
  }, [currentMonth]);

  const loadMoodHistory = async () => {
    try {
      // Charger 30 derniers jours
      const history = await getMoodHistory(30);
      setMoodEntries(history as MoodEntry[]);
    } catch (error) {
      console.error("Failed to load mood history:", error);
    }
  };

  // Générer les jours du mois actuel
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Ajouter des espaces vides pour aligner le premier jour
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Ajouter tous les jours du mois
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getMoodForDate = (date: Date | null) => {
    if (!date) return null;
    const dateStr = date.toISOString().split("T")[0];
    const entry = moodEntries.find((e) => e.date === dateStr);
    return entry ? entry.mood : null;
  };

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <View
      className="bg-surface rounded-3xl p-5 border border-white/5"
      style={{ borderColor: `${currentTheme.primary}20` }}
    >
      {/* En-tête */}
      <View className="flex-row items-center justify-between mb-6">
        <AppText variant="black" size="xl" className="text-foreground capitalize">{monthName}</AppText>
        <AppIcon name="calendar" size={24} color={theme === "dark" ? "#fff" : "#0A0A0A"} />
      </View>

      {/* Jours de la semaine */}
      <View className="flex-row justify-around mb-3">
        {["D", "L", "M", "M", "J", "V", "S"].map((day, index) => (
          <View key={index} className="w-10 items-center">
            <AppText variant="bold" size="xs" className="text-gray-500">{day}</AppText>
          </View>
        ))}
      </View>

      {/* Grille du calendrier */}
      <ScrollView className="max-h-80">
        <View className="flex-row flex-wrap">
          {days.map((date, index) => {
            const mood = getMoodForDate(date);
            const moodData = mood ? MOODS[mood as keyof typeof MOODS] : null;
            const isToday =
              date &&
              date.toDateString() === new Date().toDateString();

            return (
              <View
                key={index}
                className="w-10 h-10 items-center justify-center m-1"
              >
                {date ? (
                  <View
                    className={`w-full h-full rounded-xl items-center justify-center ${
                      isToday ? "border-2 border-primary" : ""
                    } ${moodData ? "" : "bg-white/5"}`}
                    style={
                      moodData
                        ? {
                            backgroundColor: moodData.color + "20",
                            borderColor: moodData.color,
                            borderWidth: 1,
                          }
                        : {}
                    }
                  >
                    {moodData ? (
                      <AppIcon name={moodData.icon} size={20} color={moodData.color} />
                    ) : (
                      <AppText size="xs" className="text-gray-600">
                        {date.getDate()}
                      </AppText>
                    )}
                  </View>
                ) : (
                  <View />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Légende */}
      <View className="mt-4 pt-4 border-t border-white/5">
        <AppText variant="bold" size="xs" className="text-gray-500 mb-2">Légende</AppText>
        <View className="flex-row flex-wrap gap-2">
          {Object.entries(MOODS).map(([key, value]) => (
            <View key={key} className="flex-row items-center mr-3 mb-1">
              <AppIcon name={value.icon} size={14} color={value.color} containerStyle={{ marginRight: 4 }} />
              <AppText size="xs" className="text-gray-400">{value.label.split(" ").pop()}</AppText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
