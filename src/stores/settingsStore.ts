import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';

interface SettingsState extends AppSettings {
  setTheme: (theme: string) => void;
  setPrimaryTheme: (primaryTheme: AppSettings['primaryTheme']) => void;
  setNotifications: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'purple',
      primaryTheme: 'dark',
      notifications: false,
      setTheme: (theme) => set({ theme }),
      setPrimaryTheme: (primaryTheme) => set({ primaryTheme }),
      setNotifications: (notifications) => set({ notifications }),
    }),
    {
      name: 'challenge-forge-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
