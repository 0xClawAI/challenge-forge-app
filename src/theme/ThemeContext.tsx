import React, { createContext, useContext, useMemo } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { ACCENT_THEMES, PRIMARY_THEMES, SEMANTIC_COLORS, AccentTheme, PrimaryTheme } from './colors';

export interface Theme {
  primary: PrimaryTheme;
  accent: AccentTheme;
  colors: typeof SEMANTIC_COLORS;
}

const ThemeContext = createContext<Theme>({
  primary: PRIMARY_THEMES.dark,
  accent: ACCENT_THEMES.purple,
  colors: SEMANTIC_COLORS,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme: accentKey, primaryTheme: primaryKey } = useSettingsStore();

  const value = useMemo<Theme>(() => ({
    primary: PRIMARY_THEMES[primaryKey] || PRIMARY_THEMES.dark,
    accent: ACCENT_THEMES[accentKey] || ACCENT_THEMES.purple,
    colors: SEMANTIC_COLORS,
  }), [accentKey, primaryKey]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
