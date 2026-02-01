/**
 * Motivational messages and insights utility functions
 */

/**
 * Achievement motivational messages by ID
 */
const ACHIEVEMENT_MESSAGES: Record<string, string> = {
  streak_3: "Le voyage de mille lieues commence par un pas. Continue !",
  streak_7: "Une semaine complète ! Ta détermination est impressionnante !",
  streak_14: "Deux semaines de persévérance ! Tu forges ton Nindo !",
  streak_30: "Un mois entier ! Ton esprit est inébranlable comme Naruto !",
  streak_60: "Deux mois ! Tu es sur le chemin de la légende !",
  streak_100: "100 JOURS ! Tu es devenu une véritable légende Shinobi !",
};

/**
 * Get a motivational message for an achievement
 */
export function getAchievementMessage(achievementId: string): string {
  return ACHIEVEMENT_MESSAGES[achievementId] || "Bravo pour cet accomplissement !";
}

/**
 * Mood stat interface for insight generation
 */
export interface MoodStat {
  mood: string;
  count: number;
  percentage: number;
}

/**
 * Mood labels for insight messages
 */
const MOOD_LABELS: Record<string, string> = {
  shonen: "Esprit Shonen",
  shonen_spirit: "Esprit Shonen",
  zen: "Maître Zen",
  zen_master: "Maître Zen",
  shadow: "Shinobi de l'Ombre",
  dark_shinobi: "Shinobi de l'Ombre",
  friendship: "Pouvoir de l'Amitié",
  nakama_power: "Pouvoir de l'Amitié",
  fire: "Volonté de Feu",
  determination: "Volonté de Feu",
};

/**
 * Generate an insight message based on mood statistics
 */
export function getMoodInsight(stats: MoodStat[]): string {
  if (stats.length === 0) return "";

  const dominant = stats[0];

  if (dominant.percentage >= 50) {
    const moodName = MOOD_LABELS[dominant.mood] || dominant.mood;
    return `Tu es très régulier en mode "${moodName}" !`;
  }

  if (stats.length >= 4) {
    return "Ta palette émotionnelle est très variée !";
  }

  if (dominant.mood === "zen" || dominant.mood === "zen_master") {
    return "Tu sembles avoir trouvé la paix intérieure";
  }

  if (dominant.mood === "shonen" || dominant.mood === "shonen_spirit") {
    return "L'énergie de combat est forte en toi !";
  }

  return "Continue à explorer tes différents moods !";
}

/**
 * Random motivational quotes for streak broken modal
 */
const STREAK_BROKEN_QUOTES = [
  "Un ninja n'abandonne jamais. Relève-toi !",
  "La chute n'est pas un échec, rester à terre en est un.",
  "Chaque maître était autrefois un débutant.",
  "La vraie force, c'est de recommencer.",
  "Même Naruto a échoué plusieurs fois avant de réussir.",
];

/**
 * Get a random quote for streak broken modal
 */
export function getRandomStreakBrokenQuote(): string {
  const index = Math.floor(Math.random() * STREAK_BROKEN_QUOTES.length);
  return STREAK_BROKEN_QUOTES[index];
}
