import { FilterBar } from "@/src/components/quotes/FilterBar";
import { AppText, DeleteConfirmationModal, EmptyState, ScreenHeader } from "@/src/components/ui";
import { THEMES } from "@/src/constants/themes";
import { Quote, toggleFavorite } from "@/src/services/database";
import { useAppStore, useThemeStore } from "@/src/stores";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const { favorites, setFavorites } = useAppStore();
  const router = useRouter();
  
  // State for delete confirmation
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filter states
  const [selectedAnime, setSelectedAnime] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Filtered favorites
  const filteredFavorites = favorites.filter((quote) => {
    const matchesAnime = selectedAnime ? quote.anime === selectedAnime : true;
    const matchesMood = selectedMood ? quote.mood === selectedMood : true;
    return matchesAnime && matchesMood;
  });

  const handleDeletePress = (quote: Quote) => {
    setQuoteToDelete(quote);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!quoteToDelete) return;
    
    setIsDeleting(true);
    try {
      // Optimistic UI update
      setFavorites(favorites.filter(q => q.id !== quoteToDelete.id));
      await toggleFavorite(quoteToDelete.id, false);
      setDeleteModalVisible(false);
      setQuoteToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setQuoteToDelete(null);
  };

  const renderItem = ({ item, index }: { item: Quote; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100)}
      className="bg-surface m-4 p-6 rounded-3xl border border-white/5"
      style={{ borderColor: `${currentTheme.primary}20` }}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="bg-primary px-2 py-1 rounded">
          <AppText variant="bold" className="text-white text-[10px] uppercase">{item.anime}</AppText>
        </View>
        <TouchableOpacity onPress={() => handleDeletePress(item)}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <AppText variant="black" size="lg" className="text-foreground mb-4">"{item.text}"</AppText>

      <View className="border-l-2 border-primary pl-3">
        <AppText variant="bold" size="xs" className="uppercase text-gray-400">{item.author}</AppText>
      </View>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-abyss" style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader title="Mes Favoris" />

      <FilterBar 
        selectedAnime={selectedAnime}
        selectedMood={selectedMood}
        onSelectAnime={setSelectedAnime}
        onSelectMood={setSelectedMood}
      />

      {favorites.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="Ta bibliothèque est vide"
          subtitle="Double-tap sur les citations que tu aimes pour les sauvegarder ici."
          ctaLabel="Trouver du Chakra"
          onCtaPress={() => router.back()}
        />
      ) : filteredFavorites.length === 0 ? (
        <EmptyState
          icon="filter-outline"
          title="Aucun résultat"
          subtitle="Aucune citation ne correspond à tes filtres."
          ctaLabel="Réinitialiser les filtres"
          onCtaPress={() => {
            setSelectedAnime(null);
            setSelectedMood(null);
          }}
        />
      ) : (
        <FlatList
          data={filteredFavorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={quoteToDelete ? `cette citation de ${quoteToDelete.author}` : "cette citation"}
        isLoading={isDeleting}
      />
    </View>
  );
}
