import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  testNotificationPermissions,
  testRemindersConfiguration,
  testScheduledNotifications,
  testShouldAskMood,
  testSendImmediateNotification,
  testScheduledNotification5Seconds,
  testFullSync,
  runAllDiagnostics,
  DebugResult
} from "@/src/utils/debug/notificationDebug";

interface TestConfig {
  name: string;
  description: string;
  fn: () => Promise<DebugResult>;
  icon: keyof typeof Ionicons.glyphMap;
  sendsNotification?: boolean;
}

const tests: TestConfig[] = [
  {
    name: "Permissions",
    description: "Verifie si l'app peut envoyer des notifications",
    fn: testNotificationPermissions,
    icon: "shield-checkmark-outline"
  },
  {
    name: "Config Rappels",
    description: "Verifie que les rappels existent en base",
    fn: testRemindersConfiguration,
    icon: "settings-outline"
  },
  {
    name: "Notifs Programmees",
    description: "Liste les notifications programmees",
    fn: testScheduledNotifications,
    icon: "calendar-outline"
  },
  {
    name: "Should Ask Mood",
    description: "Teste la logique d'affichage du modal",
    fn: testShouldAskMood,
    icon: "help-circle-outline"
  },
  {
    name: "Notif Immediate",
    description: "Envoie une notification de test",
    fn: testSendImmediateNotification,
    icon: "paper-plane-outline",
    sendsNotification: true
  },
  {
    name: "Notif 5 secondes",
    description: "Programme une notification dans 5s",
    fn: testScheduledNotification5Seconds,
    icon: "time-outline",
    sendsNotification: true
  },
  {
    name: "Full Sync",
    description: "Resynchronise toutes les notifications",
    fn: testFullSync,
    icon: "sync-outline"
  }
];

export function NotificationDebugPanel() {
  const [results, setResults] = useState<Record<string, DebugResult> | null>(null);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async (test: TestConfig) => {
    setLoading(true);
    setCurrentTest(test.name);

    try {
      const result = await test.fn();
      setResults(prev => ({
        ...prev,
        [test.name]: result
      }));

      Alert.alert(
        result.success ? "Succes" : "Probleme detecte",
        result.message || JSON.stringify(result, null, 2)
      );
    } catch (error) {
      Alert.alert("Erreur", String(error));
    } finally {
      setLoading(false);
      setCurrentTest(null);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setCurrentTest("Tous les diagnostics");

    try {
      const allResults = await runAllDiagnostics();
      setResults(allResults);

      const issues = Object.entries(allResults)
        .filter(([_, r]) => !r.success)
        .map(([name, r]) => `${name}: ${r.message}`);

      Alert.alert(
        issues.length === 0 ? "Tout est OK" : "Problemes detectes",
        issues.length === 0
          ? "Tous les tests ont reussi!"
          : issues.join("\n\n")
      );
    } catch (error) {
      Alert.alert("Erreur", String(error));
    } finally {
      setLoading(false);
      setCurrentTest(null);
    }
  };

  const getResultColor = (testName: string): string => {
    if (!results?.[testName]) return "bg-zinc-800";
    return results[testName].success ? "bg-green-900/50" : "bg-red-900/50";
  };

  const getResultIcon = (testName: string): keyof typeof Ionicons.glyphMap => {
    if (!results?.[testName]) return "ellipse-outline";
    return results[testName].success ? "checkmark-circle" : "alert-circle";
  };

  const getResultIconColor = (testName: string): string => {
    if (!results?.[testName]) return "#666";
    return results[testName].success ? "#22c55e" : "#ef4444";
  };

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-white mb-2">
            Debug Notifications
          </Text>
          <Text className="text-zinc-400">
            Lance ces tests pour diagnostiquer les problemes de notifications et rappels.
          </Text>
        </View>

        {/* Run All Button */}
        <TouchableOpacity
          onPress={runAllTests}
          disabled={loading}
          className={`p-4 rounded-xl mb-6 flex-row items-center justify-center ${
            loading ? "bg-orange-900/50" : "bg-orange-500"
          }`}
        >
          {loading && currentTest === "Tous les diagnostics" ? (
            <ActivityIndicator color="white" className="mr-2" />
          ) : (
            <Ionicons name="flash" size={20} color="white" />
          )}
          <Text className="text-white font-bold ml-2">
            {loading && currentTest === "Tous les diagnostics"
              ? "Diagnostic en cours..."
              : "Lancer tous les diagnostics"}
          </Text>
        </TouchableOpacity>

        {/* Individual Tests */}
        <Text className="text-lg font-semibold text-white mb-3">
          Tests individuels
        </Text>

        {tests.map((test, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => runTest(test)}
            disabled={loading}
            className={`p-4 rounded-xl mb-2 flex-row items-center ${getResultColor(test.name)}`}
          >
            <View className="w-10 h-10 rounded-full bg-zinc-700 items-center justify-center mr-3">
              <Ionicons name={test.icon} size={20} color="#fff" />
            </View>

            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-white font-medium">{test.name}</Text>
                {test.sendsNotification && (
                  <View className="ml-2 px-2 py-0.5 bg-yellow-900/50 rounded">
                    <Text className="text-yellow-400 text-xs">Envoie notif</Text>
                  </View>
                )}
              </View>
              <Text className="text-zinc-400 text-sm">{test.description}</Text>
            </View>

            {loading && currentTest === test.name ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons
                name={getResultIcon(test.name)}
                size={24}
                color={getResultIconColor(test.name)}
              />
            )}
          </TouchableOpacity>
        ))}

        {/* Results Panel */}
        {results && Object.keys(results).length > 0 && (
          <View className="mt-6">
            <Text className="text-lg font-semibold text-white mb-3">
              Resultats detailles
            </Text>
            <View className="bg-zinc-900 rounded-xl p-4">
              <ScrollView horizontal>
                <Text className="text-green-400 font-mono text-xs">
                  {JSON.stringify(results, null, 2)}
                </Text>
              </ScrollView>
            </View>
          </View>
        )}

        {/* Help Section */}
        <View className="mt-6 p-4 bg-zinc-900 rounded-xl">
          <Text className="text-white font-medium mb-2">Comment interpreter:</Text>
          <View className="flex-row items-center mb-1">
            <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
            <Text className="text-zinc-400 text-sm ml-2">Test reussi</Text>
          </View>
          <View className="flex-row items-center mb-1">
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text className="text-zinc-400 text-sm ml-2">Probleme detecte</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="ellipse-outline" size={16} color="#666" />
            <Text className="text-zinc-400 text-sm ml-2">Pas encore teste</Text>
          </View>
        </View>

        {/* Spacing at bottom */}
        <View className="h-20" />
      </View>
    </ScrollView>
  );
}
