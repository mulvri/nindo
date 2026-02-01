/**
 * Mood-related utility functions
 */

/**
 * Mood description mapping
 */
const MOOD_DESCRIPTIONS: Record<string, string> = {
  shonen_spirit: "Motivation intense, énergie débordante",
  zen_master: "Calme, sagesse et sérénité",
  dark_shinobi: "Introspection et réflexion profonde",
  nakama_power: "Connexion et liens forts",
  determination: "Volonté inébranlable, focus total",
};

/**
 * Get the description for a mood ID
 */
export function getMoodDescription(moodId: string): string {
  return MOOD_DESCRIPTIONS[moodId] || "";
}

/**
 * Mood configuration for stats display
 */
export interface MoodConfig {
  icon: string;
  label: string;
  color: string;
}

/**
 * Mood configurations for display
 */
const MOOD_CONFIGS: Record<string, MoodConfig> = {
  shonen: { icon: "shonen", label: "Esprit Shonen", color: "#FF6B35" },
  shonen_spirit: { icon: "shonen", label: "Esprit Shonen", color: "#FF6B35" },
  zen: { icon: "zen", label: "Maître Zen", color: "#4ECDC4" },
  zen_master: { icon: "zen", label: "Maître Zen", color: "#4ECDC4" },
  shadow: { icon: "shadow", label: "Shinobi de l'Ombre", color: "#95A3B3" },
  dark_shinobi: { icon: "shadow", label: "Shinobi de l'Ombre", color: "#95A3B3" },
  friendship: { icon: "friendship", label: "Pouvoir de l'Amitié", color: "#FFD93D" },
  nakama_power: { icon: "friendship", label: "Pouvoir de l'Amitié", color: "#FFD93D" },
  fire: { icon: "fire", label: "Volonté de Feu", color: "#FF6B9D" },
  determination: { icon: "fire", label: "Volonté de Feu", color: "#FF6B9D" },
};

/**
 * Get the configuration for a mood ID
 */
export function getMoodConfig(moodId: string): MoodConfig | null {
  return MOOD_CONFIGS[moodId] || null;
}

/**
 * Get all mood configurations
 */
export function getAllMoodConfigs(): Record<string, MoodConfig> {
  return MOOD_CONFIGS;
}
