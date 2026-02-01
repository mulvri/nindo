import { formatDateToYYYYMMDD, getTodayMidnight } from "@/src/utils";
import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import {
    Achievement,
    achievements,
    moodHistory,
    MoodHistory,
    notificationHistory,
    Quote,
    quotes,
    reminders,
    streakHistory,
    StreakHistory,
    userPreferences
} from "./schema";

const DB_NAME = "nindo.db";

// Initialize SQLite database
const expoDb = SQLite.openDatabaseSync(DB_NAME);

// Initialize Drizzle ORM
export const db = drizzle(expoDb);

// Citations initiales pour le seed
const initialQuotes = [
  { text: "Je ne recule jamais devant ma parole, c'est mon nindo, ma voie du ninja !", author: "Naruto Uzumaki", anime: "Naruto", mood: "determination" },
  { text: "Plus tu travailles dur, plus tu as de chance.", author: "Rock Lee", anime: "Naruto", mood: "shonen_spirit" },
  { text: "Je vais devenir le Roi des Pirates !", author: "Monkey D. Luffy", anime: "One Piece", mood: "shonen_spirit" },
  { text: "L'homme qui ne craint pas la mort, ne craint rien.", author: "Roronoa Zoro", anime: "One Piece", mood: "dark_shinobi" },
  { text: "Les miracles n'arrivent qu'à ceux qui n'abandonnent jamais.", author: "Naruto Uzumaki", anime: "Naruto", mood: "determination" },
  { text: "Plus un homme est seul, plus il est fort.", author: "Itachi Uchiha", anime: "Naruto", mood: "zen_master" },
  { text: "Chaque fois que je tombe, je me relève plus fort.", author: "Goku", anime: "Dragon Ball", mood: "shonen_spirit" },
  { text: "La vraie force, c'est de protéger ceux qu'on aime.", author: "Son Goku", anime: "Dragon Ball", mood: "nakama_power" },
  { text: "La confiance en soi est le premier secret du succès.", author: "All Might", anime: "My Hero Academia", mood: "shonen_spirit" },
  { text: "Un héros est quelqu'un qui aide les autres, peu importe les circonstances.", author: "Izuku Midoriya", anime: "My Hero Academia", mood: "nakama_power" },
  { text: "La douleur me fait grandir. C'est pour ça que je ne fuis jamais.", author: "Tanjiro Kamado", anime: "Demon Slayer", mood: "determination" },
  { text: "Je vais détruire cette malédiction.", author: "Yuji Itadori", anime: "Jujutsu Kaisen", mood: "determination" },
  { text: "Si tu ne te bats pas, tu ne peux pas gagner.", author: "Eren Yeager", anime: "Attack on Titan", mood: "shonen_spirit" },
  { text: "Celui qui ne peut pas sacrifier quoi que ce soit ne pourra jamais rien changer.", author: "Armin Arlert", anime: "Attack on Titan", mood: "dark_shinobi" },
  { text: "Je vaincrai le destin avec mes propres mains.", author: "Ichigo Kurosaki", anime: "Bleach", mood: "determination" },
  // Additional epic quotes
  { text: "Si tu n'aimes pas ton destin, ne l'accepte pas. À la place, aie le courage de le changer.", author: "Naruto Uzumaki", anime: "Naruto", mood: "determination" },
  { text: "Un ninja doit voir à travers la déception.", author: "Kakashi Hatake", anime: "Naruto", mood: "zen_master" },
  { text: "Le pouvoir vient en réponse à un besoin, pas à un désir.", author: "Goku", anime: "Dragon Ball", mood: "shonen_spirit" },
  { text: "Même la plus petite des flammes peut devenir un brasier.", author: "Natsu Dragneel", anime: "Fairy Tail", mood: "nakama_power" },
  { text: "Si tu peux le rêver, tu peux le faire.", author: "Saitama", anime: "One Punch Man", mood: "zen_master" },
  { text: "La vie n'est pas un jeu de chance. Si tu veux gagner, travaille dur.", author: "Sora", anime: "No Game No Life", mood: "determination" },
  { text: "Ceux qui sont capables de se pardonner eux-mêmes sont les plus forts.", author: "Itachi Uchiha", anime: "Naruto", mood: "zen_master" },
  { text: "Tout le monde commence quelque part. L'important c'est de commencer.", author: "Might Guy", anime: "Naruto", mood: "shonen_spirit" },
];

/**
 * Run basic migrations manually for the MVP.
 */
export async function initializeDatabase() {
  try {
    // 1. Create tables
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        onboarding_completed INTEGER DEFAULT 0,
        favorite_animes TEXT DEFAULT '[]',
        selected_moods TEXT DEFAULT '[]',
        last_opening_date TEXT,
        username TEXT DEFAULT 'Ninja Anonyme',
        xp INTEGER DEFAULT 0,
        streak_count INTEGER DEFAULT 0,
        chakra_color TEXT DEFAULT '#FF6B35',
        reminder_time TEXT DEFAULT '08:00',
        theme TEXT DEFAULT 'light'
      )
    `);

    // Safety: Add columns if table already existed without them
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN username TEXT DEFAULT 'Ninja Anonyme'`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN xp INTEGER DEFAULT 0`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN streak_count INTEGER DEFAULT 0`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN chakra_color TEXT DEFAULT '#FF6B35'`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN reminder_time TEXT DEFAULT '08:00'`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN theme TEXT DEFAULT 'light'`);
    } catch(e) {}

    // NOUVEAUX CHAMPS - Phase 1
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN first_name TEXT DEFAULT ''`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN mood_reminder_enabled INTEGER DEFAULT 1`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN mood_reminder_frequency TEXT DEFAULT 'daily'`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN streak_reminder_enabled INTEGER DEFAULT 1`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN best_streak INTEGER DEFAULT 0`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN total_days_opened INTEGER DEFAULT 0`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN last_mood_date TEXT`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN current_day_mood TEXT`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN quote_font_family TEXT DEFAULT 'Poppins_400Regular'`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN quote_font_scale INTEGER DEFAULT 1`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN app_font_family TEXT DEFAULT 'poppins'`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN quote_notifications_enabled INTEGER DEFAULT 0`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN quote_notifications_frequency TEXT DEFAULT '1'`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE user_preferences ADD COLUMN quote_notifications_moods TEXT DEFAULT '[]'`);
    } catch(e) {}

    // Créer les nouvelles tables
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS mood_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        mood TEXT NOT NULL,
        selected_at TEXT NOT NULL,
        source TEXT DEFAULT 'app'
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS streak_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        streak_count_at_day INTEGER DEFAULT 0
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        achievement_id TEXT NOT NULL,
        unlocked_at TEXT NOT NULL,
        notified INTEGER DEFAULT 0
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS notification_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_id INTEGER,
        title TEXT,
        body TEXT,
        sent_at TEXT NOT NULL,
        type TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        FOREIGN KEY (quote_id) REFERENCES quotes(id)
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        title TEXT,
        enabled INTEGER DEFAULT 1,
        count INTEGER DEFAULT 1,
        start_time TEXT DEFAULT '09:00',
        end_time TEXT DEFAULT '21:00',
        repeat_days TEXT DEFAULT '[1,2,3,4,5,6,7]',
        category TEXT DEFAULT 'General',
        sound TEXT DEFAULT 'default',
        created_at TEXT
      )
    `);

    // Migration initiale des paramètres existants vers la table reminders si vide
    const existingReminders = await db.select().from(reminders);
    if (existingReminders.length === 0) {
      const prefs = await db.select().from(userPreferences).limit(1);
      if (prefs.length > 0) {
        const p = prefs[0];
        // 1. Rappel Mood
        if (p.moodReminderEnabled) {
          await db.insert(reminders).values({
            type: "mood",
            title: "Général",
            enabled: true,
            startTime: p.reminderTime || "08:00",
            repeatDays: JSON.stringify([1,2,3,4,5,6,7]),
            createdAt: new Date().toISOString()
          });
        }
        // 2. Rappel Citations
        if (p.quoteNotificationsEnabled) {
          await db.insert(reminders).values({
            type: "quote",
            title: "Inspiration Ninja",
            enabled: true,
            count: parseInt(p.quoteNotificationsFrequency || "1"),
            startTime: "09:00",
            endTime: "21:00",
            repeatDays: JSON.stringify([1,2,3,4,5,6,7]),
            createdAt: new Date().toISOString()
          });
        }
        // 3. Rappel Streak
        if (p.streakReminderEnabled) {
          await db.insert(reminders).values({
            type: "streak",
            title: "Rappels de série",
            enabled: true,
            startTime: "20:00",
            repeatDays: JSON.stringify([1,2,3,4,5,6,7]),
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    // Index pour optimiser les requêtes par date
    try {
      await db.run(sql`CREATE INDEX IF NOT EXISTS idx_mood_history_date ON mood_history(date)`);
      await db.run(sql`CREATE INDEX IF NOT EXISTS idx_streak_history_date ON streak_history(date)`);
      await db.run(sql`CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at ON notification_history(sent_at)`);
    } catch(e) {}

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        author TEXT NOT NULL,
        anime TEXT NOT NULL,
        mood TEXT NOT NULL,
        is_favorite INTEGER DEFAULT 0,
        is_user_created INTEGER DEFAULT 0,
        background_image TEXT,
        font_style TEXT DEFAULT 'default'
      )
    `);

    // Safety: Add new columns if table already exists
    try {
      await db.run(sql`ALTER TABLE quotes ADD COLUMN is_user_created INTEGER DEFAULT 0`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE quotes ADD COLUMN background_image TEXT`);
    } catch(e) {}
    try {
      await db.run(sql`ALTER TABLE quotes ADD COLUMN font_style TEXT DEFAULT 'default'`);
    } catch(e) {}

    // 2. Seed initial quotes if table is empty
    const existingQuotes = await db.select({ count: sql`count(*)` }).from(quotes);
    const count = (existingQuotes[0] as any).count;

    if (count === 0) {
      console.log("Nindo: Seeding initial quotes...");
      await db.insert(quotes).values(initialQuotes);
      console.log(`Nindo: Seeded ${initialQuotes.length} quotes.`);
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
}

/**
 * Helper to get user preferences
 */
export async function getUserPreferences() {
  const result = await db.select().from(userPreferences).limit(1);
  return result[0] || null;
}

/**
 * Helper to update user preferences
 */
export async function saveUserPreferences(data: Partial<typeof userPreferences.$inferInsert>) {
  const existing = await getUserPreferences();
  if (existing) {
    return await db.update(userPreferences).set(data).where(eq(userPreferences.id, existing.id));
  } else {
    return await db.insert(userPreferences).values(data as any);
  }
}

/**
 * Helper to get all quotes or filtered quotes
 */
export async function getFilteredQuotes(filters: { anime?: string; mood?: string } = {}) {
  let query = db.select().from(quotes);
  
  const conditions = [];
  if (filters.anime) conditions.push(eq(quotes.anime, filters.anime));
  if (filters.mood) conditions.push(eq(quotes.mood, filters.mood));
  
  if (conditions.length > 0) {
    return await query.where(sql.join(conditions, sql` AND `));
  }
  
  return await query;
}

/**
 * Helper to get only favorite quotes
 */
export async function getFavoriteQuotes() {
  return await db.select().from(quotes).where(eq(quotes.isFavorite, true));
}

/**
 * Helper to get user statistics
 */
export async function getStats() {
  const allFavorites = await getFavoriteQuotes();
  const totalFavorites = allFavorites.length;
  
  // Aggregate by anime
  const animeStats = allFavorites.reduce((acc: Record<string, number>, curr) => {
    acc[curr.anime] = (acc[curr.anime] || 0) + 1;
    return acc;
  }, {});

  // Aggregate by mood
  const moodStats = allFavorites.reduce((acc: Record<string, number>, curr) => {
    acc[curr.mood] = (acc[curr.mood] || 0) + 1;
    return acc;
  }, {});

  return {
    totalFavorites,
    animeStats,
    moodStats
  };
}

/**
 * Helper to toggle favorite status
 */
export async function toggleFavorite(quoteId: number, isFavorite: boolean) {
  return await db.update(quotes)
    .set({ isFavorite })
    .where(eq(quotes.id, quoteId));
}

/**
 * Helper to fetch user created quotes
 */
export async function getUserCreatedQuotes() {
  const result = await db.select().from(quotes).where(eq(quotes.isUserCreated, true));
  return result.reverse(); // Newest first
}

/**
 * Helper to create a custom user quote
 */
export async function createCustomQuote(
  text: string, 
  author: string, 
  backgroundImage?: string, 
  fontStyle?: string,
  mood: string = "determination"
) {
  return await db.insert(quotes).values({
    text,
    author,
    anime: "Custom",
    mood,
    isUserCreated: true,
    isFavorite: false,
    backgroundImage: backgroundImage || null,
    fontStyle: fontStyle || "default"
  });
}

/**
 * Helper to delete a custom user quote
 * Only deletes if the quote is user-created
 */
export async function deleteCustomQuote(quoteId: number) {
  return await db.delete(quotes)
    .where(sql`${quotes.id} = ${quoteId} AND ${quotes.isUserCreated} = 1`);
}

// ========== NOTIFICATION HISTORY ==========

/**
 * Add a notification to the history
 */
export async function addNotificationToHistory(data: {
  quoteId?: number;
  title: string;
  body: string;
  type: "quote" | "mood_reminder" | "streak_danger" | "milestone";
}) {
  return await db.insert(notificationHistory).values({
    quoteId: data.quoteId || null,
    title: data.title,
    body: data.body,
    type: data.type,
    sentAt: new Date().toISOString(),
    isRead: false
  });
}

/**
 * Get notification history
 */
export async function getNotificationHistory(limit: number = 50) {
  return await db.select()
    .from(notificationHistory)
    .orderBy(desc(notificationHistory.sentAt))
    .limit(limit);
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(id: number) {
  return await db.update(notificationHistory)
    .set({ isRead: true })
    .where(eq(notificationHistory.id, id));
}

/**
 * Delete a notification from history
 */
export async function deleteNotification(id: number) {
  return await db.delete(notificationHistory)
    .where(eq(notificationHistory.id, id));
}

/**
 * Clear all notifications
 */
export async function clearNotificationHistory() {
  return await db.delete(notificationHistory);
}

/**
 * Streak Algorithm with "Warrior's Grace"
 * Increments streak and XP on daily opening.
 * Returns info about streak status for UI display.
 */
export type StreakUpdateResult = {
  streakBroken: boolean;
  previousStreak: number;
  newStreak: number;
  wasGracePeriod: boolean;
  missedDays: number;
};

export async function updateStreak(): Promise<StreakUpdateResult | null> {
  const prefs = await getUserPreferences();
  if (!prefs) return null;

  const now = new Date();
  const lastOpening = prefs.lastOpeningDate ? new Date(prefs.lastOpeningDate) : null;

  const today = getTodayMidnight();
  const todayStr = formatDateToYYYYMMDD(today);
  const lastDay = lastOpening ? new Date(lastOpening.getFullYear(), lastOpening.getMonth(), lastOpening.getDate()) : null;

  const previousStreak = prefs.streakCount || 0;
  let result: StreakUpdateResult = {
    streakBroken: false,
    previousStreak,
    newStreak: previousStreak,
    wasGracePeriod: false,
    missedDays: 0
  };

  if (!lastDay) {
    // First time ever
    const newStreak = 1;
    await saveUserPreferences({
      lastOpeningDate: today.toISOString(),
      streakCount: newStreak,
      bestStreak: Math.max(prefs.bestStreak || 0, newStreak),
      totalDaysOpened: (prefs.totalDaysOpened || 0) + 1,
      xp: (prefs.xp || 0) + 10
    });

    // Record in streak history
    await recordStreakDay(todayStr, "completed", newStreak);

    result.newStreak = newStreak;
    return result;
  }

  const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already opened today, do nothing
    return result;
  }

  if (diffDays === 1) {
    // Consecutive day
    const newStreak = previousStreak + 1;
    await saveUserPreferences({
      lastOpeningDate: today.toISOString(),
      streakCount: newStreak,
      bestStreak: Math.max(prefs.bestStreak || 0, newStreak),
      totalDaysOpened: (prefs.totalDaysOpened || 0) + 1,
      xp: (prefs.xp || 0) + 20
    });

    await recordStreakDay(todayStr, "completed", newStreak);
    await checkAndUnlockAchievements(newStreak);

    result.newStreak = newStreak;
  } else if (diffDays > 1) {
    // Streak broken? Check Warrior's Grace (00:00 - 03:00)
    const currentHour = now.getHours();
    result.missedDays = diffDays - 1;

    if (diffDays === 2 && currentHour < 3) {
      // Warrior's Grace applied
      const newStreak = previousStreak + 1;
      await saveUserPreferences({
        lastOpeningDate: today.toISOString(),
        streakCount: newStreak,
        bestStreak: Math.max(prefs.bestStreak || 0, newStreak),
        totalDaysOpened: (prefs.totalDaysOpened || 0) + 1,
        xp: (prefs.xp || 0) + 20
      });

      await recordStreakDay(todayStr, "grace", newStreak);
      await checkAndUnlockAchievements(newStreak);

      result.newStreak = newStreak;
      result.wasGracePeriod = true;
      console.log("Nindo: Warrior's Grace applied! Streak preserved.");
    } else {
      // Streak definitely broken - record missed days
      for (let i = 1; i < diffDays; i++) {
        const missedDate = new Date(lastDay.getTime() + i * 24 * 60 * 60 * 1000);
        await recordStreakDay(formatDateToYYYYMMDD(missedDate), "missed", 0);
      }

      const newStreak = 1;
      await saveUserPreferences({
        lastOpeningDate: today.toISOString(),
        streakCount: newStreak,
        totalDaysOpened: (prefs.totalDaysOpened || 0) + 1,
        xp: Math.max(0, (prefs.xp || 0) - 10)
      });

      await recordStreakDay(todayStr, "completed", newStreak);

      result.streakBroken = true;
      result.newStreak = newStreak;
      console.log("Nindo: Streak broken. Discipline is the key.");
    }
  }

  return result;
}

/**
 * Record a streak day in history
 */
async function recordStreakDay(date: string, status: "completed" | "missed" | "grace", streakCount: number) {
  // Check if already recorded for this date
  const existing = await db.select().from(streakHistory).where(eq(streakHistory.date, date)).limit(1);
  if (existing.length > 0) return;

  await db.insert(streakHistory).values({
    date,
    status,
    streakCountAtDay: streakCount
  });
}

/**
 * Get streak history for the last N days
 */
export async function getStreakHistory(days: number = 7): Promise<StreakHistory[]> {
  const today = getTodayMidnight();
  const startDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

  const history = await db.select()
    .from(streakHistory)
    .where(sql`date >= ${formatDateToYYYYMMDD(startDate)}`)
    .orderBy(desc(streakHistory.date));

  return history;
}

/**
 * Check and unlock achievements based on streak
 */
async function checkAndUnlockAchievements(streakCount: number) {
  const milestones = [
    { streak: 3, id: "streak_3", name: "Genin Déterminé" },
    { streak: 7, id: "streak_7", name: "Semaine du Guerrier" },
    { streak: 14, id: "streak_14", name: "Chunin Persistant" },
    { streak: 30, id: "streak_30", name: "Volonté Inébranlable" },
    { streak: 60, id: "streak_60", name: "Maître de la Discipline" },
    { streak: 100, id: "streak_100", name: "Légende Shinobi" }
  ];

  for (const milestone of milestones) {
    if (streakCount >= milestone.streak) {
      // Check if already unlocked
      const existing = await db.select()
        .from(achievements)
        .where(eq(achievements.achievementId, milestone.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(achievements).values({
          achievementId: milestone.id,
          unlockedAt: new Date().toISOString(),
          notified: false
        });
        console.log(`Nindo: Achievement unlocked - ${milestone.name}!`);
      }
    }
  }
}

/**
 * Get all unlocked achievements
 */
export async function getUnlockedAchievements(): Promise<Achievement[]> {
  return await db.select().from(achievements).orderBy(desc(achievements.unlockedAt));
}

/**
 * Mark achievement as notified
 */
export async function markAchievementNotified(achievementId: string) {
  await db.update(achievements)
    .set({ notified: true })
    .where(eq(achievements.achievementId, achievementId));
}

/**
 * Get unnotified achievements
 */
export async function getUnnotifiedAchievements(): Promise<Achievement[]> {
  return await db.select()
    .from(achievements)
    .where(eq(achievements.notified, false));
}

// ========== MOOD SYSTEM ==========

/**
 * Check if mood has been selected today
 */
export async function hasMoodSelectedToday(): Promise<boolean> {
  const prefs = await getUserPreferences();
  if (!prefs) return false;

  const todayStr = formatDateToYYYYMMDD(getTodayMidnight());
  return prefs.lastMoodDate === todayStr;
}

/**
 * Check if we should ask for mood today based on frequency settings AND time
 * Returns true if we should show the mood selector
 *
 * The modal only appears:
 * 1. Once per day (after mood is selected, it won't show again)
 * 2. After the configured reminder time has passed
 */
export async function shouldAskMoodToday(): Promise<boolean> {
  const prefs = await getUserPreferences();
  if (!prefs) return false;

  // If mood already selected today, don't ask again
  const todayStr = formatDateToYYYYMMDD(getTodayMidnight());
  if (prefs.lastMoodDate === todayStr) {
    return false;
  }

  // Check if mood reminders are disabled
  if (!prefs.moodReminderEnabled || prefs.moodReminderFrequency === "disabled") {
    return false;
  }

  // Check if the configured reminder time has passed
  const allReminders = await db.select().from(reminders);
  const moodReminder = allReminders.find(r => r.type === "mood" && r.enabled);

  if (moodReminder && moodReminder.startTime) {
    const [reminderHour, reminderMinute] = moodReminder.startTime.split(":").map(Number);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const reminderMinutes = reminderHour * 60 + reminderMinute;

    // Don't show the modal before the configured time
    if (currentMinutes < reminderMinutes) {
      console.log(`Nindo: Mood modal not shown - current time (${now.getHours()}:${now.getMinutes()}) is before reminder time (${moodReminder.startTime})`);
      return false;
    }
  }

  const frequency = prefs.moodReminderFrequency || "daily";
  const lastMoodDate = prefs.lastMoodDate ? new Date(prefs.lastMoodDate) : null;
  const today = getTodayMidnight();

  switch (frequency) {
    case "daily":
      // Ask every day
      return true;

    case "2days":
      // Ask every 2 days
      if (!lastMoodDate) return true;
      const diffDays2 = Math.floor((today.getTime() - new Date(lastMoodDate).getTime()) / (1000 * 60 * 60 * 24));
      return diffDays2 >= 2;

    case "3weekly":
      // Ask on Monday (1), Wednesday (3), Friday (5)
      const dayOfWeek = today.getDay();
      return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;

    case "weekly":
      // Ask once a week (7 days since last mood)
      if (!lastMoodDate) return true;
      const diffDaysWeek = Math.floor((today.getTime() - new Date(lastMoodDate).getTime()) / (1000 * 60 * 60 * 24));
      return diffDaysWeek >= 7;

    default:
      return true;
  }
}

/**
 * Select mood for today
 */
export async function selectDailyMood(moodId: string, source: "app" | "notification" | "retroactive" = "app") {
  const todayStr = formatDateToYYYYMMDD(getTodayMidnight());
  const now = new Date().toISOString();

  // Update user preferences
  await saveUserPreferences({
    currentDayMood: moodId,
    lastMoodDate: todayStr
  });

  // Check if already in history for today (update instead of insert)
  const existing = await db.select().from(moodHistory).where(eq(moodHistory.date, todayStr)).limit(1);

  if (existing.length > 0) {
    await db.update(moodHistory)
      .set({ mood: moodId, selectedAt: now, source })
      .where(eq(moodHistory.date, todayStr));
  } else {
    await db.insert(moodHistory).values({
      date: todayStr,
      mood: moodId,
      selectedAt: now,
      source
    });
  }
}

/**
 * Get mood history for a date range
 */
export async function getMoodHistory(days: number = 30): Promise<MoodHistory[]> {
  const today = getTodayMidnight();
  const startDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

  return await db.select()
    .from(moodHistory)
    .where(sql`date >= ${formatDateToYYYYMMDD(startDate)}`)
    .orderBy(desc(moodHistory.date));
}

/**
 * Get mood statistics for a period
 */
export async function getMoodStats(days: number = 30) {
  const history = await getMoodHistory(days);

  const moodCounts: Record<string, number> = {};
  for (const entry of history) {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  }

  const total = history.length;
  const percentages: Record<string, number> = {};
  for (const [mood, count] of Object.entries(moodCounts)) {
    percentages[mood] = Math.round((count / total) * 100);
  }

  // Find dominant mood
  let dominantMood = "";
  let maxCount = 0;
  for (const [mood, count] of Object.entries(moodCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantMood = mood;
    }
  }

  return {
    moodCounts,
    percentages,
    dominantMood,
    totalDays: total
  };
}

/**
 * Get today's mood
 */
export async function getTodayMood(): Promise<string | null> {
  const prefs = await getUserPreferences();
  if (!prefs) return null;

  const todayStr = formatDateToYYYYMMDD(getTodayMidnight());
  if (prefs.lastMoodDate === todayStr) {
    return prefs.currentDayMood || null;
  }
  return null;
}

/**
 * Mood trend data point for visualization
 */
export interface MoodTrendPoint {
  date: string;
  moodCounts: Record<string, number>;
  total: number;
}

/**
 * Get mood history grouped by date for trend visualization
 * @param days - Number of days to fetch (7, 30, 90)
 * @returns Array of { date: string, moodCounts: Record<string, number>, total: number }
 */
export async function getMoodTrendData(days: number = 30): Promise<MoodTrendPoint[]> {
  const history = await getMoodHistory(days);

  // Group by date
  const grouped: Record<string, Record<string, number>> = {};
  for (const entry of history) {
    if (!grouped[entry.date]) {
      grouped[entry.date] = {};
    }
    grouped[entry.date][entry.mood] = (grouped[entry.date][entry.mood] || 0) + 1;
  }

  // Generate all dates in the period and fill with data or empty
  const result: MoodTrendPoint[] = [];
  const today = getTodayMidnight();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = formatDateToYYYYMMDD(date);
    const moodCounts = grouped[dateStr] || {};
    result.push({
      date: dateStr,
      moodCounts,
      total: Object.values(moodCounts).reduce((a, b) => a + b, 0)
    });
  }

  return result;
}

/**
 * Helper to reset all training data
 */
export async function resetDatabase() {
  await db.update(quotes).set({ isFavorite: false });
  await db.delete(userPreferences);
  await db.delete(moodHistory);
  await db.delete(streakHistory);
  await db.delete(achievements);
  await db.delete(notificationHistory);

  await db.insert(userPreferences).values({
    onboardingCompleted: false,
    username: "Ninja Anonyme",
    firstName: "",
    xp: 0,
    streakCount: 0,
    bestStreak: 0,
    totalDaysOpened: 0,
    lastOpeningDate: null
  });
}

// REMINDERS CRUD
export async function getReminders() {
  return await db.select().from(reminders).orderBy(reminders.id);
}

export async function addReminder(reminder: typeof reminders.$inferInsert) {
  return await db.insert(reminders).values({
    ...reminder,
    createdAt: new Date().toISOString()
  });
}

export async function updateReminder(id: number, data: Partial<typeof reminders.$inferInsert>) {
  return await db.update(reminders).set(data).where(eq(reminders.id, id));
}

export async function deleteReminder(id: number) {
  return await db.delete(reminders).where(eq(reminders.id, id));
}

// Re-export types
export type { Achievement, MoodHistory, Quote, StreakHistory };

