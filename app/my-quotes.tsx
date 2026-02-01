import { FilterBar } from "@/src/components/quotes/FilterBar";
import { AppText, DeleteConfirmationModal, ScreenHeader } from "@/src/components/ui";
import { FONT_STYLES } from "@/src/constants";
import { THEMES } from "@/src/constants/themes";
import { deleteCustomQuote, getUserCreatedQuotes, Quote } from "@/src/services/database";
import { useAppStore, useThemeStore } from "@/src/stores";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export default function MyQuotesScreen() {
  const insets = useSafeAreaInsets();
  const { userQuotes, setUserQuotes } = useAppStore();
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const router = useRouter();
  
  useFocusEffect(
    useCallback(() => {
      const loadQuotes = async () => {
        const quotes = await getUserCreatedQuotes();
        setUserQuotes(quotes);
      };
      loadQuotes();
    }, [setUserQuotes])
  );
  
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const filteredQuotes = userQuotes.filter((quote) => {
    const matchesAnime = selectedAnime ? quote.anime === selectedAnime : true;
    const matchesMood = selectedMood ? quote.mood === selectedMood : true;
    return matchesAnime && matchesMood;
  });

  const handleDeletePress = (quote: Quote) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuoteToDelete(quote);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!quoteToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteCustomQuote(quoteToDelete.id);
      
      const updatedUserQuotes = await getUserCreatedQuotes();
      setUserQuotes(updatedUserQuotes);
      
      const { quotes, setQuotes } = useAppStore.getState();
      const updatedGlobalQuotes = quotes.filter(q => q.id !== quoteToDelete.id);
      setQuotes(updatedGlobalQuotes);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDeleteModalVisible(false);
      setQuoteToDelete(null);
    } catch (error) {
      console.error("Failed to delete quote:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setQuoteToDelete(null);
  };

  const renderItem = ({ item, index }: { item: Quote; index: number }) => {
    const font =
      FONT_STYLES.find((f) => f.id === item.fontStyle) || FONT_STYLES[0];

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 100)}
        className="bg-surface m-4 p-6 rounded-3xl border border-white/5"
        style={{ borderColor: `${currentTheme.primary}20` }}
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className="bg-primary px-2 py-1 rounded">
            <AppText variant="bold" className="text-white text-[10px] uppercase">Custom</AppText>
          </View>
          <TouchableOpacity 
            onPress={() => handleDeletePress(item)}
            className="p-1 -mr-2 -mt-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <AppText 
          variant="black" 
          size="lg" 
          className="text-foreground mb-4 leading-tight"
          style={{ fontFamily: font.fontFamily }}
        >
          "{item.text}"
        </AppText>

        <View className="border-l-2 border-primary pl-3">
          <AppText variant="bold" size="xs" className="uppercase text-gray-400">
            {item.author}
          </AppText>
          <AppText variant="regular" size="xs" className="text-gray-500 mt-1">
            Citation personnelle
          </AppText>
        </View>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-abyss" style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader 
        title="Mes Citations" 
        rightAction={{
          icon: "add",
          onPress: () => router.push("/create"),
          useIonicons: true
        }}
        className="pb-0 border-transparent"
      />

      <FilterBar 
        selectedAnime={selectedAnime}
        selectedMood={selectedMood}
        onSelectAnime={setSelectedAnime}
        onSelectMood={setSelectedMood}
      />

      <View className="flex-1">
        {filteredQuotes.length > 0 ? (
          <FlatList
            data={filteredQuotes}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        ) : (
          <View className="flex-1 justify-center items-center px-10">
            <View className="bg-surface p-8 rounded-full mb-6 border border-foreground/10">
              <Ionicons name="document-text-outline" size={48} color={currentTheme.primary} />
            </View>
            <AppText variant="bold" size="lg" className="text-gray-400 text-center">
              Ton parchemin est vide...
            </AppText>
            <TouchableOpacity
              onPress={() => router.push("/create")}
              className="mt-6 bg-primary px-8 py-4 rounded-full"
            >
              <AppText variant="bold" className="text-white uppercase">
                Créer ma première citation
              </AppText>
            </TouchableOpacity>
          </View>
        )}
      </View>

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

