import { MoodQuickSelector } from "@/src/components/mood/MoodQuickSelector";
import { SettingsModal } from "@/src/components/settings/SettingsModal";
import { AppText, ResetConfirmationModal, ScreenHeader } from "@/src/components/ui";
import { AppIcon } from "@/src/components/ui/AppIcon";
import { MOODS } from "@/src/constants";
import { FONT_FAMILIES, FontFamily } from "@/src/constants/fonts";
import { THEMES, ThemeType } from "@/src/constants/themes";
import { getUserPreferences, resetDatabase, saveUserPreferences } from "@/src/services/database";
import { useFontStore, useThemeStore } from "@/src/stores";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const [prefs, setPrefs] = useState<any>(null);
  const { theme, setTheme } = useThemeStore();
  const { appFontFamily, setAppFontFamily } = useFontStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  // Fallback vers poppins si la police n'est pas valide
  const currentFont = FONT_FAMILIES[appFontFamily] || FONT_FAMILIES.poppins;
  const router = useRouter();

  // Modal states
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [fontModalVisible, setFontModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchPrefs = async () => {
    const data = await getUserPreferences();
    setPrefs(data);
  };

  useEffect(() => {
    fetchPrefs();
  }, []);

  const handleResetPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setResetModalVisible(true);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await resetDatabase();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResetModalVisible(false);
      router.replace("/onboarding/animes");
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue lors de la réinitialisation.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleToggleTheme = async (newTheme: ThemeType) => {
    setTheme(newTheme);
    await saveUserPreferences({ theme: newTheme });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSelectFont = async (fontKey: FontFamily) => {
    setAppFontFamily(fontKey);
    await saveUserPreferences({ appFontFamily: fontKey });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View className="flex-1 bg-abyss">
      <SafeAreaView className="flex-1">
        

        <ScreenHeader title="Paramètres" />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Profile Link */}
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          className="bg-primary rounded-3xl p-6 mb-8 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <AppIcon name="person" size={20} color="#fff" />
            <AppText variant="bold" className="ml-3 text-white">
              Mon Profil
            </AppText>
          </View>
          <AppIcon name="forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Visual Mode Section */}
        <AppText variant="black" size="xl" className="text-foreground uppercase mb-4 tracking-tight">
          Apparence
        </AppText>
        <TouchableOpacity
          onPress={() => setThemeModalVisible(true)}
          className="bg-surface border border-white/5 rounded-3xl p-6 mb-8 flex-row items-center justify-between"
          style={{ borderColor: `${currentTheme.primary}20` }}
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center mr-3">
              <AppIcon 
                name={
                  theme === "light" ? "sunny" : 
                  theme === "dark" ? "shadow" : 
                  theme === "naruto" ? "shonen" : 
                  theme === "sakura" ? "flower" : 
                  theme === "gold" ? "crown" : 
                  theme === "nordic" ? "ice" : "leaf"
                } 
                size={20} 
                color={THEMES[theme].primary} 
              />
            </View>
            <View>
              <AppText variant="bold" className="text-foreground">Thèmes & Couleurs</AppText>
              <AppText size="xs" className="text-gray-500 capitalize">
                Actuel : {theme}
              </AppText>
            </View>
          </View>
          <AppIcon name="forward" size={20} color={THEMES[theme].primary} />
        </TouchableOpacity>

        {/* Police Section */}
        <TouchableOpacity
          onPress={() => setFontModalVisible(true)}
          className="bg-surface border border-white/5 rounded-3xl p-6 mb-8 flex-row items-center justify-between"
          style={{ borderColor: `${currentTheme.primary}20` }}
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center mr-3">
              <AppIcon name="text" size={20} color={currentTheme.primary} />
            </View>
            <View>
              <AppText variant="bold" className="text-foreground">Police</AppText>
              <AppText size="xs" className="text-gray-500">
                Actuelle : {currentFont.name}
              </AppText>
            </View>
          </View>
          <AppIcon name="forward" size={20} color={currentTheme.primary} />
        </TouchableOpacity>

        {/* Mood Actuel Section */}
        <AppText variant="black" size="xl" className="text-foreground uppercase mb-4 tracking-tight">
          Mood Actuel
        </AppText>
        <TouchableOpacity
          onPress={() => setMoodModalVisible(true)}
          className="bg-surface border border-white/5 rounded-3xl p-6 mb-8 flex-row items-center justify-between"
          style={{ borderColor: `${currentTheme.primary}20` }}
        >
          <View className="flex-row items-center">
            <AppIcon 
              name={MOODS.find((m) => m.id === prefs?.currentDayMood)?.icon ?? "mood_selector"}
              size={32}
              containerStyle={{ marginRight: 12 }}
              color={currentTheme.primary}
            />
            <View>
              <AppText variant="bold" className="text-foreground">
                {MOODS.find((m) => m.id === prefs?.currentDayMood)?.name || "Non défini"}
              </AppText>
              <AppText size="xs" className="text-gray-500">
                Change ton mood quotidien
              </AppText>
            </View>
          </View>
          <AppIcon name="forward" size={20} color={THEMES[theme].primary} />
        </TouchableOpacity>

        {/* Notifications Section */}
        <AppText variant="black" size="xl" className="text-foreground uppercase mb-4 tracking-tight">
          Notifications
        </AppText>
        <TouchableOpacity
          onPress={() => router.push("/reminders")}
          className="bg-surface border border-white/5 rounded-3xl p-6 mb-4 flex-row items-center justify-between"
          style={{ borderColor: `${currentTheme.primary}20` }}
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center mr-3">
              <AppIcon name="notification" size={20} color={currentTheme.primary} />
            </View>
            <View>
              <AppText variant="bold" className="text-foreground">Rappels & Citations</AppText>
              <AppText size="xs" className="text-gray-500">
                Configure tes notifications avancées
              </AppText>
            </View>
          </View>
          <AppIcon name="forward" size={20} color={THEMES[theme].primary} />
        </TouchableOpacity>

        

        {/* Data Management */}
        <AppText variant="black" size="xl" className="text-foreground uppercase mb-4 tracking-tight">
          Données
        </AppText>

        {/* Debug Notifications - Only in DEV */}
        {__DEV__ && (
          <TouchableOpacity
            onPress={() => router.push("/debug-notifications")}
            className="bg-surface border border-yellow-500/20 rounded-3xl p-6 mb-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-yellow-500/20 items-center justify-center mr-3">
                <AppIcon name="bug" size={20} color="#EAB308" />
              </View>
              <View>
                <AppText variant="bold" className="text-yellow-500">Debug Notifications</AppText>
                <AppText size="xs" className="text-gray-500">
                  Diagnostiquer les rappels et notifs
                </AppText>
              </View>
            </View>
            <AppIcon name="forward" size={20} color="#EAB308" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleResetPress}
          className="bg-surface border border-red-500/20 rounded-3xl p-6 mb-8 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <AppIcon name="trash" size={20} color="#EF4444" />
            <AppText variant="bold" className="ml-3 text-red-500">
              Réinitialiser le Dojo
            </AppText>
          </View>
        </TouchableOpacity>

        {/* About Section */}
        <AppText variant="black" size="xl" className="text-foreground uppercase mb-4 tracking-tight">
          À propos
        </AppText>
        <View className="bg-surface rounded-3xl p-6 mb-10 border border-white/5" style={{ borderColor: `${currentTheme.primary}20` }}>
          <View className="flex-row items-center mb-3">
            <AppIcon name="info" size={16} color={currentTheme.primary} />
            <AppText variant="bold" size="xs" className="ml-2 text-gray-500 uppercase">
              Version
            </AppText>
          </View>
          <AppText variant="black" size="2xl" className="mb-4 text-foreground">Nindo v1.0.0</AppText>
          <AppText size="xs" className="text-gray-500 leading-relaxed font-medium">
            Développé avec <AppIcon name="heart" size="xs" color="#EF4444" /> pour les ninjas modernes qui cherchent
            l'inspiration quotidienne.
          </AppText>
          <AppText variant="medium" size="xs" className="text-gray-400 mt-4">
            "Le vrai ninja ne renonce jamais." - Naruto Uzumaki
          </AppText>
        </View>
      </ScrollView>

      {/* MODALS */}
      </SafeAreaView>

      {/* MODALS (moved outside SafeAreaView to touch bottom) */}


      <SettingsModal
        visible={moodModalVisible}
        onClose={() => setMoodModalVisible(false)}
        title="Mood Actuel"
        
      >
        <View className="flex-row items-center mb-6">
          <View className="w-12 h-12 rounded-2xl bg-blue-500/20 items-center justify-center mr-4">
            <AppIcon name="mood_selector" size={24} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <AppText variant="bold" className="text-foreground text-base">Ton état d'esprit</AppText>
            <AppText size="xs" className="text-gray-500">Les citations s'adaptent à tes émotions</AppText>
          </View>
        </View>
        <MoodQuickSelector onMoodChange={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          fetchPrefs();
          setMoodModalVisible(false);
        }} />
      </SettingsModal>

      <SettingsModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
        title="Thèmes & Couleurs"
      >
        <View className="flex-row items-center mb-6">
          <View className="w-12 h-12 rounded-2xl bg-primary/20 items-center justify-center mr-4">
            <AppIcon name="palette" size={24} color={currentTheme.primary} />
          </View>
          <View className="flex-1">
            <AppText variant="bold" className="text-foreground text-base">Personnalisation</AppText>
            <AppText size="xs" className="text-gray-500">Choisis l'ambiance de ton dojo</AppText>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {[
            { id: "light", name: "Clair", icon: "sunny" },
            { id: "dark", name: "Sombre", icon: "shadow" },
            { id: "naruto", name: "Naruto", icon: "shonen" },
            { id: "sakura", name: "Sakura", icon: "flower" },
            { id: "gold", name: "Gold", icon: "crown" },
            { id: "nordic", name: "Nordic", icon: "ice" },
            { id: "emerald", name: "Emerald", icon: "leaf" },
          ].map((t) => {
            const themeData = THEMES[t.id as ThemeType];
            const isSelected = theme === t.id;
            
            // Special styling for Light/Dark themes when selected
            let selectedBg = themeData.primary;
            let selectedContentColor = "#fff";
            
            if (isSelected) {
              if (t.id === "light") {
                selectedBg = "#fff";
                selectedContentColor = "#000";
              } else if (t.id === "dark") {
                selectedBg = "#1A1A1A";
                selectedContentColor = "#fff";
              }
            }

            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => handleToggleTheme(t.id as ThemeType)}
                className={`px-4 py-3 rounded-3xl flex-row items-center ${
                  isSelected ? "border border-primary/20" : "bg-abyss border border-white/10"
                }`}
                style={isSelected ? { backgroundColor: selectedBg } : undefined}
              >
                <AppIcon 
                  name={t.icon as any} 
                  size={18} 
                  color={isSelected ? selectedContentColor : themeData.primary} 
                  containerStyle={{ marginRight: 8 }}
                />
                <AppText 
                  variant="bold" 
                  size="xs"
                  style={isSelected ? { color: selectedContentColor } : undefined}
                  className={isSelected ? "" : "text-gray-400"}
                >
                  {t.name}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </SettingsModal>

      {/* Font Selection Modal */}
      <SettingsModal
        visible={fontModalVisible}
        onClose={() => setFontModalVisible(false)}
        title="Police"
      >
        <View className="flex-row items-center mb-6">
          <View className="w-12 h-12 rounded-2xl bg-primary/20 items-center justify-center mr-4">
            <AppIcon name="text" size={24} color={currentTheme.primary} />
          </View>
          <View className="flex-1">
            <AppText variant="bold" className="text-foreground text-base">Typographie</AppText>
            <AppText size="xs" className="text-gray-500">Choisis ta police preferee</AppText>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {(Object.entries(FONT_FAMILIES) as [FontFamily, typeof FONT_FAMILIES[FontFamily]][]).map(
            ([key, font]) => {
              const isSelected = appFontFamily === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => handleSelectFont(key)}
                  className={`px-4 py-3 rounded-3xl flex-row items-center ${
                    isSelected ? "border border-primary/20" : "bg-abyss border border-white/10"
                  }`}
                  style={isSelected ? { backgroundColor: currentTheme.primary } : undefined}
                >
                  <AppText
                    variant="bold"
                    size="xs"
                    style={[
                      isSelected ? { color: "#fff" } : { color: "#9CA3AF" },
                      key !== "system" ? { fontFamily: font.regular } : undefined,
                    ]}
                  >
                    {font.name}
                  </AppText>
                </TouchableOpacity>
              );
            }
          )}
        </View>
      </SettingsModal>

      {/* Reset Confirmation Modal */}
      <ResetConfirmationModal
        visible={resetModalVisible}
        onClose={() => setResetModalVisible(false)}
        onConfirm={handleConfirmReset}
        title="Réinitialiser le Dojo ?"
        message="Cette action effacera tous tes favoris, ton XP et tes préférences. Cette action est irréversible."
        isLoading={isResetting}
      />
    </View>
  );
}
