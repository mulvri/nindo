import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Table des préférences utilisateur
export const userPreferences = sqliteTable("user_preferences", {
  id: integer("id").primaryKey(),
  onboardingCompleted: integer("onboarding_completed", { mode: "boolean" }).default(false),
  favoriteAnimes: text("favorite_animes").default("[]"), // Stored as JSON string
  selectedMoods: text("selected_moods").default("[]"),   // Stored as JSON string
  lastOpeningDate: text("last_opening_date"),            // ISO string
  username: text("username").default("Ninja Anonyme"),
  xp: integer("xp").default(0),
  streakCount: integer("streak_count").default(0),
  chakraColor: text("chakra_color").default("#FF6B35"),
  reminderTime: text("reminder_time").default("08:00"), // Default reminder at 8 AM
  theme: text("theme").default("light"), // "light" or "dark"

  // NOUVEAUX CHAMPS - Phase 1
  firstName: text("first_name").default(""),                    // Prénom de l'utilisateur
  moodReminderEnabled: integer("mood_reminder_enabled", { mode: "boolean" }).default(true),
  moodReminderFrequency: text("mood_reminder_frequency").default("daily"), // "daily" | "2days" | "3weekly" | "weekly" | "disabled"
  streakReminderEnabled: integer("streak_reminder_enabled", { mode: "boolean" }).default(true),
  bestStreak: integer("best_streak").default(0),                // Meilleur streak historique
  totalDaysOpened: integer("total_days_opened").default(0),     // Nombre total de jours
  lastMoodDate: text("last_mood_date"),                         // Dernière sélection de mood (YYYY-MM-DD)
  currentDayMood: text("current_day_mood"),                     // Mood du jour actuel
  
  // NOUVEAUX CHAMPS - Phase 3 (Fonts)
  quoteFontFamily: text("quote_font_family").default("Poppins_400Regular"),
  quoteFontScale: integer("quote_font_scale").default(1),
  appFontFamily: text("app_font_family").default("poppins"),
  
  // NOUVEAUX CHAMPS - Phase 4 (Notifications Citations)
  quoteNotificationsEnabled: integer("quote_notifications_enabled", { mode: "boolean" }).default(false),
  quoteNotificationsFrequency: text("quote_notifications_frequency").default("1"), // "1" | "3" | "5" | "10"
  quoteNotificationsMoods: text("quote_notifications_moods").default("[]"), // IDs des moods préférés
});

// Table historique des moods
export const moodHistory = sqliteTable("mood_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),                    // Format YYYY-MM-DD
  mood: text("mood").notNull(),                    // ID du mood sélectionné
  selectedAt: text("selected_at").notNull(),       // Timestamp ISO de sélection
  source: text("source").default("app"),           // "notification" | "app" | "retroactive"
});

// Table historique des streaks
export const streakHistory = sqliteTable("streak_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),                    // Format YYYY-MM-DD
  status: text("status").notNull(),                // "completed" | "missed" | "grace"
  streakCountAtDay: integer("streak_count_at_day").default(0),
});

// Table historique des notifications
export const notificationHistory = sqliteTable("notification_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quoteId: integer("quote_id").references(() => quotes.id), // Référence vers la citation (si applicable)
  title: text("title"),                                     // Titre de la notif
  body: text("body"),                                       // Contenu
  sentAt: text("sent_at").notNull(),                        // Timestamp ISO
  type: text("type").notNull(),                             // "quote" | "mood_reminder" | "streak_danger"
  isRead: integer("is_read", { mode: "boolean" }).default(false),
});

// Table des achievements
export const achievements = sqliteTable("achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  achievementId: text("achievement_id").notNull(), // "streak_3", "streak_7", etc.
  unlockedAt: text("unlocked_at").notNull(),       // Timestamp ISO
  notified: integer("notified", { mode: "boolean" }).default(false),
});

// Table des citations
export const quotes = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  author: text("author").notNull(),
  anime: text("anime").notNull(),
  mood: text("mood").notNull(),
  isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
  isUserCreated: integer("is_user_created", { mode: "boolean" }).default(false),
  backgroundImage: text("background_image"),
  fontStyle: text("font_style").default("default"),
});

// Table des rappels (Reminders)
export const reminders = sqliteTable("reminders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),                             // "mood" | "quote" | "streak"
  title: text("title"),                                     // Titre personnalisé
  enabled: integer("enabled", { mode: "boolean" }).default(true),
  count: integer("count").default(1),                       // Nombre de citations/rappels
  startTime: text("start_time").default("09:00"),           // HH:mm
  endTime: text("end_time").default("21:00"),               // HH:mm
  repeatDays: text("repeat_days").default("[1,2,3,4,5,6,7]"),// JSON array de 1-7 (Lundi-Dimanche)
  category: text("category").default("General"),            // Catégorie de citations
  sound: text("sound").default("default"),                  // Son du rappel
  createdAt: text("created_at").default(new Date().toISOString()),
});

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type MoodHistory = typeof moodHistory.$inferSelect;
export type StreakHistory = typeof streakHistory.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
