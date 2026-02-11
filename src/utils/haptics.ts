import { Platform } from 'react-native';

// Web-safe haptics wrapper — no-ops on web
const isNative = Platform.OS !== 'web';

let HapticsModule: typeof import('expo-haptics') | null = null;

if (isNative) {
  HapticsModule = require('expo-haptics');
}

export const ImpactFeedbackStyle = {
  Light: 'Light' as const,
  Medium: 'Medium' as const,
  Heavy: 'Heavy' as const,
};

export const NotificationFeedbackType = {
  Success: 'Success' as const,
  Warning: 'Warning' as const,
  Error: 'Error' as const,
};

export async function impactAsync(style?: string) {
  if (HapticsModule) {
    return HapticsModule.impactAsync(style as any);
  }
}

export async function notificationAsync(type?: string) {
  if (HapticsModule) {
    return HapticsModule.notificationAsync(type as any);
  }
}

export async function selectionAsync() {
  if (HapticsModule) {
    return HapticsModule.selectionAsync();
  }
}
