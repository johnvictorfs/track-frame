import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { darkColors, lightColors } from '@/constants/theme';
import { PhotosProvider } from '@/context/photos-context';
import { SettingsProvider, useSettings } from '@/context/settings-context';

const LightNavTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightColors.tint,
    background: lightColors.background,
    card: lightColors.header,
    text: lightColors.text,
    border: lightColors.border,
  },
};

const DarkNavTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: darkColors.tint,
    background: darkColors.background,
    card: darkColors.header,
    text: darkColors.text,
    border: darkColors.border,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutInner() {
  const { effectiveColorScheme } = useSettings();

  return (
    <ThemeProvider value={effectiveColorScheme === 'dark' ? DarkNavTheme : LightNavTheme}>
      <PhotosProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="category/[id]" options={{ headerShown: true }} />
          <Stack.Screen name="category-edit/[id]" options={{ headerShown: true }} />
          <Stack.Screen name="photo/[id]" options={{ headerShown: true }} />
        </Stack>
        <StatusBar style={effectiveColorScheme === 'dark' ? 'light' : 'dark'} />
      </PhotosProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <RootLayoutInner />
    </SettingsProvider>
  );
}
