import { AppText } from "@/src/components/ui/AppText";
import { SelectableChip } from "@/src/components/ui/SelectableChip";
import { ANIMES } from "@/src/constants";
import { useOnboardingStore } from "@/src/stores";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnimesScreen() {
  const router = useRouter();
  const { selectedAnimes, toggleAnime, firstName } = useOnboardingStore();

  return (
    <SafeAreaView className="flex-1 bg-abyss">
      <ScrollView className="flex-1 px-6">
        <Animated.View entering={FadeInDown.duration(500)} className="py-8">
          <AppText variant="black" size="4xl" className="text-foreground mb-2 tracking-tighter">
            {firstName ? `${firstName}, choisis` : "Choisis"}{"\n"}tes Animes
          </AppText>
          <AppText size="lg" className="text-gray-500 mb-8">
            Sélectionne les sources de ta motivation quotidienne.
          </AppText>

          <View className="flex-row flex-wrap">
            {ANIMES.map((anime) => (
              <SelectableChip
                key={anime.id}
                label={anime.name}
                selected={selectedAnimes.includes(anime.id)}
                onPress={() => toggleAnime(anime.id)}
                color={anime.color}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <View className="p-6 border-t" style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}>
        {/* Progress Dots */}
        <View className="flex-row items-center mb-6">
          <View className="w-2 h-2 bg-primary rounded-full mr-2" />
          <View className="w-2 h-2 bg-primary rounded-full mr-2" />
          <View className="w-8 h-2 bg-primary rounded-full mr-2" />
          <View className="w-2 h-2 bg-gray-600 rounded-full mr-2" />
          <View className="w-2 h-2 bg-gray-600 rounded-full mr-2" />
          <View className="w-2 h-2 bg-gray-600 rounded-full" />
        </View>

        <View className="flex-row gap-4">
          <Pressable
            onPress={() => router.back()}
            className="h-14 flex-1 rounded-2xl items-center justify-center bg-surface border border-primary"
          >
            <AppText variant="bold" size="lg" className="text-primary">Retour</AppText>
          </Pressable>

          <Pressable
            onPress={() => router.push("/onboarding/moods")}
            className={`h-14 flex-[2] rounded-2xl items-center justify-center ${
              selectedAnimes.length > 0 ? "bg-primary" : "bg-surface"
            }`}
            disabled={selectedAnimes.length === 0}
          >
            <AppText
              variant="bold"
              size="lg"
              className={`${
                selectedAnimes.length > 0 ? "text-white" : "text-gray-500"
              }`}
            >
              Continuer
            </AppText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
