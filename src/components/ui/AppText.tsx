import React from "react";
import { Text, TextProps } from "react-native";
import { useFontStore } from "@/src/stores/fontStore";
import { FONT_FAMILIES } from "@/src/constants/fonts";

interface AppTextProps extends TextProps {
  variant?: "regular" | "medium" | "semibold" | "bold" | "black";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  className?: string;
}

export const AppText: React.FC<AppTextProps> = ({
  variant,
  size,
  className = "",
  style,
  children,
  ...props
}) => {
  const { appFontFamily } = useFontStore();
  // Fallback vers poppins si la police n'est pas valide
  const fontConfig = FONT_FAMILIES[appFontFamily] || FONT_FAMILIES.poppins;

  const getFontFamily = (): string | undefined => {
    // Police systeme = undefined (utilise la police native)
    if (appFontFamily === "system") {
      return undefined;
    }

    // Si fontConfig n'existe pas, utiliser Poppins par defaut
    if (!fontConfig) {
      return "Poppins_400Regular";
    }

    // Si variant est defini, l'utiliser
    if (variant) {
      return fontConfig[variant];
    }

    // Sinon, chercher une classe font-* dans className et la mapper
    if (className.includes("font-black")) return fontConfig.black;
    if (className.includes("font-bold")) return fontConfig.bold;
    if (className.includes("font-semibold")) return fontConfig.semibold;
    if (className.includes("font-medium")) return fontConfig.medium;

    // Par defaut, utiliser Regular
    return fontConfig.regular;
  };

  const sizeClass = size
    ? {
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
        "2xl": "text-2xl",
        "3xl": "text-3xl",
        "4xl": "text-4xl",
        "5xl": "text-5xl",
      }[size]
    : "";

  const fontFamily = getFontFamily();

  return (
    <Text
      className={`${sizeClass} ${className}`.trim()}
      style={[fontFamily ? { fontFamily } : undefined, style]}
      {...props}
    >
      {children}
    </Text>
  );
};

// Alias pour compatibilite
export { AppText as AppPoppinsText };
