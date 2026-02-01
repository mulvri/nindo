import { Quote, StreakHistory, StreakUpdateResult, UserPreferences } from "@/src/services/database";
import { create } from "zustand";

interface UserStats {
  totalFavorites: number;
  animeStats: Record<string, number>;
  moodStats: Record<string, number>;
}

interface AppState {
  // Streak
  streakResult: StreakUpdateResult | null;
  streakHistory: StreakHistory[];
  showStreakBrokenModal: boolean;

  // Mood
  showMoodSelector: boolean;
  currentMood: string | null;

  // User Info
  firstName: string;
  streakCount: number;
  bestStreak: number;

  // Preloaded Data
  quotes: Quote[];
  favorites: Quote[];
  userQuotes: Quote[];
  userStats: UserStats | null;
  userPrefs: UserPreferences | null;

  // System
  isDbInitialized: boolean;
  initialRouteName: "index" | "onboarding" | null;
  setDbInitialized: (initialized: boolean) => void;
  setInitialRouteName: (route: "index" | "onboarding" | null) => void;

  // Actions
  setStreakResult: (result: StreakUpdateResult | null) => void;
  setStreakHistory: (history: StreakHistory[]) => void;
  setShowStreakBrokenModal: (show: boolean) => void;
  setShowMoodSelector: (show: boolean) => void;
  setCurrentMood: (mood: string | null) => void;
  setFirstName: (name: string) => void;
  setStreakCount: (count: number) => void;
  setBestStreak: (best: number) => void;
  setQuotes: (quotes: Quote[]) => void;
  setFavorites: (favorites: Quote[]) => void;
  setUserQuotes: (userQuotes: Quote[]) => void;
  setUserStats: (stats: UserStats | null) => void;
  setUserPrefs: (prefs: UserPreferences | null) => void;

  // Reset
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  isDbInitialized: false,
  initialRouteName: null,
  streakResult: null,
  streakHistory: [],
  showStreakBrokenModal: false,
  showMoodSelector: false,
  currentMood: null,
  firstName: "",
  streakCount: 0,
  bestStreak: 0,
  quotes: [],
  favorites: [],
  userQuotes: [],
  userStats: null,
  userPrefs: null,

  // Actions
  setDbInitialized: (initialized) => set({ isDbInitialized: initialized }),
  setInitialRouteName: (route) => set({ initialRouteName: route }),
  setStreakResult: (result) => set({ streakResult: result }),
  setStreakHistory: (history) => set({ streakHistory: history }),
  setShowStreakBrokenModal: (show) => set({ showStreakBrokenModal: show }),
  setShowMoodSelector: (show) => set({ showMoodSelector: show }),
  setCurrentMood: (mood) => set({ currentMood: mood }),
  setFirstName: (name) => set({ firstName: name }),
  setStreakCount: (count) => set({ streakCount: count }),
  setBestStreak: (best) => set({ bestStreak: best }),
  setQuotes: (quotes) => set({ quotes }),
  setFavorites: (favorites) => set({ favorites }),
  setUserQuotes: (userQuotes) => set({ userQuotes }),
  setUserStats: (stats) => set({ userStats: stats }),
  setUserPrefs: (prefs) => set({ userPrefs: prefs }),

  // Reset
  reset: () => set({
    isDbInitialized: false,
    initialRouteName: null,
    streakResult: null,
    streakHistory: [],
    showStreakBrokenModal: false,
    showMoodSelector: false,
    currentMood: null,
    firstName: "",
    streakCount: 0,
    bestStreak: 0,
    quotes: [],
    favorites: [],
    userQuotes: [],
    userStats: null,
    userPrefs: null,
  }),
}));
