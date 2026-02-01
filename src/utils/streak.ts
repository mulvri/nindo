/**
 * Streak-related utility functions
 */

/**
 * Get the flame icon size based on streak count
 * Higher streaks = bigger flame
 */
export function getFlameSize(streak: number): number {
  if (streak >= 100) return 48;
  if (streak >= 30) return 44;
  if (streak >= 14) return 40;
  if (streak >= 7) return 36;
  if (streak >= 3) return 32;
  return 28;
}

/**
 * Get a motivational message based on streak count
 */
export function getStreakMotivationMessage(streak: number): string {
  if (streak >= 100) return "Tu es une LÉGENDE ! 100 jours de discipline pure.";
  if (streak >= 60) return "Maître de la persévérance ! Continue sur cette lancée.";
  if (streak >= 30) return "Un mois complet ! Ta volonté est inébranlable.";
  if (streak >= 14) return "Deux semaines ! Tu as prouvé ta détermination.";
  if (streak >= 7) return "Une semaine complète ! Ton entraînement porte ses fruits.";
  if (streak >= 3) return "3 jours ! L'habitude commence à se former.";
  return "Chaque jour compte. Continue !";
}

/**
 * Streak day status types
 */
export type StreakStatus = "completed" | "missed" | "grace" | "future" | "today" | "unknown";

/**
 * Styles for streak calendar day cells
 */
export interface StreakStatusStyles {
  bg: string;
  border: string;
  icon: "checkmark" | "shield-checkmark" | "close" | "ellipse" | null;
  iconColor: string;
}

/**
 * Get visual styles for a streak status
 */
export function getStreakStatusStyles(status: StreakStatus, primaryColor: string): StreakStatusStyles {
  switch (status) {
    case "completed":
      return {
        bg: `${primaryColor}20`,
        border: primaryColor,
        icon: "checkmark",
        iconColor: primaryColor,
      };
    case "grace":
      return {
        bg: "#FFA50020",
        border: "#FFA500",
        icon: "shield-checkmark",
        iconColor: "#FFA500",
      };
    case "missed":
      return {
        bg: "#FF444420",
        border: "#FF4444",
        icon: "close",
        iconColor: "#FF4444",
      };
    case "today":
      return {
        bg: "#3B82F620",
        border: "#3B82F6",
        icon: "ellipse",
        iconColor: "#3B82F6",
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
}
