import { AppText } from "@/src/components/ui";
import { NotificationService } from "@/src/services/NotificationService";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function NotificationsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      await NotificationService.requestPermissions();
      router.push("/onboarding/permissions");
    } catch (error) {
      console.error("Failed to request permissions:", error);
      router.push("/onboarding/permissions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/onboarding/permissions");
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
              source={require("@/assets/images/onboarding-notification.png")}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <View className="px-6 pb-8 justify-end">
          <Animated.View entering={FadeInUp.delay(300).duration(800)}>
            <AppText
              variant="black"
              size="4xl"
              className="text-foreground mb-3 tracking-tighter"
            >
              Reste connecté{"\n"}à ton Nindo
            </AppText>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(500).duration(800)}>
            <AppText size="lg" className="text-gray-500 mb-8 leading-7">
              Active les notifications pour recevoir tes doses de motivation
              ninja au bon moment.
            </AppText>
          </Animated.View>

          {/* Progress Dots */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(600)}
            className="flex-row items-center mb-6"
          >
            <View className="w-2 h-2 bg-primary rounded-full mr-2" />
            <View className="w-2 h-2 bg-primary rounded-full mr-2" />
            <View className="w-2 h-2 bg-primary rounded-full mr-2" />
            <View className="w-2 h-2 bg-primary rounded-full mr-2" />
            <View className="w-8 h-2 bg-primary rounded-full mr-2" />
            <View className="w-2 h-2 bg-gray-600 rounded-full" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(700).duration(600)}>
            <View className="flex-row gap-4">
              <Pressable
                onPress={handleSkip}
                className="h-14 flex-1 rounded-2xl items-center justify-center bg-surface border border-primary"
              >
                <AppText variant="bold" size="lg" className="text-primary">
                  Plus tard
                </AppText>
              </Pressable>

              <Pressable
                onPress={handleEnableNotifications}
                className="h-14 flex-[2] rounded-2xl items-center justify-center bg-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <AppText variant="bold" size="lg" className="text-white">
                    Activer
                  </AppText>
                )}
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
