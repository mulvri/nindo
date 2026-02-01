import { AppText } from "@/src/components/ui";
import { useOnboardingStore } from "@/src/stores";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  Pressable,
  TextInput,
  TouchableWithoutFeedback,
  View
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function NameScreen() {
  const router = useRouter();
  const { firstName, setFirstName } = useOnboardingStore();
  const [localName, setLocalName] = useState(firstName);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const inputScale = useSharedValue(1);

  const isValidName = localName.trim().length >= 2 && localName.trim().length <= 20;

  const handleContinue = () => {
    if (isValidName) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setFirstName(localName.trim());
      router.push("/onboarding/animes");
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    inputScale.value = withSpring(1.02);
  };

  const handleBlur = () => {
    setIsFocused(false);
    inputScale.value = withSpring(1);
  };

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-abyss">
        {/* Image Container */}
        <Animated.View
          entering={FadeIn.duration(1000)}
          className="flex-1 px-8 mt-6 mb-4"
        >
          <View className="w-full h-full rounded-[32px] overflow-hidden bg-abyss relative">
            <Image
              source={require("@/assets/images/onboarding-name.png")}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <View className="px-6 pb-8 justify-end">
          <Animated.View entering={FadeInUp.delay(300).duration(800)}>
            <AppText variant="black" size="4xl" className="text-foreground mb-2 tracking-tighter">
              Comment dois-je{"\n"}t'appeler ?
            </AppText>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(500).duration(800)}>
            <AppText size="lg" className="text-gray-500 mb-8">
              Entre ton prénom pour personnaliser ton expérience ninja.
            </AppText>
          </Animated.View>

          {/* Input Field */}
          <Animated.View entering={FadeInDown.delay(600).duration(600)}>
            <Animated.View style={inputAnimatedStyle}>
              <View
                className={`bg-surface rounded-2xl border-2 mb-4 ${
                  isFocused ? "border-primary" : "border-transparent"
                }`}
              >
                <TextInput
                  ref={inputRef}
                  value={localName}
                  onChangeText={setLocalName}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="Ton prénom..."
                  placeholderTextColor="#9CA3AF"
                  className="h-16 px-5 text-xl text-foreground font-semibold"
                  style={{ fontFamily: 'Poppins_600SemiBold' }}
                  maxLength={20}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </View>

              {/* Character Count */}
              <View className="flex-row justify-between items-center mb-6">
                <AppText size="sm" className="text-gray-500">
                  {localName.length < 2
                    ? "Minimum 2 caractères"
                    : ""}
                </AppText>
                <AppText size="sm"
                  className={`${
                    localName.length > 15 ? "text-orange-400" : "text-gray-500"
                  }`}
                >
                  {localName.length}/20
                </AppText>
              </View>
            </Animated.View>
          </Animated.View>

          {/* Progress Dots */}
          <Animated.View
            entering={FadeInDown.delay(700).duration(600)}
            className="flex-row items-center mb-6"
          >
            <View className="w-2 h-2 bg-primary rounded-full mr-2" />
            <View className="w-8 h-2 bg-primary rounded-full mr-2" />
            <View className="w-2 h-2 bg-gray-600 rounded-full mr-2" />
            <View className="w-2 h-2 bg-gray-600 rounded-full mr-2" />
            <View className="w-2 h-2 bg-gray-600 rounded-full mr-2" />
            <View className="w-2 h-2 bg-gray-600 rounded-full" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).duration(600)}>
            <View className="flex-row gap-4">
              <Pressable
                onPress={() => router.push("/onboarding")}
                className="h-14 flex-1 rounded-2xl items-center justify-center bg-surface border border-primary"
              >
                <AppText variant="bold" size="lg" className="text-primary">Retour</AppText>
              </Pressable>

              <Pressable
                onPress={handleContinue}
                className={`h-14 flex-[2] rounded-2xl items-center justify-center ${
                  isValidName ? "bg-primary" : "bg-surface"
                }`}
                disabled={!isValidName}
              >
                <AppText variant="bold" size="lg"
                  className={`${
                    isValidName ? "text-white" : "text-gray-500"
                  }`}
                >
                  Continuer
                </AppText>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
