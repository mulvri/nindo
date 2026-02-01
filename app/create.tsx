import { AppText, ConfirmationModal, ScreenHeader } from "@/src/components/ui";
import { BACKGROUNDS, FONT_STYLES, MOODS } from "@/src/constants";
import { THEMES } from "@/src/constants/themes";
import { createCustomQuote } from "@/src/services/database";
import { useAppStore, useThemeStore } from "@/src/stores";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppIcon } from "../src/components/ui/AppIcon";

const MAX_QUOTE_LENGTH = 280;

export default function CreateScreen() {
  const [quoteText, setQuoteText] = useState("");
  const [author, setAuthor] = useState("");
  const [selectedBackground, setSelectedBackground] = useState(BACKGROUNDS[0].id);
  const [selectedFont, setSelectedFont] = useState(FONT_STYLES[0].id);
  const [selectedMood, setSelectedMood] = useState(MOODS[0].id);
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const router = useRouter();
  
  // Modal states
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!quoteText.trim()) {
      Alert.alert("Erreur", "La citation ne peut pas être vide.");
      return;
    }
    if (!author.trim()) {
      Alert.alert("Erreur", "L'auteur ne peut pas être vide.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createCustomQuote(
        quoteText.trim(),
        author.trim(),
        selectedBackground,
        selectedFont,
        selectedMood
      );
      
      // Mettre à jour le store global pour affichage immédiat
      const newQuote = {
        id: result.lastInsertRowId,
        text: quoteText.trim(),
        author: author.trim(),
        anime: "Custom",
        mood: selectedMood,
        isUserCreated: true,
        isFavorite: false,
        backgroundImage: selectedBackground,
        fontStyle: selectedFont,
      };
      
      // Injecter dans les listes du store
      const { quotes, setQuotes, userQuotes, setUserQuotes } = useAppStore.getState();
      setQuotes([...quotes, newQuote]); // Ajout au flux général
      setUserQuotes([newQuote, ...userQuotes]); // Ajout en tête de "Mes Citations"

      setIsSaving(false);
      setSuccessModalVisible(true);
    } catch (error) {
      console.error(error);
      setIsSaving(false);
      Alert.alert("Erreur", "Impossible de sauvegarder la citation.");
    }
  };
  
  const handleSuccessConfirm = () => {
    setSuccessModalVisible(false);
    router.back();
  };


  const remainingChars = MAX_QUOTE_LENGTH - quoteText.length;
  const selectedBg = BACKGROUNDS.find((bg) => bg.id === selectedBackground);
  const selectedFontStyle = FONT_STYLES.find((f) => f.id === selectedFont);

  return (
    <SafeAreaView className="flex-1 bg-abyss">
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScreenHeader 
          title="Créer" 
          rightAction={{
            icon: "check",
            onPress: handleSave,
          }}
        />

        <ScrollView
          className="flex-1 px-6 py-8"
          showsVerticalScrollIndicator={false}
        >
          {/* Quote Text Input */}
          <View className="mb-8">
            <AppText variant="bold" size="xs" className="text-gray-500 uppercase mb-2 tracking-widest">
              Ta Citation
            </AppText>
            <TextInput
              className="bg-surface border border-white/5 rounded-3xl p-6 text-lg min-h-[150px] text-foreground"
              style={{ 
                fontFamily: 'Poppins_700Bold',
                borderColor: `${currentTheme.primary}20`
              }}
              value={quoteText}
              onChangeText={setQuoteText}
              multiline
              maxLength={MAX_QUOTE_LENGTH}
              textAlignVertical="top"
            />
            <AppText variant="bold" size="xs"
              className={`mt-2 text-right ${
                remainingChars < 50 ? "text-red-500" : "text-gray-500"
              }`}
            >
              {remainingChars} caractères restants
            </AppText>
          </View>

          {/* Author Input */}
          <View className="mb-8">
            <AppText variant="bold" size="xs" className="text-gray-500 uppercase mb-2 tracking-widest">
              Auteur / Personnage
            </AppText>
            <TextInput
              className="bg-surface border border-white/5 rounded-3xl px-6 py-4 text-base text-foreground"
              style={{ 
                fontFamily: 'Poppins_700Bold',
                borderColor: `${currentTheme.primary}20`
              }}
              value={author}
              onChangeText={setAuthor}
            />
          </View>


          {/* Mood Selector */}
          <View className="mb-8">
            <AppText variant="bold" size="xs" className="text-gray-500 uppercase mb-3 tracking-widest">
              Mood de la citation
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {MOODS.map((mood) => {
                const isSelected = selectedMood === mood.id;
                return (
                  <TouchableOpacity
                    key={mood.id}
                    onPress={() => setSelectedMood(mood.id)}
                    className={`px-4 py-3 rounded-3xl flex-row items-center border ${
                      isSelected ? "border-transparent" : "bg-surface border-white/5"
                    }`}
                    style={{ 
                      backgroundColor: isSelected ? currentTheme.primary : currentTheme.surface,
                      borderColor: isSelected ? currentTheme.primary : `${currentTheme.primary}20`
                    }}
                  >
                    <View className="mr-2">
                      <AppIcon 
                        name={mood.icon} 
                        size={16} 
                        color={isSelected ? "#fff" : currentTheme.primary} 
                      />
                    </View>
                    <AppText
                      variant="bold"
                      size="xs"
                      className={isSelected ? "text-white" : "text-gray-400"}
                    >
                      {mood.name}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>



          {/* Live Preview */}
          <AppText variant="bold" size="xs" className="text-gray-500 uppercase mb-4 tracking-widest">
            Aperçu
          </AppText>
          <Animated.View
            entering={FadeIn}
            className="border border-white/5 rounded-3xl overflow-hidden mb-8"
            style={{ 
              borderColor: `${currentTheme.primary}20`, 
              shadowColor: "#000", 
              shadowOffset: { width: 0, height: 8 }, 
              shadowOpacity: 0.5, 
              shadowRadius: 16, 
              elevation: 16 
            }}
          >
            <View className="bg-surface p-8">
              <View className="mb-4">
                <View
                  className="bg-primary px-3 py-1 rounded-md self-start"
                  style={{ transform: [{ rotate: "-1deg" }] }}
                >
                  <AppText variant="bold" size="xs" className="text-white uppercase tracking-widest">
                    Custom
                  </AppText>
                </View>
              </View>

              <AppText
                className="text-foreground mb-6 leading-tight"
                style={{
                  fontSize: 24,
                  fontFamily: FONT_STYLES[0].fontFamily,
                }}
              >
                {quoteText}
              </AppText>

              <View className="border-l-4 border-primary pl-4">
                <AppText variant="black" size="lg" className="text-foreground uppercase tracking-tighter">
                  {author}
                </AppText>
                <AppText size="xs" variant="regular" className="text-gray-400 mt-1">
                  — Citation personnelle
                </AppText>
              </View>
            </View>
          </Animated.View>


        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Confirmation Modal */}
      <ConfirmationModal
        visible={successModalVisible}
        onClose={handleSuccessConfirm}
        onConfirm={handleSuccessConfirm}
        title="Citation créée !"
        message="Ta citation personnelle a été ajoutée à ton flux. Elle apparaîtra avec le tag 'Custom'."
        confirmText="Parfait !"
        cancelText=""
        icon="sparkles"
        variant="info"
      />
    </SafeAreaView>
  );
}
