import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { usePhotosContext } from '@/context/photos-context';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

const SUGGESTIONS = [
  'Gym / Fitness',
  'Hair Growth',
  'Skin Care',
  'Weight',
  'Pet',
  'Garden',
  'Running',
  'Body Transformation',
  'Diet / Nutrition',
  'Posture',
];

export default function Onboarding() {
  const { addCategory } = usePhotosContext();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);

  const colors = {
    background: isDark ? '#111' : '#f5f5f5',
    card: isDark ? '#1e1e1e' : '#fff',
    text: isDark ? '#f0f0f0' : '#1a1a1a',
    subtext: isDark ? '#999' : '#666',
    border: isDark ? '#2a2a2a' : '#e5e5e5',
    chip: isDark ? '#2a2a2a' : '#efefef',
    chipText: isDark ? '#e0e0e0' : '#333',
    input: isDark ? '#1e1e1e' : '#fff',
    tint: '#007AFF',
  };

  async function startTracking(name: string) {
    const trimmed = name.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    try {
      await addCategory(trimmed);
      router.navigate('/(tabs)/add');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <MaterialIcons name="photo-camera" size={56} color={colors.tint} />
          <Text style={[styles.title, { color: colors.text }]}>What are you tracking?</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Pick a category to get started — or type your own below.
          </Text>
        </View>

        <View style={styles.chips}>
          {SUGGESTIONS.map((label) => (
            <Pressable
              key={label}
              style={({ pressed }) => [
                styles.chip,
                { backgroundColor: colors.chip, borderColor: colors.border },
                pressed && styles.chipPressed,
              ]}
              onPress={() => startTracking(label)}
              disabled={loading}
            >
              <Text style={[styles.chipText, { color: colors.chipText }]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerLabel, { color: colors.subtext }]}>or type your own</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <View style={[styles.inputRow, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="e.g. Beard Growth…"
            placeholderTextColor={colors.subtext}
            value={customName}
            onChangeText={setCustomName}
            returnKeyType="go"
            onSubmitEditing={() => startTracking(customName)}
          />
          <Pressable
            style={[
              styles.goButton,
              { backgroundColor: colors.tint },
              !customName.trim() && styles.goButtonDisabled,
            ]}
            onPress={() => startTracking(customName)}
            disabled={!customName.trim() || loading}
          >
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipPressed: {
    opacity: 0.6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  goButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goButtonDisabled: {
    opacity: 0.35,
  },
});
