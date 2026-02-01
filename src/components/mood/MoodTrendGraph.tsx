import { AppText } from "@/src/components/ui/AppText";
import { THEMES } from "@/src/constants/themes";
import { getMoodTrendData, MoodTrendPoint } from "@/src/services/database";
import { useThemeStore } from "@/src/stores";
import React, { useEffect, useState } from "react";
import { Dimensions, View } from "react-native";
import { AppIcon, IconConcept } from "../ui/AppIcon";
import { Skeleton } from "../ui/Skeleton";
import { Period, TimePeriodSelector } from "./TimePeriodSelector";

// Mood configuration avec couleurs
interface MoodConfig {
  id: string;
  icon: IconConcept;
  label: string;
  color: string;
}

const getMoodConfigs = (primaryColor: string): MoodConfig[] => [
  { id: "shonen", icon: "shonen", label: "Shonen", color: primaryColor },
  { id: "zen", icon: "zen", label: "Zen", color: "#4ECDC4" },
  { id: "shadow", icon: "shadow", label: "Shinobi", color: "#95A3B3" },
  { id: "friendship", icon: "friendship", label: "Nakama", color: "#FFD93D" },
  { id: "fire", icon: "fire", label: "Feu", color: "#FF6B9D" },
];

// Map database mood IDs to short IDs
const MOOD_ID_MAP: Record<string, string> = {
  shonen_spirit: "shonen",
  zen_master: "zen",
  dark_shinobi: "shadow",
  nakama_power: "friendship",
  determination: "fire",
};

const screenWidth = Dimensions.get("window").width;

export const MoodTrendGraph = () => {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const moodConfigs = getMoodConfigs(currentTheme.primary);

  const [period, setPeriod] = useState<Period>(30);
  const [data, setData] = useState<MoodTrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const trendData = await getMoodTrendData(period);
      setData(trendData);
    } catch (error) {
      console.error("Failed to load trend data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Transform and aggregate data
  const getAggregatedData = () => {
    let aggregatedData: { date: string; total: number }[] = [];

    if (period === 90) {
      // Aggregate by week
      for (let i = 0; i < data.length; i += 7) {
        const weekData = data.slice(i, i + 7);
        const total = weekData.reduce((sum, day) => sum + day.total, 0);
        aggregatedData.push({
          date: weekData[0]?.date || "",
          total,
        });
      }
    } else if (period === 30) {
      // Aggregate by 3 days
      for (let i = 0; i < data.length; i += 3) {
        const chunkData = data.slice(i, i + 3);
        const total = chunkData.reduce((sum, day) => sum + day.total, 0);
        aggregatedData.push({
          date: chunkData[0]?.date || "",
          total,
        });
      }
    } else {
      // Daily for 7 days
      aggregatedData = data.map((point) => ({
        date: point.date,
        total: point.total,
      }));
    }

    return aggregatedData;
  };

  const aggregatedData = getAggregatedData();
  const hasData = data.some((point) => point.total > 0);
  const maxValue = Math.max(...aggregatedData.map((d) => d.total), 1);
  const chartWidth = screenWidth - 80; // Account for padding

  // Format date label
  const formatLabel = (date: string, index: number): string => {
    if (!date) return "";
    const d = new Date(date);

    if (period === 7) {
      const days = ["D", "L", "M", "M", "J", "V", "S"];
      return days[d.getDay()];
    } else if (period === 30) {
      if (index % 2 === 0) {
        return `${d.getDate()}/${d.getMonth() + 1}`;
      }
      return "";
    } else {
      if (index % 2 === 0) {
        return `S${index + 1}`;
      }
      return "";
    }
  };

  return (
    <View
      className="bg-surface rounded-3xl p-5 border border-white/5"
      style={{ borderColor: `${currentTheme.primary}20` }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <AppText variant="black" size="xl" className="text-foreground">
          Évolution
        </AppText>
        <TimePeriodSelector selected={period} onSelect={setPeriod} />
      </View>

      {/* Chart */}
      {isLoading ? (
        <View className="h-48 justify-center">
          <Skeleton height={180} borderRadius={16} />
        </View>
      ) : hasData ? (
        <View className="h-48">
          {/* Simple bar chart */}
          <View className="flex-1 flex-row items-end justify-between px-2">
            {aggregatedData.map((point, index) => {
              const barHeight = maxValue > 0
                ? (point.total / maxValue) * 140
                : 0;

              return (
                <View
                  key={index}
                  className="items-center flex-1"
                  style={{ maxWidth: chartWidth / aggregatedData.length }}
                >
                  {/* Bar */}
                  <View
                    className="rounded-t-lg mb-2"
                    style={{
                      height: Math.max(barHeight, point.total > 0 ? 8 : 2),
                      width: period === 7 ? 24 : period === 30 ? 16 : 12,
                      backgroundColor: point.total > 0
                        ? currentTheme.primary
                        : "rgba(255,255,255,0.1)",
                    }}
                  />
                  {/* Label */}
                  <AppText
                    size="xs"
                    className="text-gray-500"
                    style={{ fontSize: 9 }}
                  >
                    {formatLabel(point.date, index)}
                  </AppText>
                </View>
              );
            })}
          </View>

          {/* Y-axis indicator */}
          <View className="absolute left-0 top-0 bottom-6 justify-between">
            <AppText size="xs" className="text-gray-500" style={{ fontSize: 9 }}>
              {maxValue}
            </AppText>
            <AppText size="xs" className="text-gray-500" style={{ fontSize: 9 }}>
              0
            </AppText>
          </View>
        </View>
      ) : (
        <View className="h-48 items-center justify-center">
          <AppIcon name="chart" size={48} color="#666" />
          <AppText size="sm" className="text-gray-500 mt-3 text-center">
            Pas encore de données pour cette période
          </AppText>
        </View>
      )}

      {/* Legend */}
      <View className="flex-row flex-wrap gap-3 mt-4 pt-4 border-t border-white/5">
        {moodConfigs.map((mood) => (
          <View key={mood.id} className="flex-row items-center">
            <View
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: mood.color }}
            />
            <AppText size="xs" className="text-gray-400">
              {mood.label}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
};
