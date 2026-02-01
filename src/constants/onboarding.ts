import type { IconConcept } from "../components/ui/AppIcon";

// Liste des animes disponibles pour la sélection
export const ANIMES = [
  { id: "naruto", name: "Naruto", color: "#F57C00" },
  { id: "one_piece", name: "One Piece", color: "#D32F2F" },
  { id: "dragon_ball", name: "Dragon Ball", color: "#FFA000" },
  { id: "bleach", name: "Bleach", color: "#1976D2" },
  { id: "demon_slayer", name: "Demon Slayer", color: "#7B1FA2" },
  { id: "jujutsu_kaisen", name: "Jujutsu Kaisen", color: "#212121" },
  { id: "my_hero_academia", name: "My Hero Academia", color: "#388E3C" },
  { id: "attack_on_titan", name: "Attack on Titan", color: "#5D4037" },
];

// Type pour les moods avec icône typée
interface Mood {
  id: string;
  name: string;
  emoji: string;
  icon: IconConcept;
}

// Liste des moods/ambiances disponibles
export const MOODS: Mood[] = [
  { id: "shonen_spirit", name: "Esprit Shonen", emoji: "🔥", icon: "shonen" },
  { id: "zen_master", name: "Maître Zen", emoji: "🧘", icon: "zen" },
  { id: "dark_shinobi", name: "Shinobi de l'Ombre", emoji: "🌑", icon: "shadow" },
  { id: "nakama_power", name: "Pouvoir de l'Amitié", emoji: "🤝", icon: "friendship" },
  { id: "determination", name: "Volonté de Feu", emoji: "⚡", icon: "fire" },
];

