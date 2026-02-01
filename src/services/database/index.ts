export {
    addNotificationToHistory,
    addReminder,
    clearNotificationHistory,
    createCustomQuote,
    db,
    deleteCustomQuote,
    deleteNotification,
    deleteReminder,
    getFavoriteQuotes,
    getFilteredQuotes,
    getMoodHistory,
    getMoodStats,
    getMoodTrendData,
    getNotificationHistory,
    getReminders,
    getStats,
    getStreakHistory,
    getTodayMood,
    getUnlockedAchievements,
    getUnnotifiedAchievements,
    getUserCreatedQuotes,
    getUserPreferences,
    hasMoodSelectedToday,
    initializeDatabase,
    markAchievementNotified,
    markNotificationAsRead,
    resetDatabase,
    saveUserPreferences,
    selectDailyMood,
    shouldAskMoodToday,
    toggleFavorite,
    updateReminder,
    updateStreak
} from "./client";
export type { Achievement, MoodHistory, MoodTrendPoint, Quote, StreakHistory, StreakUpdateResult } from "./client";
export { achievements, moodHistory, notificationHistory, quotes, reminders, streakHistory, userPreferences } from "./schema";
export type { UserPreferences } from "./schema";

