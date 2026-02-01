import { AppText } from "@/src/components/ui";
import { THEMES } from "@/src/constants/themes";
import { useThemeStore } from "@/src/stores";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, Pressable, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  return (
    <View className="flex-1 bg-abyss">
      <SafeAreaView className="flex-1">
        {/* Helper to get theme - assuming simpler to just make text darker or use store if imported */}
        {/* Since I need to import useThemeStore and it's not imported, I will add the import first in a separate block or just use a darker gray that works for both like text-gray-500, but user specifically complained about light mode. */}
        
        {/* Image Container */}
        <Animated.View
          entering={FadeIn.duration(1000)}
          className="flex-1 px-8 mt-6 mb-4"
        >
          <View className="w-full h-full rounded-[32px] overflow-hidden bg-abyss">
            <Image
              source={require("@/assets/images/onboarding-welcome.png")}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <View className="px-6 py-8 justify-end">
          <Animated.View entering={FadeInUp.delay(300).duration(800)}>
            <AppText variant="black" size="5xl" className="text-foreground mb-3 tracking-tighter">
              Bienvenue dans{"\n"}Nindo
            </AppText>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(500).duration(800)}>
            {/* Using text-gray-500 for better contrast in light mode while still okay for dark */}
            <AppText size="lg" className="text-gray-500 mb-8 leading-7">
              Découvre ta voie du ninja à travers des citations inspirantes
              tirées de tes animes préférés.
            </AppText>
          </Animated.View>

          {/* Progress Dots */}
          <Animated.View
            entering={FadeInDown.delay(700).duration(600)}
            className="flex-row items-center mb-6"
          >
            <View className="w-8 h-2 bg-primary rounded-full mr-2" />
            <View className="w-2 h-2 bg-gray-600 rounded-full mr-2" />
            <View className="w-2 h-2 bg-gray-600 rounded-full mr-2" />
            <View className="w-2 h-2 bg-gray-600 rounded-full mr-2" />
            <View className="w-2 h-2 bg-gray-600 rounded-full" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).duration(600)}>
            <Pressable
              onPress={() => router.push("/onboarding/name")}
              className="h-14 bg-primary rounded-2xl items-center justify-center"
              style={{ shadowColor: currentTheme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}
            >
              <AppText variant="bold" size="lg" className="text-white">
                Commencer
              </AppText>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
