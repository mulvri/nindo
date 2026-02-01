import { SettingsModal } from "@/src/components/settings/SettingsModal";
import { AppText } from "@/src/components/ui/AppText";
import { ANIMES, MOODS } from "@/src/constants";
import { THEMES } from "@/src/constants/themes";
import { useThemeStore } from "@/src/stores";
import React, { useState } from "react";
import {
    TouchableOpacity,
    View
} from "react-native";
import { AppIcon } from "../ui/AppIcon";

interface FilterBarProps {
  selectedAnime: string | null;
  selectedMood: string | null;
  onSelectAnime: (anime: string | null) => void;
  onSelectMood: (mood: string | null) => void;
  showAnimeFilter?: boolean;
}

export const FilterBar = ({
  selectedAnime,
  selectedMood,
  onSelectAnime,
  onSelectMood,
  showAnimeFilter = true,
}: FilterBarProps) => {
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const [showAnimeModal, setShowAnimeModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);

  const selectedAnimeData = ANIMES.find((a) => a.name === selectedAnime);
  const selectedMoodData = MOODS.find((m) => m.id === selectedMood);

  return (
    <View className="px-6 py-3 flex-row gap-3">
      {/* Anime Filter */}
      {showAnimeFilter && (
        <TouchableOpacity
          onPress={() => setShowAnimeModal(true)}
          className={`flex-1 py-3 px-4 rounded-3xl border flex-row items-center justify-between ${
            selectedAnime ? "border-primary bg-primary" : "border-white/5 bg-surface"
          }`}
          style={!selectedAnime ? { borderColor: `${currentTheme.primary}20` } : undefined}
        >
          <AppText
            variant="bold"
            size="sm"
            className={`${
              selectedAnime ? "text-white" : "text-gray-400"
            }`}
          >
            {selectedAnime || "Anime"}
          </AppText>
          <AppIcon
            name="chevron-down"
            size={16}
            color={selectedAnime ? "#fff" : "#6B7280"}
            set="Ionicons"
          />
        </TouchableOpacity>
      )}

      {/* Mood Filter */}
      <TouchableOpacity
        onPress={() => setShowMoodModal(true)}
        className={`flex-1 py-3 px-4 rounded-3xl border flex-row items-center justify-between ${
          selectedMood ? "border-primary bg-primary" : "border-white/5 bg-surface"
        }`}
        style={!selectedMood ? { borderColor: `${currentTheme.primary}20` } : undefined}
      >
        <AppText
          variant="bold"
          size="sm"
          className={`${
            selectedMood ? "text-white" : "text-gray-400"
          }`}
        >
          {selectedMoodData?.name || "Mood"}
        </AppText>
        <AppIcon
          name="chevron-down"
          size={16}
          color={selectedMood ? "#fff" : "#6B7280"}
          set="Ionicons"
        />
      </TouchableOpacity>

      {/* Anime Modal - Style identique à Mood Actuel / Police */}
      <SettingsModal
        visible={showAnimeModal}
        onClose={() => setShowAnimeModal(false)}
        title="Choisir un Anime"
      >
        <View className="flex-row items-center mb-6">
          <View className="w-12 h-12 rounded-2xl bg-primary/20 items-center justify-center mr-4">
            <AppIcon name="tv" size={24} color={currentTheme.primary} />
          </View>
          <View className="flex-1">
            <AppText variant="bold" className="text-foreground text-base">Filtrer par anime</AppText>
            <AppText size="xs" className="text-gray-500">Affiche les citations d'un anime spécifique</AppText>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity
            onPress={() => {
              onSelectAnime(null);
              setShowAnimeModal(false);
            }}
            className={`px-4 py-3 rounded-3xl flex-row items-center ${
              !selectedAnime ? "border border-primary/20" : "bg-abyss border border-white/10"
            }`}
            style={!selectedAnime ? { backgroundColor: currentTheme.primary } : undefined}
          >
            <AppText
              variant="bold"
              size="xs"
              className={!selectedAnime ? "text-white" : "text-gray-400"}
            >
              Tous les Animes
            </AppText>
          </TouchableOpacity>
          {ANIMES.map((anime) => (
            <TouchableOpacity
              key={anime.id}
              onPress={() => {
                onSelectAnime(anime.name);
                setShowAnimeModal(false);
              }}
              className={`px-4 py-3 rounded-3xl flex-row items-center ${
                selectedAnime === anime.name ? "border border-primary/20" : "bg-abyss border border-white/10"
              }`}
              style={selectedAnime === anime.name ? { backgroundColor: currentTheme.primary } : undefined}
            >
              <View
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: selectedAnime === anime.name ? "#fff" : anime.color }}
              />
              <AppText
                variant="bold"
                size="xs"
                className={selectedAnime === anime.name ? "text-white" : "text-gray-400"}
              >
                {anime.name}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </SettingsModal>

      {/* Mood Modal - Style identique à Mood Actuel / Police */}
      <SettingsModal
        visible={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        title="Choisir un Mood"
      >
        <View className="flex-row items-center mb-6">
          <View className="w-12 h-12 rounded-2xl bg-primary/20 items-center justify-center mr-4">
            <AppIcon name="mood_selector" size={24} color={currentTheme.primary} />
          </View>
          <View className="flex-1">
            <AppText variant="bold" className="text-foreground text-base">Filtrer par mood</AppText>
            <AppText size="xs" className="text-gray-500">Affiche les citations selon ton humeur</AppText>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity
            onPress={() => {
              onSelectMood(null);
              setShowMoodModal(false);
            }}
            className={`px-4 py-3 rounded-3xl flex-row items-center ${
              !selectedMood ? "border border-primary/20" : "bg-abyss border border-white/10"
            }`}
            style={!selectedMood ? { backgroundColor: currentTheme.primary } : undefined}
          >
            <AppText
              variant="bold"
              size="xs"
              className={!selectedMood ? "text-white" : "text-gray-400"}
            >
              Tous les Moods
            </AppText>
          </TouchableOpacity>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              onPress={() => {
                onSelectMood(mood.id);
                setShowMoodModal(false);
              }}
              className={`px-4 py-3 rounded-3xl flex-row items-center ${
                selectedMood === mood.id ? "border border-primary/20" : "bg-abyss border border-white/10"
              }`}
              style={selectedMood === mood.id ? { backgroundColor: currentTheme.primary } : undefined}
            >
              <AppIcon 
                // @ts-ignore
                name={mood.icon} 
                size={16} 
                color={selectedMood === mood.id ? "#fff" : currentTheme.primary} 
                containerStyle={{ marginRight: 6 }}
              />
              <AppText
                variant="bold"
                size="xs"
                className={selectedMood === mood.id ? "text-white" : "text-gray-400"}
              >
                {mood.name}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </SettingsModal>
    </View>
  );
};
