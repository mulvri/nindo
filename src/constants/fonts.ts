// Configuration des polices pour Nindo

export type FontFamily = "system" | "poppins" | "inter" | "montserrat" | "roboto";

export interface FontConfig {
  name: string;
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
  black: string;
}

export const FONT_FAMILIES: Record<FontFamily, FontConfig> = {
  system: {
    name: "Systeme",
    regular: "System",
    medium: "System",
    semibold: "System",
    bold: "System",
    black: "System",
  },
  poppins: {
    name: "Poppins",
    regular: "Poppins_400Regular",
    medium: "Poppins_500Medium",
    semibold: "Poppins_600SemiBold",
    bold: "Poppins_700Bold",
    black: "Poppins_900Black",
  },
  inter: {
    name: "Inter",
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    black: "Inter_900Black",
  },
  montserrat: {
    name: "Montserrat",
    regular: "Montserrat_400Regular",
    medium: "Montserrat_500Medium",
    semibold: "Montserrat_600SemiBold",
    bold: "Montserrat_700Bold",
    black: "Montserrat_900Black",
  },
  roboto: {
    name: "Roboto",
    regular: "Roboto_400Regular",
    medium: "Roboto_500Medium",
    semibold: "Roboto_600SemiBold",
    bold: "Roboto_700Bold",
    black: "Roboto_900Black",
  },
};

export const DEFAULT_FONT_FAMILY: FontFamily = "poppins";

// Legacy exports pour compatibilite
export const POPPINS_FONTS = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
  black: "Poppins_900Black",
} as const;

export const getPoppinsFont = (
  weight: keyof typeof POPPINS_FONTS = "regular"
): string => {
  return POPPINS_FONTS[weight];
};
