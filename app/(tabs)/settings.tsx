import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabScreenWrapper from '@/components/tab-screen-wrapper';

import { ThemePreference, useSettings } from '@/context/settings-context';
import { useTheme } from '@/hooks/use-theme';

type ThemeOption = { value: ThemePreference; label: string; icon: string };

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'system', label: 'System', icon: 'brightness-auto' },
  { value: 'light', label: 'Light', icon: 'light-mode' },
  { value: 'dark', label: 'Dark', icon: 'dark-mode' },
];

export default function SettingsScreen() {
  const { themePreference, setThemePreference } = useSettings();
  const { colors } = useTheme();

  return (
    <TabScreenWrapper>
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
                    style={({ pressed }) => [
                      styles.option,
                      { borderColor: selected ? colors.tint : colors.border, opacity: pressed ? 0.75 : 1 },
                      selected && { backgroundColor: colors.tintSubtle },
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

        <View style={[styles.section, { marginTop: 24 }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>ABOUT</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.6 : 1 }]}
              onPress={() => Linking.openURL('https://github.com/johnvictorfs/track-frame/')}
            >
              <MaterialIcons name="code" size={20} color={colors.tint} />
              <Text style={[styles.linkText, { color: colors.tint }]}>Source Code</Text>
              <MaterialIcons name="open-in-new" size={16} color={colors.subtext} style={{ marginLeft: 'auto' }} />
            </Pressable>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Pressable
              style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.6 : 1 }]}
              onPress={() => Linking.openURL('https://github.com/johnvictorfs/track-frame/issues/new')}
            >
              <MaterialIcons name="bug-report" size={20} color={colors.tint} />
              <Text style={[styles.linkText, { color: colors.tint }]}>Report an Issue</Text>
              <MaterialIcons name="open-in-new" size={16} color={colors.subtext} style={{ marginLeft: 'auto' }} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </TabScreenWrapper>
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
  divider: {
    height: 1,
    marginVertical: 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
