import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryIconPicker from '@/components/CategoryIconPicker';
import { usePhotosContext } from '@/context/photos-context';
import { useTheme } from '@/hooks/use-theme';

export default function CategoryEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCategoryById, updateCategory } = usePhotosContext();
  const { colors } = useTheme();

  const category = getCategoryById(id);

  const [name, setName] = useState(category?.name ?? '');
  const [icon, setIcon] = useState<string | undefined>(category?.icon);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
    }
  }, [category?.id]);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter a category name.');
      return;
    }
    await updateCategory(id, { name: trimmed, icon });
    router.back();
  }

  if (!category) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, padding: 20 }}>Category not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom', 'left', 'right']}
    >
      <Stack.Screen
        options={{
          title: 'Edit Category',
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable onPress={handleSave} hitSlop={12}>
              <Text style={{ color: colors.tint, fontSize: 17, fontWeight: '600' }}>Save</Text>
            </Pressable>
          ),
        }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>Name</Text>
          <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.nameInput, { color: colors.text }]}
              value={name}
              onChangeText={setName}
              placeholder="Category name..."
              placeholderTextColor={colors.subtext}
              autoCorrect={false}
              returnKeyType="done"
            />
          </View>

          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>Icon (optional)</Text>
          <View style={[styles.iconCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.currentIcon}>
              {icon ? (
                <View style={[styles.iconPreview, { backgroundColor: category.color + '22' }]}>
                  <MaterialIcons name={icon as any} size={32} color={category.color} />
                </View>
              ) : (
                <View style={[styles.iconPreview, { backgroundColor: colors.border }]}>
                  <MaterialIcons name="block" size={32} color={colors.subtext} />
                </View>
              )}
              <Text style={[styles.currentIconLabel, { color: colors.subtext }]}>
                {icon ? 'Current icon' : 'No icon'}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <CategoryIconPicker
              value={icon}
              onChange={setIcon}
              tint={colors.tint}
            />
          </View>

          <Pressable
            style={[styles.saveButton, { backgroundColor: colors.tint }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  inputCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  nameInput: {
    fontSize: 17,
    padding: 16,
  },
  iconCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  currentIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  iconPreview: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentIconLabel: {
    fontSize: 15,
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
  saveButton: {
    margin: 16,
    marginTop: 24,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
