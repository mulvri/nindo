import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#0A0A0A" },
      }}
    >
      <Stack.Screen name="index" options={{ animation: "none" }} />
      <Stack.Screen name="name" />
      <Stack.Screen name="animes" />
      <Stack.Screen name="moods" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="permissions" />
    </Stack>
  );
}
