import { requireNativeModule } from 'expo-modules-core';

// Fallback module for when native module is not available (e.g., Expo Go)
const fallbackModule = {
  updateWidgetData: async (_data: string) => false,
  startBackgroundUpdates: async () => false,
  stopBackgroundUpdates: async () => false,
  isPinSupported: async () => false,
  requestPinWidget: async () => false,
};

let NindoWidgetModule: typeof fallbackModule;

try {
  NindoWidgetModule = requireNativeModule('NindoWidget');
} catch (error) {
  console.warn('NindoWidget native module not available, using fallback');
  NindoWidgetModule = fallbackModule;
}

export default NindoWidgetModule;
