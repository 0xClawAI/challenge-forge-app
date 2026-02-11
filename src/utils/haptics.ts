import { Platform } from 'react-native';

// Web-safe haptics wrapper — no-ops on web
const isNative = Platform.OS !== 'web';

let HapticsModule: typeof import('expo-haptics') | null = null;

if (isNative) {
  HapticsModule = require('expo-haptics');
}

export const ImpactFeedbackStyle = {
  Light: 'light' as const,
  Medium: 'medium' as const,
  Heavy: 'heavy' as const,
};

export const NotificationFeedbackType = {
  Success: 'success' as const,
  Warning: 'warning' as const,
  Error: 'error' as const,
};

export async function impactAsync(style?: string) {
  if (HapticsModule) {
    try { return await HapticsModule.impactAsync(style as any); } catch {}
  }
}

export async function notificationAsync(type?: string) {
  if (HapticsModule) {
    try { return await HapticsModule.notificationAsync(type as any); } catch {}
  }
}

export async function selectionAsync() {
  if (HapticsModule) {
    try { return await HapticsModule.selectionAsync(); } catch {}
  }
}
