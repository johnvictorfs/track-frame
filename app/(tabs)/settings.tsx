import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemePreference, useSettings } from '@/context/settings-context';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

type ThemeOption = { value: ThemePreference; label: string; icon: string };

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'system', label: 'System', icon: 'brightness-auto' },
  { value: 'light', label: 'Light', icon: 'light-mode' },
  { value: 'dark', label: 'Dark', icon: 'dark-mode' },
];

export default function SettingsScreen() {
  const { themePreference, setThemePreference } = useSettings();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#111' : '#f5f5f5',
    card: isDark ? '#1e1e1e' : '#fff',
    text: isDark ? '#f0f0f0' : '#1a1a1a',
    subtext: isDark ? '#999' : '#666',
    border: isDark ? '#2a2a2a' : '#e5e5e5',
    tint: '#007AFF',
    selectedBg: isDark ? '#1a2d3d' : '#e8f3ff',
    selectedBorder: '#007AFF',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.subtext }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>Theme</Text>
          <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>
            Choose how TrackFrame looks
          </Text>
          <View style={styles.optionsRow}>
            {THEME_OPTIONS.map((opt) => {
              const selected = themePreference === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={[
                    styles.option,
                    { borderColor: selected ? colors.selectedBorder : colors.border },
                    selected && { backgroundColor: colors.selectedBg },
                  ]}
                  onPress={() => setThemePreference(opt.value)}
                >
                  <MaterialIcons
                    name={opt.icon as any}
                    size={24}
                    color={selected ? colors.tint : colors.subtext}
                  />
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: selected ? colors.tint : colors.subtext },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {selected && (
                    <MaterialIcons name="check-circle" size={16} color={colors.tint} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  section: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
});
