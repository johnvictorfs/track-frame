import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

type SettingsContextType = {
  themePreference: ThemePreference;
  effectiveColorScheme: 'light' | 'dark';
  setThemePreference: (pref: ThemePreference) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

const SETTINGS_KEY = 'TF_SETTINGS';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then((raw) => {
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.themePreference) setThemePreferenceState(saved.themePreference);
      }
    });
  }, []);

  const setThemePreference = useCallback(async (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ themePreference: pref }));
  }, []);

  const effectiveColorScheme: 'light' | 'dark' =
    themePreference === 'system' ? (systemScheme ?? 'light') : themePreference;

  return (
    <SettingsContext.Provider value={{ themePreference, effectiveColorScheme, setThemePreference }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
