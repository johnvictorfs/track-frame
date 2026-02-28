import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
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

import { usePhotosContext } from '@/context/photos-context';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

export default function AddScreen() {
  const { categories, addCategory, addPhoto } = usePhotosContext();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [saving, setSaving] = useState(false);

  const colors = {
    background: isDark ? '#111' : '#f5f5f5',
    card: isDark ? '#1e1e1e' : '#fff',
    text: isDark ? '#f0f0f0' : '#1a1a1a',
    subtext: isDark ? '#999' : '#666',
    border: isDark ? '#2a2a2a' : '#e5e5e5',
    input: isDark ? '#2a2a2a' : '#f0f0f0',
    tint: '#007AFF',
  };

  async function handleCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      quality: 0.9,
    });
    if (!result.canceled) {
      setSelectedUri(result.assets[0].uri);
    }
  }

  async function handleLibrary() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Photo library access is needed to select photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.9,
    });
    if (!result.canceled) {
      setSelectedUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (!selectedUri) return;

    setSaving(true);
    try {
      let categoryId = selectedCategoryId;

      if (!categoryId && showNewCategory && newCategoryName.trim()) {
        const category = await addCategory(newCategoryName.trim());
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
  }

  const canSave =
    selectedUri != null &&
    (selectedCategoryId != null || (showNewCategory && newCategoryName.trim().length > 0));

  if (!selectedUri) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Add Photo</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          Choose a photo to add to your progress tracking
        </Text>
        <View style={styles.pickRow}>
          <Pressable
            style={[styles.pickButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleCamera}
          >
            <MaterialIcons name="camera-alt" size={44} color={colors.tint} />
            <Text style={[styles.pickButtonText, { color: colors.text }]}>Camera</Text>
            <Text style={[styles.pickButtonSub, { color: colors.subtext }]}>Take a new photo</Text>
          </Pressable>
          <Pressable
            style={[styles.pickButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleLibrary}
          >
            <MaterialIcons name="photo-library" size={44} color={colors.tint} />
            <Text style={[styles.pickButtonText, { color: colors.text }]}>Library</Text>
            <Text style={[styles.pickButtonSub, { color: colors.subtext }]}>
              Choose existing photo
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedUri }} style={styles.preview} contentFit="cover" />
            <Pressable style={styles.changePhotoBtn} onPress={reset}>
              <MaterialIcons name="close" size={18} color="#fff" />
            </Pressable>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Category</Text>

          <View style={[styles.categoryList, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {categories.map((cat, index) => (
              <View key={cat.id}>
                {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <Pressable
                  style={styles.categoryItem}
                  onPress={() => {
                    setSelectedCategoryId(cat.id);
                    setShowNewCategory(false);
                  }}
                >
                  <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                  <Text style={[styles.categoryItemText, { color: colors.text }]}>{cat.name}</Text>
                  {selectedCategoryId === cat.id && (
                    <MaterialIcons name="check-circle" size={22} color={colors.tint} />
                  )}
                </Pressable>
              </View>
            ))}

            {categories.length > 0 && (
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            )}

            {showNewCategory ? (
              <View style={styles.newCategoryRow}>
                <MaterialIcons name="label" size={20} color={colors.tint} style={{ marginLeft: 16 }} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Category name..."
                  placeholderTextColor={colors.subtext}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  autoFocus
                  returnKeyType="done"
                />
                <Pressable onPress={() => { setShowNewCategory(false); setNewCategoryName(''); }} style={{ paddingRight: 16 }}>
                  <MaterialIcons name="close" size={20} color={colors.subtext} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.newCategoryBtn}
                onPress={() => {
                  setShowNewCategory(true);
                  setSelectedCategoryId(null);
                }}
              >
                <MaterialIcons name="add" size={22} color={colors.tint} />
                <Text style={[styles.newCategoryText, { color: colors.tint }]}>New Category</Text>
              </Pressable>
            )}
          </View>

          <Pressable
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
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
  subtitle: {
    fontSize: 15,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 32,
    lineHeight: 22,
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
    paddingVertical: 28,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  pickButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickButtonSub: {
    fontSize: 12,
    textAlign: 'center',
  },
  previewContainer: {
    margin: 16,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
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
  saveButton: {
    margin: 16,
    marginTop: 20,
    backgroundColor: '#007AFF',
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
