import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { CATEGORY_SUGGESTIONS } from '@/constants/category-suggestions';
import { usePhotosContext } from '@/context/photos-context';
import { useTheme } from '@/hooks/use-theme';

export default function AddScreen() {
  const { categories, addCategory, addPhoto } = usePhotosContext();
  const { colors } = useTheme();
  const { categoryId: preselectedCategoryId } = useLocalSearchParams<{ categoryId?: string }>();

  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preselectedCategoryId) {
      setSelectedCategoryId(preselectedCategoryId);
      setShowNewCategory(false);
    }
  }, [preselectedCategoryId]);

  async function handleCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.9 });
    if (!result.canceled) setSelectedUri(result.assets[0].uri);
  }

  async function handleLibrary() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Photo library access is needed to select photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.9 });
    if (!result.canceled) setSelectedUri(result.assets[0].uri);
  }

  async function handleSave() {
    if (!selectedUri) return;
    setSaving(true);
    try {
      let categoryId = selectedCategoryId;
      if (!categoryId && showNewCategory && newCategoryName.trim()) {
        const category = await addCategory(newCategoryName.trim(), newCategoryIcon);
        categoryId = category.id;
      }
      if (!categoryId) {
        Alert.alert('Select a category', 'Please select or create a category first.');
        setSaving(false);
        return;
      }
      await addPhoto(selectedUri, categoryId);
      reset();
      router.push(`/category/${categoryId}`);
    } catch {
      Alert.alert('Error', 'Failed to save photo. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setSelectedUri(null);
    setSelectedCategoryId(null);
    setShowNewCategory(false);
    setNewCategoryName('');
    setNewCategoryIcon(undefined);
  }

  const canSave =
    selectedUri != null &&
    (selectedCategoryId != null || (showNewCategory && newCategoryName.trim().length > 0));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(300)}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={[styles.title, { color: colors.text }]}>Add Photo</Text>

            {/* ── Category ── */}
            <Text style={[styles.sectionTitle, { color: colors.text, paddingTop: 8 }]}>Category</Text>
            <View style={[styles.categoryList, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {categories.map((cat, index) => (
                <View key={cat.id}>
                  {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                  <Pressable
                    style={styles.categoryItem}
                    onPress={() => { setSelectedCategoryId(cat.id); setShowNewCategory(false); }}
                  >
                    <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                    <Text style={[styles.categoryItemText, { color: colors.text }]}>{cat.name}</Text>
                    {selectedCategoryId === cat.id && (
                      <MaterialIcons name="check-circle" size={22} color={colors.tint} />
                    )}
                  </Pressable>
                </View>
              ))}

              {categories.length > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}

              {showNewCategory ? (
                <View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.suggestionsRow}
                  >
                    {CATEGORY_SUGGESTIONS.map((s) => (
                      <Pressable
                        key={s.name}
                        style={[
                          styles.suggestionChip,
                          { borderColor: colors.border, backgroundColor: colors.card },
                          newCategoryName === s.name && newCategoryIcon === s.icon && {
                            borderColor: colors.tint,
                            backgroundColor: colors.tintSubtle,
                          },
                        ]}
                        onPress={() => { setNewCategoryName(s.name); setNewCategoryIcon(s.icon); }}
                      >
                        <MaterialIcons
                          name={s.icon as any}
                          size={16}
                          color={newCategoryName === s.name && newCategoryIcon === s.icon ? colors.tint : colors.subtext}
                        />
                        <Text
                          style={[
                            styles.suggestionText,
                            { color: newCategoryName === s.name && newCategoryIcon === s.icon ? colors.tint : colors.subtext },
                          ]}
                        >
                          {s.name}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <View style={[styles.newCategoryRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <MaterialIcons
                      name={(newCategoryIcon as any) ?? 'label'}
                      size={20}
                      color={colors.tint}
                      style={{ marginLeft: 16 }}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Category name..."
                      placeholderTextColor={colors.subtext}
                      value={newCategoryName}
                      onChangeText={setNewCategoryName}
                      autoFocus
                      returnKeyType="done"
                    />
                    <Pressable
                      onPress={() => { setShowNewCategory(false); setNewCategoryName(''); setNewCategoryIcon(undefined); }}
                      style={{ paddingRight: 16 }}
                    >
                      <MaterialIcons name="close" size={20} color={colors.subtext} />
                    </Pressable>
                  </View>

                  <View style={[styles.iconPickerLabel, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <Text style={[styles.iconPickerLabelText, { color: colors.subtext }]}>Icon (optional)</Text>
                  </View>
                  <CategoryIconPicker value={newCategoryIcon} onChange={setNewCategoryIcon} tint={colors.tint} />
                </View>
              ) : (
                <Pressable
                  style={styles.newCategoryBtn}
                  onPress={() => { setShowNewCategory(true); setSelectedCategoryId(null); }}
                >
                  <MaterialIcons name="add" size={22} color={colors.tint} />
                  <Text style={[styles.newCategoryText, { color: colors.tint }]}>New Category</Text>
                </Pressable>
              )}
            </View>

            {/* ── Photo ── */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Photo</Text>
            {selectedUri ? (
              <Animated.View entering={FadeIn.duration(350)} style={styles.previewContainer}>
                <Image source={{ uri: selectedUri }} style={styles.preview} contentFit="cover" />
                <Pressable style={styles.changePhotoBtn} onPress={() => setSelectedUri(null)}>
                  <MaterialIcons name="close" size={18} color="#fff" />
                </Pressable>
              </Animated.View>
            ) : (
              <View style={styles.pickRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.pickButton,
                    { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
                  ]}
                  onPress={handleCamera}
                >
                  <MaterialIcons name="camera-alt" size={36} color={colors.tint} />
                  <Text style={[styles.pickButtonText, { color: colors.text }]}>Camera</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.pickButton,
                    { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
                  ]}
                  onPress={handleLibrary}
                >
                  <MaterialIcons name="photo-library" size={36} color={colors.tint} />
                  <Text style={[styles.pickButtonText, { color: colors.text }]}>Library</Text>
                </Pressable>
              </View>
            )}

            {/* ── Save ── */}
            <Pressable
              style={[
                styles.saveButton,
                { backgroundColor: colors.tint },
                !canSave && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={saving || !canSave}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Photo</Text>
              )}
            </Pressable>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 10,
  },
  categoryList: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryItemText: {
    flex: 1,
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
  newCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  newCategoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  newCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 6,
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  iconPickerLabel: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 2,
  },
  iconPickerLabelText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  pickButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  pickButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  previewContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  changePhotoBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
  },
  saveButton: {
    margin: 16,
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
