import { NotificationService } from "@/src/services/NotificationService";
import {
    getFavoriteQuotes,
    getFilteredQuotes,
    getStats,
    getStreakHistory,
    getTodayMood,
    getUserCreatedQuotes,
    getUserPreferences,
    initializeDatabase,
    shouldAskMoodToday,
    updateStreak,
} from "@/src/services/database";
import { useAppStore, useFontStore, useThemeStore } from "@/src/stores";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

export function AppInitializer() {
  const [initialized, setInitialized] = useState(false);
  const {
    setStreakResult,
    setStreakHistory,
    setShowStreakBrokenModal,
    setShowMoodSelector,
    setCurrentMood,
    setFirstName,
    setStreakCount,
    setBestStreak,
    setQuotes,
    setFavorites,
    setUserQuotes,
    setUserStats,
    setUserPrefs,
  } = useAppStore();
  const { setTheme } = useThemeStore();

  useEffect(() => {
    if (initialized) return;

    async function init() {
      try {
        await initializeDatabase();

        const streakResult = await updateStreak();
        setStreakResult(streakResult);

        const history = await getStreakHistory(7);
        setStreakHistory(history);

        const prefs = await getUserPreferences();
        console.log("Nindo: Initial preferences:", prefs);

        if (prefs) {
          setFirstName(prefs.firstName || "");
          setStreakCount(prefs.streakCount || 0);
          setBestStreak(prefs.bestStreak || 0);
          setUserPrefs(prefs);



          if (prefs.theme) {
            setTheme(prefs.theme as any);
          }

          // Hydrate fontStore
          if (useFontStore.getState()) {
            if (prefs.appFontFamily) {
              useFontStore.getState().setAppFontFamily(prefs.appFontFamily as any);
            }
            if (prefs.quoteFontFamily) {
              useFontStore.getState().setQuoteFontFamily(prefs.quoteFontFamily);
            }
            if (prefs.quoteFontScale) {
              useFontStore.getState().setQuoteFontScale(Number(prefs.quoteFontScale));
            }
          }
        }

        // Preload all data in parallel
        const [quotesData, favoritesData, userQuotesData, statsData] = await Promise.all([
          getFilteredQuotes({}),
          getFavoriteQuotes(),
          getUserCreatedQuotes(),
          getStats(),
        ]);

        // Shuffle quotes for discovery
        const shuffledQuotes = quotesData.sort(() => Math.random() - 0.5);
        setQuotes(shuffledQuotes);
        setFavorites(favoritesData);
        setUserQuotes(userQuotesData);
        setUserStats(statsData);

        setInitialized(true);

        // Determine destination based on onboarding status
        if (!prefs?.onboardingCompleted) {
          useAppStore.getState().setInitialRouteName("onboarding");
        } else {
          useAppStore.getState().setInitialRouteName("index");

          // Handle notifications and moods for returning users
          NotificationService.setupListeners();
          NotificationService.syncNotifications();

          // Delay modals to ensure navigation context is fully mounted
          setTimeout(() => {
            if (streakResult?.streakBroken && streakResult.previousStreak > 1) {
              setShowStreakBrokenModal(true);
            }

            // Check if we should ask mood based on frequency settings
            shouldAskMoodToday().then((shouldAsk) => {
              if (shouldAsk) {
                setTimeout(() => {
                  setShowMoodSelector(true);
                }, streakResult?.streakBroken ? 500 : 0);
              } else {
                // Load today's mood if already selected
                getTodayMood().then((todayMood) => {
                  setCurrentMood(todayMood);
                });
              }
            });
          }, 500);
        }

        // Initialize DB ready state
        useAppStore.getState().setDbInitialized(true);

        // Hide splash screen after a short delay to allow UI to mount
        setTimeout(async () => {
          await SplashScreen.hideAsync();
        }, 100);

      } catch (e) {
        console.warn("Error during app initialization:", e);
        setInitialized(true);
        useAppStore.getState().setDbInitialized(true);
        await SplashScreen.hideAsync();
      }
    }

    init();
  }, [initialized]);

  return null;
}
