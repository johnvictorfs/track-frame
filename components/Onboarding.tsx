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

import CategoryIconPicker from '@/components/CategoryIconPicker';
import { CATEGORY_SUGGESTIONS } from '@/constants/category-suggestions';
import { usePhotosContext } from '@/context/photos-context';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

export default function Onboarding() {
  const { addCategory } = usePhotosContext();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const [customName, setCustomName] = useState('');
  const [customIcon, setCustomIcon] = useState<string | undefined>(undefined);
  const [showIconPicker, setShowIconPicker] = useState(false);
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

  async function startTracking(name: string, icon?: string) {
    const trimmed = name.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    try {
      await addCategory(trimmed, icon);
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
          {CATEGORY_SUGGESTIONS.map(({ name, icon }) => (
            <Pressable
              key={name}
              style={({ pressed }) => [
                styles.chip,
                { backgroundColor: colors.chip, borderColor: colors.border },
                pressed && styles.chipPressed,
              ]}
              onPress={() => startTracking(name, icon)}
              disabled={loading}
            >
              <MaterialIcons name={icon as any} size={15} color={colors.chipText} />
              <Text style={[styles.chipText, { color: colors.chipText }]}>{name}</Text>
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
            <Pressable
              style={[
                styles.iconBtn,
                {
                  borderColor: showIconPicker || customIcon ? colors.tint : colors.border,
                  backgroundColor: showIconPicker || customIcon ? colors.tint + '18' : 'transparent',
                },
              ]}
              onPress={() => setShowIconPicker((v) => !v)}
            >
              <MaterialIcons
                name={customIcon ? (customIcon as any) : 'emoji-emotions'}
                size={18}
                color={showIconPicker || customIcon ? colors.tint : colors.subtext}
              />
            </Pressable>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g. Beard Growth…"
              placeholderTextColor={colors.subtext}
              value={customName}
              onChangeText={setCustomName}
              returnKeyType="go"
              onSubmitEditing={() => startTracking(customName, customIcon)}
            />
            <Pressable
              style={[
                styles.goButton,
                { backgroundColor: colors.tint },
                !customName.trim() && styles.goButtonDisabled,
              ]}
              onPress={() => startTracking(customName, customIcon)}
              disabled={!customName.trim() || loading}
            >
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </Pressable>
          </View>

          {showIconPicker && (
            <View style={[styles.pickerDivider, { borderTopColor: colors.border }]}>
              <CategoryIconPicker
                value={customIcon}
                onChange={setCustomIcon}
                tint={colors.tint}
                isDark={isDark}
              />
            </View>
          )}
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
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
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
  pickerDivider: {
    borderTopWidth: 1,
  },
});
