import { AppPoppinsText as AppText } from "@/src/components/ui/AppText";
import { THEMES } from "@/src/constants/themes";
import { StreakHistory } from "@/src/services/database";
import { useThemeStore } from "@/src/stores";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface StreakCalendarProps {
  history: StreakHistory[];
  daysToShow?: number;
}

interface DayData {
  date: Date;
  dateStr: string;
  status: "completed" | "missed" | "grace" | "future" | "today" | "unknown";
  isToday: boolean;
}

const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function StreakCalendar({ history, daysToShow = 7 }: StreakCalendarProps) {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  const days = useMemo(() => {
    const result: DayData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create a map of history by date
    const historyMap = new Map<string, StreakHistory>();
    for (const entry of history) {
      historyMap.set(entry.date, entry);
    }

    // Generate days from (daysToShow - 1) days ago to today
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const isToday = i === 0;

      const historyEntry = historyMap.get(dateStr);

      let status: DayData["status"];
      if (isToday) {
        status = historyEntry ? historyEntry.status as DayData["status"] : "today";
      } else if (historyEntry) {
        status = historyEntry.status as DayData["status"];
      } else {
        // No history for this day - it's either missed or unknown
        status = "unknown";
      }

      result.push({ date, dateStr, status, isToday });
    }

    return result;
  }, [history, daysToShow]);

  return (
    <View
      className="bg-surface rounded-3xl p-4 border border-white/5"
      style={{ borderColor: `${currentTheme.primary}20` }}
    >
      <AppText variant="bold" size="xs" className="text-gray-400 uppercase tracking-wider mb-4">
        Derniers {daysToShow} jours
      </AppText>

      <View className="flex-row justify-center" style={{ gap: 8 }}>
        {days.map((day, index) => (
          <Animated.View
            key={day.dateStr}
            entering={FadeInDown.delay(index * 50).springify()}
          >
            <DayCell day={day} primaryColor={currentTheme.primary} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

interface DayCellProps {
  day: DayData;
  primaryColor: string;
}

function DayCell({ day, primaryColor }: DayCellProps) {
  const dayOfWeek = DAYS_FR[day.date.getDay()];
  const dayNumber = day.date.getDate();

  const getStatusStyles = () => {
    switch (day.status) {
      case "completed":
        return {
          bg: `${primaryColor}20`,
          border: primaryColor,
          icon: "checkmark" as const,
          iconColor: primaryColor,
        };
      case "grace":
        return {
          bg: "#FFA50020",
          border: "#FFA500",
          icon: "shield-checkmark" as const,
          iconColor: "#FFA500",
        };
      case "missed":
        return {
          bg: "#FF444420",
          border: "#FF4444",
          icon: "close" as const,
          iconColor: "#FF4444",
        };
      case "today":
        return {
          bg: `${primaryColor}20`,
          border: primaryColor,
          icon: "ellipse" as const,
          iconColor: primaryColor,
        };
      case "future":
        return {
          bg: "#33333320",
          border: "#333333",
          icon: null,
          iconColor: "#666",
        };
      default:
        return {
          bg: "#22222220",
          border: "#222222",
          icon: null,
          iconColor: "#444",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <View className="items-center">
      <AppText variant="medium" className="text-[10px] text-gray-500 mb-1">
        {dayOfWeek}
      </AppText>

      <View
        className="rounded-xl items-center justify-center border-[1px]"
        style={{
          width: 36,
          height: 36,
          backgroundColor: styles.bg,
          borderColor: styles.border,
        }}
      >
        {styles.icon ? (
          <Ionicons name={styles.icon} size={22} color={styles.iconColor} />
        ) : (
          <AppText variant="bold" className="text-gray-500">{dayNumber}</AppText>
        )}
      </View>

      {day.isToday && (
        <View
          className="w-1.5 h-1.5 rounded-full mt-1"
          style={{ backgroundColor: primaryColor }}
        />
      )}
    </View>
  );
}
