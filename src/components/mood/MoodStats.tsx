import { AppText } from "@/src/components/ui/AppText";
import { THEMES } from "@/src/constants/themes";
import { getMoodHistory } from "@/src/services/database";
import { useThemeStore } from "@/src/stores";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { AppIcon, IconConcept } from "../ui/AppIcon";

interface MoodStat {
  mood: string;
  count: number;
  percentage: number;
}

export const MoodStats = () => {
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

  // Fonction pour générer un insight personnalisé
  const getInsight = (stats: MoodStat[]): string => {
    if (stats.length === 0) return "";

    const dominant = stats[0];
    
    if (dominant.percentage >= 50) {
      const moodName = MOODS[dominant.mood as keyof typeof MOODS]?.label;
      return `Tu es très régulier en mode "${moodName}" !`;
    }

    if (stats.length >= 4) {
      return "Ta palette émotionnelle est très variée !";
    }

    if (dominant.mood === "zen") {
      return "Tu sembles avoir trouvé la paix intérieure";
    }

    if (dominant.mood === "shonen") {
      return "L'énergie de combat est forte en toi !";
    }

    return "Continue à explorer tes différents moods !";
  };

  const [stats, setStats] = useState<MoodStat[]>([]);
  const [totalDays, setTotalDays] = useState(0);
  const [dominantMood, setDominantMood] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Charger l'historique du mois en cours (30 jours)
      const history = await getMoodHistory(30);
      
      if (history.length === 0) {
        return;
      }

      // Calculer les statistiques
      const moodCounts: Record<string, number> = {};
      
      history.forEach((entry: any) => {
        const mood = entry.mood;
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });

      const total = history.length;
      setTotalDays(total);

      // Créer les stats avec pourcentages
      const statsArray = Object.entries(moodCounts)
        .map(([mood, count]) => ({
          mood,
          count,
          percentage: Math.round((count / total) * 100),
        }))
        .sort((a, b) => b.count - a.count);

      setStats(statsArray);
      
      // Mood dominant
      if (statsArray.length > 0) {
        setDominantMood(statsArray[0].mood);
      }
    } catch (error) {
      console.error("Failed to load mood stats:", error);
    }
  };

  if (stats.length === 0) {
    return (
      <View
        className="bg-surface rounded-3xl p-6 border border-white/5"
        style={{ borderColor: `${currentTheme.primary}20` }}
      >
        <View className="items-center">
          <AppIcon name="chart" size={48} color="#666" />
          <AppText size="sm" className="text-gray-500 mt-3 text-center">
            Sélectionne ton mood pendant quelques jours{"\n"}pour voir tes statistiques
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <View
      className="bg-surface rounded-3xl p-5 border border-white/5"
      style={{ borderColor: `${currentTheme.primary}20` }}
    >
      {/* En-tête */}
      <View className="flex-row items-center justify-between mb-6">
        <AppText variant="black" size="xl" className="text-foreground">Statistiques</AppText>
        <View className="flex-row items-center">
          <AppIcon name="calendar" size={16} color="#888" />
          <AppText size="sm" className="text-gray-500 ml-1">{totalDays} jours</AppText>
        </View>
      </View>

      {/* Mood dominant */}
      {dominantMood && (
        <View
          className="bg-primary/10 rounded-3xl p-4 mb-5 border border-primary/10"
          style={{ borderColor: `${currentTheme.primary}20` }}
        >
          <AppText variant="bold" size="xs" className="text-gray-500 mb-2">TON MOOD DOMINANT</AppText>
          <View className="flex-row items-center">
            <AppIcon 
              name={MOODS[dominantMood as keyof typeof MOODS]?.icon} 
              size={32} 
              color={MOODS[dominantMood as keyof typeof MOODS]?.color}
              containerStyle={{ marginRight: 12 }}
            />
            <AppText variant="black" size="lg" className="text-foreground">
              {MOODS[dominantMood as keyof typeof MOODS]?.label}
            </AppText>
          </View>
        </View>
      )}

      {/* Barres de progression */}
      <View className="gap-y-3">
        {stats.map((stat) => {
          const moodData = MOODS[stat.mood as keyof typeof MOODS];
          if (!moodData) return null;

          return (
            <View key={stat.mood}>
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <AppIcon 
                    name={moodData.icon} 
                    size={20} 
                    color={moodData.color}
                    containerStyle={{ marginRight: 8 }}
                  />
                  <AppText variant="bold" size="sm" className="text-foreground flex-1" numberOfLines={1}>
                    {moodData.label}
                  </AppText>
                </View>
                <AppText variant="black" size="sm" className="text-primary ml-2">
                  {stat.percentage}%
                </AppText>
              </View>
              
              {/* Barre de progression */}
              <View className="h-2 bg-white/5 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${stat.percentage}%`,
                    backgroundColor: moodData.color,
                  }}
                />
              </View>
              
              <AppText size="xs" className="text-gray-500 mt-1">
                {stat.count} jour{stat.count > 1 ? "s" : ""}
              </AppText>
            </View>
          );
        })}
      </View>

      {/* Insight personnalisé */}
      <View className="mt-5 pt-5 border-t border-white/5 flex-row items-center justify-center">
        <AppIcon name="sparkles" size={16} color="#9CA3AF" containerStyle={{ marginRight: 8 }} />
        <AppText variant="medium" size="xs" className="text-gray-400 text-center">
          {getInsight(stats)}
        </AppText>
      </View>
    </View>
  );
};
