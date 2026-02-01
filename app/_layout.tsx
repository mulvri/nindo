import { AppInitializer } from "@/src/components/AppInitializer";
import { THEMES } from "@/src/constants/themes";
import "@/src/lib/nativewind-interop";
import { useAppStore, useFontStore, useThemeStore } from "@/src/stores";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { vars } from "nativewind";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

// Empêcher le splashscreen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const router = useRouter();
  const segments = useSegments();
  const { theme } = useThemeStore();
  const { fontsLoaded } = useFontStore();
  const { isDbInitialized, initialRouteName } = useAppStore();

  const currentTheme = THEMES[theme] || THEMES.light;

  // Fallback : redirection si nécessaire (après que le Stack soit monté)
  useEffect(() => {
    if (!isDbInitialized || !initialRouteName || !fontsLoaded) return;

    const inOnboarding = segments[0] === "onboarding";

    // Si onboarding nécessaire mais pas sur onboarding, rediriger
    if (initialRouteName === "onboarding" && !inOnboarding) {
      router.replace("/onboarding");
    }
    // Si onboarding terminé mais encore sur onboarding, rediriger vers l'accueil
    else if (initialRouteName === "index" && inOnboarding) {
      router.replace("/");
    }
  }, [isDbInitialized, initialRouteName, segments, fontsLoaded]);

  // GARDE : Ne pas rendre tant que l'app n'est pas prête
  if (!isDbInitialized || !initialRouteName || !fontsLoaded) {
    return null; // Splash screen toujours visible
  }

  return (
    <Stack
      // APPROCHE TOKWENOAPP : initialRouteName dynamique
      initialRouteName={initialRouteName === "onboarding" ? "onboarding" : "index"}
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: currentTheme.background }
      }}
    >
      <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
      <Stack.Screen name="index" />
      <Stack.Screen name="create" options={{ animation: "slide_from_bottom" }} />
      <Stack.Screen name="favorites" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="general" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="profile" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="settings" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="my-quotes" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="achievements" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="mood-history" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="reminders" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="notification-center" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const { theme } = useThemeStore();
  const { setFontsLoaded } = useFontStore();

  // Charger toutes les polices depuis les fichiers locaux
  const [fontsLoaded] = useFonts({
    // Poppins
    Poppins_400Regular: require("@/assets/fonts/Poppins-Regular.ttf"),
    Poppins_500Medium: require("@/assets/fonts/Poppins-Medium.ttf"),
    Poppins_600SemiBold: require("@/assets/fonts/Poppins-SemiBold.ttf"),
    Poppins_700Bold: require("@/assets/fonts/Poppins-Bold.ttf"),
    Poppins_900Black: require("@/assets/fonts/Poppins-Black.ttf"),
    // Inter
    Inter_400Regular: require("@/assets/fonts/Inter_18pt-Regular.ttf"),
    Inter_500Medium: require("@/assets/fonts/Inter_18pt-Medium.ttf"),
    Inter_600SemiBold: require("@/assets/fonts/Inter_18pt-SemiBold.ttf"),
    Inter_700Bold: require("@/assets/fonts/Inter_18pt-Bold.ttf"),
    Inter_900Black: require("@/assets/fonts/Inter_18pt-Black.ttf"),
    // Montserrat
    Montserrat_400Regular: require("@/assets/fonts/Montserrat-Regular.ttf"),
    Montserrat_500Medium: require("@/assets/fonts/Montserrat-Medium.ttf"),
    Montserrat_600SemiBold: require("@/assets/fonts/Montserrat-SemiBold.ttf"),
    Montserrat_700Bold: require("@/assets/fonts/Montserrat-Bold.ttf"),
    Montserrat_900Black: require("@/assets/fonts/Montserrat-Black.ttf"),
    // Roboto
    Roboto_400Regular: require("@/assets/fonts/Roboto-Regular.ttf"),
    Roboto_500Medium: require("@/assets/fonts/Roboto-Medium.ttf"),
    Roboto_600SemiBold: require("@/assets/fonts/Roboto-SemiBold.ttf"),
    Roboto_700Bold: require("@/assets/fonts/Roboto-Bold.ttf"),
    Roboto_900Black: require("@/assets/fonts/Roboto-Black.ttf"),
  });

  // Mettre à jour le store quand les polices sont chargées
  useEffect(() => {
    if (fontsLoaded) {
      setFontsLoaded(true);
    }
  }, [fontsLoaded]);

  const currentTheme = THEMES[theme as keyof typeof THEMES] || THEMES.light;

  const themeVars = vars({
    "--primary": currentTheme.primary as string,
    "--abyss": currentTheme.abyss as string,
    "--surface": currentTheme.surface as string,
    "--background": currentTheme.background as string,
    "--foreground": currentTheme.foreground as string,
  });

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-abyss font-sans" style={themeVars}>
        <StatusBar style={currentTheme.isDark ? "light" : "dark"} />
        <AppInitializer />
        <AppContent />
      </View>
    </SafeAreaProvider>
  );
}
