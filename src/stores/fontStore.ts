import { create } from "zustand";
import type { FontFamily } from "@/src/constants/fonts";

interface FontState {
  // Police globale de l'app
  appFontFamily: FontFamily;
  // Taille de police des citations (multiplicateur)
  quoteFontScale: number;
  // Police des citations
  quoteFontFamily: string;
  // Indicateur de chargement des polices
  fontsLoaded: boolean;

  // Actions
  setAppFontFamily: (family: FontFamily) => void;
  setQuoteFontScale: (scale: number) => void;
  setQuoteFontFamily: (family: string) => void;
  setFontsLoaded: (loaded: boolean) => void;
}

export const useFontStore = create<FontState>((set) => ({
  appFontFamily: "poppins",
  quoteFontScale: 1,
  quoteFontFamily: "Poppins_400Regular",
  fontsLoaded: false,

  setAppFontFamily: (family) => set({ appFontFamily: family }),
  setQuoteFontScale: (scale) => set({ quoteFontScale: scale }),
  setQuoteFontFamily: (family) => set({ quoteFontFamily: family }),
  setFontsLoaded: (loaded) => set({ fontsLoaded: loaded }),
}));
