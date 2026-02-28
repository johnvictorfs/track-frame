import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { PhotosProvider } from '@/context/photos-context';
import { SettingsProvider, useSettings } from '@/context/settings-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutInner() {
  const { effectiveColorScheme } = useSettings();

  return (
    <ThemeProvider value={effectiveColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
