/**
 * Utils barrel export
 */

// Date utilities
export {
  formatDateToYYYYMMDD,
  getDaysDifference,
  getFrenchDayAbbr,
  getTodayMidnight,
  isToday,
} from "./date";

// Streak utilities
export {
  getFlameSize,
  getStreakMotivationMessage,
  getStreakStatusStyles,
} from "./streak";
export type { StreakStatus, StreakStatusStyles } from "./streak";

// Mood utilities
export {
  getAllMoodConfigs,
  getMoodConfig,
  getMoodDescription,
} from "./mood";
export type { MoodConfig } from "./mood";

// Message utilities
export {
  getAchievementMessage,
  getMoodInsight,
  getRandomStreakBrokenQuote,
} from "./messages";
export type { MoodStat } from "./messages";
