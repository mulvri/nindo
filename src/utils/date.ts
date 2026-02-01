/**
 * Date utility functions for the Nindo app
 */

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDateToYYYYMMDD(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get today's date at midnight (00:00:00)
 */
export function getTodayMidnight(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Calculate the difference in days between two dates
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = getTodayMidnight();
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return compareDate.getTime() === today.getTime();
}

/**
 * Get the French day name abbreviation
 */
export function getFrenchDayAbbr(date: Date): string {
  const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  return DAYS_FR[date.getDay()];
}
