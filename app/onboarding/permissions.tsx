import { AppText } from "@/src/components/ui";
import { NotificationService } from "@/src/services/NotificationService";
import { saveUserPreferences } from "@/src/services/database";
import { useAppStore, useOnboardingStore } from "@/src/stores";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Pressable,
    View
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function PermissionsScreen() {
  const router = useRouter();
  const { selectedAnimes, selectedMoods, firstName, reset } = useOnboardingStore();
  const setInitialRouteName = useAppStore((state) => state.setInitialRouteName);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Demander d'abord la permission pour les notifications
      await NotificationService.requestPermissions();

      // Save preferences to database with firstName
      await saveUserPreferences({
        onboardingCompleted: true,
        favoriteAnimes: JSON.stringify(selectedAnimes),
        selectedMoods: JSON.stringify(selectedMoods),
        firstName: firstName,
        username: firstName || "Ninja Anonyme",
        xp: 0,
        streakCount: 0,
        bestStreak: 0,
        totalDaysOpened: 0,
        moodReminderEnabled: true,
        streakReminderEnabled: true,
      });

      // Synchroniser les notifications pour la première fois
      await NotificationService.syncNotifications();

      // Reset onboarding store
      reset();

      // Mettre à jour le state pour indiquer que l'onboarding est terminé
      setInitialRouteName("index");

      // Navigate to home
      router.replace("/");
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-abyss">
      <SafeAreaView className="flex-1">
        {/* Image Container */}
        <Animated.View
          entering={FadeIn.duration(1000)}
          className="flex-1 px-8 mt-6 mb-4"
        >
          <View className="w-full h-full rounded-[32px] overflow-hidden bg-abyss">
            <Image
              source={require("@/assets/images/onboarding-complete.png")}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <View className="px-6 pb-8 justify-end">
          <Animated.View
            entering={FadeInUp.delay(300).duration(800)}
            className="items-center mb-6"
          >
            <AppText variant="black" size="3xl" className="text-center mb-3 text-foreground tracking-tighter">
              {firstName ? `${firstName}, ` : ""}Prêt à{"\n"}découvrir ton Nindo ?
            </AppText>

            <AppText size="lg" className="text-gray-500 text-center px-4">
              Tu as sélectionné {selectedAnimes.length} anime(s) et{" "}
              {selectedMoods.length} mood(s). Ton flux de citations est prêt !
            </AppText>
          </Animated.View>

         
          {/* Progress Dots */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(600)}
            className="flex-row items-center justify-center mb-4"
          >
            <View className="w-2 h-2 bg-primary rounded-full mr-2" />
            <View className="w-2 h-2 bg-primary rounded-full mr-2" />
            <View className="w-2 h-2 bg-primary rounded-full mr-2" />
            <View className="w-2 h-2 bg-primary rounded-full mr-2" />
            <View className="w-8 h-2 bg-primary rounded-full" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(700).duration(600)}>
            <Pressable
              onPress={handleComplete}
              className="h-14 bg-primary rounded-2xl items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AppText variant="bold" size="lg" className="text-white">
                  Commencer 
                </AppText>
              )}
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
