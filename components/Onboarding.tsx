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

import { CATEGORY_SUGGESTIONS } from '@/constants/category-suggestions';
import { usePhotosContext } from '@/context/photos-context';
import { useTheme } from '@/hooks/use-theme';

export default function Onboarding() {
  const { addCategory } = usePhotosContext();
  const { colors } = useTheme();

  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);

  async function startTracking(name: string) {
    const trimmed = name.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    try {
      const category = await addCategory(trimmed);
      router.navigate({ pathname: '/(tabs)/add', params: { categoryId: category.id } });
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
          {CATEGORY_SUGGESTIONS.map(({ name, icon }) => (
            <Pressable
              key={name}
              style={({ pressed }) => [
                styles.chip,
                { backgroundColor: colors.input, borderColor: colors.border },
                pressed && styles.chipPressed,
              ]}
              onPress={() => startTracking(name)}
              disabled={loading}
            >
              <MaterialIcons name={icon as any} size={15} color={colors.text} />
              <Text style={[styles.chipText, { color: colors.text }]}>{name}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerLabel, { color: colors.subtext }]}>or type your own</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <View style={[styles.inputCard, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <View style={styles.inputRow}>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
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
  inputCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
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
