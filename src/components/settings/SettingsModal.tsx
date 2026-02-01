import { AppText } from "@/src/components/ui/AppText";
import { THEMES } from "@/src/constants/themes";
import { useThemeStore } from "@/src/stores";
import React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  emoji?: string;
  children: React.ReactNode;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  title,
  emoji,
  children,
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const currentTheme = THEMES[theme] || THEMES.light;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 justify-end">
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 bg-black/70"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(350).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(300).easing(Easing.in(Easing.cubic))}
          className="bg-surface rounded-t-[32px] w-full"
          style={{
            maxHeight: "85%",
            marginBottom: -50,
            paddingBottom: Math.max(insets.bottom, 24) + 50,
          }}
        >
          <View className="w-12 h-1.5 bg-gray-600/30 rounded-full self-center mt-3 mb-6" />

          <View className="px-6">
            <View className="flex-row items-center mb-2">
              {emoji && <AppText className="text-3xl mr-3">{emoji}</AppText>}
              <AppText variant="black" size="2xl" className="text-foreground">
                {title}
              </AppText>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              className="mt-4"
              contentContainerStyle={{ paddingBottom: 20 }}
              nestedScrollEnabled
            >
              {children}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
