import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePhotosContext } from '@/context/photos-context';
import { useTheme } from '@/hooks/use-theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_SIZE = (SCREEN_WIDTH - 48) / 2;

export default function CategoryScreen() {
  const { id: paramId } = useLocalSearchParams<{ id: string }>();
  // Stabilise the id via a ref so it keeps its value during the pop animation.
  // expo-router clears useLocalSearchParams before the screen unmounts, which
  // triggers the "not found" early-return and wipes the screen content mid-slide.
  const idRef = useRef(paramId ?? '');
  if (paramId) idRef.current = paramId;
  const id = idRef.current;
  const { getCategoryById, getPhotosByCategory, addPhoto, addPhotos, deleteCategory } = usePhotosContext();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const category = getCategoryById(id);
  const rawPhotos = getPhotosByCategory(id);
  const photos = [...rawPhotos].sort((a, b) => {
    const diff = new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime();
    return sortOrder === 'newest' ? diff : -diff;
  });

  function handleDeleteCategory() {
    Alert.alert(
      'Delete Category',
      `Delete "${category?.name}" and all its photos? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(id);
            router.back();
          },
        },
      ],
    );
  }

  function parseExifDate(raw?: string | null): string | undefined {
    if (!raw) return undefined;
    const normalized = raw.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  async function handleAddPhoto() {
    Alert.alert('Add Photo', 'Choose source', [
      {
        text: 'Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission required', 'Camera access is needed.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.9, exif: true });
          if (!result.canceled) {
            const a = result.assets[0];
            await addPhoto(a.uri, id, parseExifDate(a.exif?.DateTimeOriginal ?? a.exif?.DateTime));
          }
        },
      },
      {
        text: 'Library',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission required', 'Photo library access is needed.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            quality: 0.9,
            allowsMultipleSelection: true,
            exif: true,
          });
          if (!result.canceled) {
            await addPhotos(
              result.assets.map((a) => ({
                uri: a.uri,
                takenAt: parseExifDate(a.exif?.DateTimeOriginal ?? a.exif?.DateTime),
              })),
              id,
            );
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
          title: category.name,
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Pressable
                onPress={() => setSortOrder((o) => (o === 'newest' ? 'oldest' : 'newest'))}
                hitSlop={12}
              >
                <MaterialIcons
                  name={sortOrder === 'newest' ? 'arrow-downward' : 'arrow-upward'}
                  size={22}
                  color={colors.text}
                />
              </Pressable>
              <Pressable onPress={() => router.push(`/category-edit/${id}`)} hitSlop={12}>
                <MaterialIcons name="edit" size={22} color={colors.text} />
              </Pressable>
              <Pressable onPress={handleDeleteCategory} hitSlop={12}>
                <MaterialIcons name="delete-outline" size={24} color={colors.danger} />
              </Pressable>
            </View>
          ),
        }}
      />

      {photos.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="add-a-photo" size={72} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No photos yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
            Tap the + button to add your first photo to this category
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.photoItem}>
              <Pressable onPress={() => router.push(`/photo/${item.id}?categoryId=${id}`)}>
                <Image source={{ uri: item.uri }} style={styles.photo} contentFit="cover" />
                <Text style={[styles.photoDate, { color: colors.subtext }]}>
                  {formatDate(item.takenAt)}
                </Text>
              </Pressable>
            </View>
          )}
        />
      )}

      <View style={[styles.fabWrapper, { bottom: 28 + insets.bottom }]}>
        <Pressable
          style={[styles.fab, { backgroundColor: category.color }]}
          onPress={handleAddPhoto}
        >
          <MaterialIcons name="add" size={30} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    padding: 12,
    paddingBottom: 100,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  photoItem: {
    width: PHOTO_SIZE,
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 10,
  },
  photoDate: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  fabWrapper: {
    position: 'absolute',
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderRadius: 30,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
