export type ThemeType = "light" | "dark" | "naruto" | "sakura" | "gold" | "nordic" | "emerald";

export interface ThemeColors {
  primary: string;
  abyss: string;
  surface: string;
  background: string;
  foreground: string;
  isDark: boolean;
}

export const THEMES: Record<ThemeType, ThemeColors> = {
  light: {
    primary: "#0A0A0A",
    abyss: "#F8F8F8",
    surface: "#FFFFFF",
    background: "#F8F8F8",
    foreground: "#0A0A0A",
    isDark: false,
  },
  dark: {
    primary: "#9CA3AF",
    abyss: "#0A0A0A",
    surface: "#1A1A1A",
    background: "#0A0A0A",
    foreground: "#FFFFFF",
    isDark: true,
  },
  naruto: {
    primary: "#FF6B35",
    abyss: "#0F0A08", // Dark brown-tinted abyss
    surface: "#1A1310", // Warm dark surface
    background: "#0F0A08",
    foreground: "#FFFFFF",
    isDark: true,
  },
  sakura: {
    primary: "#FF7EB9",
    abyss: "#FFF5F7", // Soft pink abyss
    surface: "#FFFFFF",
    background: "#FFF5F7",
    foreground: "#4A1D2C", // Dark pink-burgundy text
    isDark: false,
  },
  gold: {
    primary: "#D4AF37",
    abyss: "#0A0A08", // Very dark charcoal
    surface: "#161614", // Subtle metal surface
    background: "#0A0A08",
    foreground: "#FFFFFF",
    isDark: true,
  },
  nordic: {
    primary: "#5DADE2",
    abyss: "#EBF2F7", // Cold bluish abyss
    surface: "#FFFFFF",
    background: "#EBF2F7",
    foreground: "#1B2631", // Deep cold blue text
    isDark: false,
  },
  emerald: {
    primary: "#2ECC71",
    abyss: "#08100D", // Deep jungle abyss
    surface: "#101D18", // Forest floor surface
    background: "#08100D",
    foreground: "#ECF0F1",
    isDark: true,
  },
};
