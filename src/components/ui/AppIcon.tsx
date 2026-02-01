import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";

// Icon mapping types
type IoniconName = keyof typeof Ionicons.glyphMap;
type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Concepts métier mappés vers des icônes spécifiques
export const ICON_MAPPING = {
  // Moods
  shonen: { name: "flame" as IoniconName, set: "Ionicons" },
  zen: { name: "leaf" as IoniconName, set: "Ionicons" },
  shadow: { name: "moon" as IoniconName, set: "Ionicons" },
  friendship: { name: "people" as IoniconName, set: "Ionicons" },
  fire: { name: "flash" as IoniconName, set: "Ionicons" },
  
  // Achievements
  trophy: { name: "trophy" as IoniconName, set: "Ionicons" },
  party: { name: "party-popper" as MaterialIconName, set: "MaterialCommunityIcons" },
  star: { name: "star" as IoniconName, set: "Ionicons" },
  strength: { name: "barbell" as IoniconName, set: "Ionicons" },
  crown: { name: "crown" as MaterialIconName, set: "MaterialCommunityIcons" },
  rocket: { name: "rocket" as IoniconName, set: "Ionicons" },

  // Streak & States
  streak_active: { name: "flame" as IoniconName, set: "Ionicons" },
  streak_frozen: { name: "snow" as IoniconName, set: "Ionicons" },
  streak_broken: { name: "heart-dislike" as IoniconName, set: "Ionicons" },
  sparkles: { name: "sparkles" as IoniconName, set: "Ionicons" },
  idea: { name: "bulb" as IoniconName, set: "Ionicons" },
  
  // UI & Nav
  text: { name: "text" as IoniconName, set: "Ionicons" },
  palette: { name: "color-palette" as IoniconName, set: "Ionicons" },
  target: { name: "scan-circle" as IoniconName, set: "Ionicons" }, // or 'target' in MC
  notification: { name: "notifications" as IoniconName, set: "Ionicons" },
  mood_selector: { name: "happy" as IoniconName, set: "Ionicons" },
  heart: { name: "heart" as IoniconName, set: "Ionicons" },
  
  // New mappings
  check: { name: "checkmark" as IoniconName, set: "Ionicons" },
  close: { name: "close" as IoniconName, set: "Ionicons" },
  back: { name: "arrow-back" as IoniconName, set: "Ionicons" },
  forward: { name: "chevron-forward" as IoniconName, set: "Ionicons" },
  calendar: { name: "calendar" as IoniconName, set: "Ionicons" },
  chart: { name: "bar-chart-outline" as IoniconName, set: "Ionicons" },
  person: { name: "person-outline" as IoniconName, set: "Ionicons" },
  trash: { name: "trash-outline" as IoniconName, set: "Ionicons" },
  info: { name: "information-circle-outline" as IoniconName, set: "Ionicons" },
  sunny: { name: "sunny" as IoniconName, set: "Ionicons" },
  flower: { name: "flower" as IoniconName, set: "Ionicons" },
  ice: { name: "snow" as IoniconName, set: "Ionicons" },
  mountain: { name: "mountain" as IoniconName, set: "Ionicons" },
  up: { name: "chevron-up" as IoniconName, set: "Ionicons" },
  down: { name: "chevron-down" as IoniconName, set: "Ionicons" },
  quote: { name: "format-quote-close" as MaterialIconName, set: "MaterialCommunityIcons" },
} as const;

export type IconConcept = keyof typeof ICON_MAPPING;

type IconSet = "Ionicons" | "MaterialCommunityIcons";

interface AppIconProps {
  name: IconConcept | IoniconName | MaterialIconName;
  size?: number | "xs" | "sm" | "md" | "lg" | "xl" | "xxl"; // 12, 16, 24, 32, 48, 64
  color?: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  set?: IconSet; // Override set if using direct icon name
}

const SIZES = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
};

export const AppIcon: React.FC<AppIconProps> = ({ 
  name, 
  size = "md", 
  color = "#fff", 
  style,
  containerStyle,
  set: setOverride 
}) => {
  const iconSize = typeof size === "string" ? SIZES[size] : size;
  
  let iconName: string = name;
  let IconComponent: any = Ionicons;

  // Check if name is a concept concept
  if (name in ICON_MAPPING) {
    const config = ICON_MAPPING[name as IconConcept];
    iconName = config.name;
    if (config.set === "MaterialCommunityIcons") {
      IconComponent = MaterialCommunityIcons;
    }
  } else if (setOverride === "MaterialCommunityIcons") {
     IconComponent = MaterialCommunityIcons;
  }
  
  // Default to Ionicons if no mapping found and no set override
  
  const content = (
    <IconComponent 
      name={iconName} 
      size={iconSize} 
      color={color} 
      style={style} 
    />
  );

  if (containerStyle) {
    return (
      <View style={[{ justifyContent: 'center', alignItems: 'center' }, containerStyle]}>
        {content}
      </View>
    );
  }

  return content;
};
