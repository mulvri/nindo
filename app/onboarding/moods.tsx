import { AppText } from "@/src/components/ui/AppText";
import { SelectableChip } from "@/src/components/ui/SelectableChip";
import { MOODS } from "@/src/constants";
import { THEMES } from "@/src/constants/themes";
import { useOnboardingStore, useThemeStore } from "@/src/stores";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MoodsScreen() {
  const router = useRouter();
  const { selectedMoods, toggleMood } = useOnboardingStore();
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  const handleFinish = () => {
    router.push("/onboarding/permissions");
  };

  return (
    <SafeAreaView className="flex-1 bg-abyss">
      <ScrollView className="flex-1 px-6">
        <Animated.View entering={FadeInDown.duration(500)} className="py-8">
          <AppText variant="black" size="4xl" className="text-foreground mb-2 tracking-tighter">
            Définir ton Mood
          </AppText>
          <AppText size="lg" className="text-gray-500 mb-8">
            Quel type d'énergie as-tu besoin aujourd'hui ?
          </AppText>

          <View className="flex-row flex-wrap">
            {MOODS.map((mood) => (
              <SelectableChip
                key={mood.id}
                label={mood.name}
                emoji={mood.emoji}
                selected={selectedMoods.includes(mood.id)}
                onPress={() => toggleMood(mood.id)}
                color={currentTheme.primary}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <View className="p-6 border-t" style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}>
        {/* Progress Dots */}
        <View className="flex-row items-center justify-center mb-4">
          <View className="w-2 h-2 bg-primary rounded-full mr-2" />
          <View className="w-2 h-2 bg-primary rounded-full mr-2" />
          <View className="w-2 h-2 bg-primary rounded-full mr-2" />
          <View className="w-8 h-2 bg-primary rounded-full mr-2" />
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
            onPress={handleFinish}
            className={`h-14 flex-[2] rounded-2xl items-center justify-center ${
              selectedMoods.length > 0 ? "bg-primary" : "bg-surface"
            }`}
            disabled={selectedMoods.length === 0}
          >
            <AppText
              variant="bold"
              size="lg"
              className={`${
                selectedMoods.length > 0 ? "text-white" : "text-gray-500"
              }`}
            >
              C'est parti !
            </AppText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
