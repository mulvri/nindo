import { AppText, ScreenHeader } from "@/src/components/ui";
import { THEMES } from "@/src/constants/themes";
import { saveUserPreferences } from "@/src/services/database";
import { useAppStore, useThemeStore } from "@/src/stores";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;
  const { userStats, userPrefs, setUserPrefs } = useAppStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userPrefs?.username || "Ninja Anonyme");
  const router = useRouter();

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      Alert.alert("Erreur", "Le nom ne peut pas être vide.");
      return;
    }
    await saveUserPreferences({ username: tempName });
    if (userPrefs) {
      setUserPrefs({ ...userPrefs, username: tempName });
    }
    setIsEditingName(false);
  };

  const getRankInfo = (xp: number) => {
    if (xp < 100)
      return { name: "Genin", color: currentTheme.primary, icon: "shield" as const };
    if (xp < 500)
      return { name: "Chunin", color: currentTheme.primary, icon: "flash" as const };
    return { name: "Jonin", color: currentTheme.primary, icon: "shield" as const };
  };

  const rank = getRankInfo(userPrefs?.xp || 0);

  // Prepare stats for display
  const animeEntries = Object.entries(userStats?.animeStats || {}) as [string, number][];
  const topAnimes = animeEntries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <View className="flex-1 bg-abyss" style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader title="Profil" />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Animated.View
          entering={FadeInUp.duration(500)}
          className="bg-primary rounded-3xl p-6 mb-8"
        >
          {/* Name Section */}
          <View className="mb-4">
            {isEditingName ? (
              <View className="flex-row items-center bg-black/20 rounded-2xl px-4 py-3 border border-white/20">
                <TextInput
                  className="flex-1 text-white font-black text-2xl"
                  style={{ fontFamily: 'Poppins_900Black' }}
                  value={tempName}
                  onChangeText={setTempName}
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveName} className="ml-2 p-2">
                  <Ionicons name="checkmark" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsEditingName(true)}
                className="flex-row items-center justify-between"
              >
                <AppText
                  variant="black"
                  size="3xl"
                  className="text-white uppercase tracking-tighter flex-1"
                  numberOfLines={1}
                >
                  {userPrefs?.username}
                </AppText>
                <View className="bg-white/10 p-2 rounded-xl">
                  <Ionicons name="pencil" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Rank Badge */}
          <View
            className="self-start px-4 py-2 rounded-2xl flex-row items-center mb-5"
            style={{ backgroundColor: rank.color }}
          >
            <Ionicons name={rank.icon} size={16} color="#fff" />
            <AppText variant="black" size="xs" className="text-white uppercase ml-2 tracking-widest">
              {rank.name}
            </AppText>
          </View>

          {/* XP Progress */}
          <View>
            <View className="flex-row justify-between mb-2">
              <AppText variant="bold" className="text-white/60 text-[10px] uppercase tracking-widest">
                Chakra Level
              </AppText>
              <AppText variant="bold" className="text-white text-[10px]">
                {userPrefs?.xp || 0} / 500 XP
              </AppText>
            </View>
            <View className="h-2 bg-white/20 rounded-full overflow-hidden">
              <View
                className="h-full bg-white"
                style={{
                  width: `${Math.min(((userPrefs?.xp || 0) / 500) * 100, 100)}%`,
                }}
              />
            </View>
          </View>
        </Animated.View>

        {/* Ninja Stats Section */}
        <AppText variant="black" size="xl" className="text-foreground uppercase mb-4 tracking-tight">
          Ninja Stats
        </AppText>
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-surface p-6 rounded-3xl border border-white/5" style={{ borderColor: `${currentTheme.primary}20` }}>
            <AppText variant="black" size="4xl" className="text-foreground">
              {userStats?.totalFavorites || 0}
            </AppText>
            <AppText variant="bold" className="text-[10px] text-gray-500 uppercase">
              Soul Library
            </AppText>
          </View>
          <View className="flex-1 bg-surface p-6 rounded-3xl border border-white/5" style={{ borderColor: `${currentTheme.primary}20` }}>
            <AppText variant="black" size="4xl" className="text-foreground">{rank.name}</AppText>
            <AppText variant="bold" className="text-[10px] text-gray-500 uppercase">
              Current Mastery
            </AppText>
          </View>
        </View>

        {/* Anime Mastery */}
        <Animated.View
          entering={FadeIn.delay(300)}
          className="bg-surface border border-white/5 rounded-3xl p-6 mb-10"
          style={{ borderColor: `${currentTheme.primary}20` }}
        >
          <AppText variant="bold" className="text-primary uppercase mb-4">
            Origines les plus inspirantes
          </AppText>
          {topAnimes.length > 0 ? (
            topAnimes.map(([anime, count]) => (
              <View key={anime} className="mb-4">
                <View className="flex-row justify-between mb-1">
                  <AppText variant="bold" size="xs" className="uppercase text-foreground">{anime}</AppText>
                  <AppText variant="black" size="xs" className="text-foreground">{count}</AppText>
                </View>
                <View className="h-2 bg-abyss rounded-full overflow-hidden border border-primary/10">
                  <View
                    className="h-full bg-primary"
                    style={{
                      width: `${(count / (userStats?.totalFavorites || 1)) * 100}%`,
                    }}
                  />
                </View>
              </View>
            ))
          ) : (
            <AppText variant="regular" size="xs" className="text-gray-500">
              Continue d'ajouter des favoris pour voir tes stats !
            </AppText>
          )}
        </Animated.View>

        {/* Achievements Button */}
        <TouchableOpacity
          onPress={() => router.push("/achievements")}
          className="bg-surface py-6 rounded-3xl items-center border border-white/5 mb-10 shadow-sm"
          style={{ borderColor: `${currentTheme.primary}20` }}
        >
          <View className="flex-row items-center">
            <Ionicons name="trophy" size={20} color={currentTheme.primary} />
            <AppText variant="black" className="uppercase tracking-widest ml-2">
              Voir les exploits
            </AppText>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
