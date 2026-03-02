import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState, useCallback } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  InteractionManager,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import AppModal, { ModalConfig } from '@/components/AppModal';
import DatePickerModal from '@/components/DatePickerModal';
import { usePhotosContext } from '@/context/photos-context';
import { useSettings } from '@/context/settings-context';
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
  const { getCategoryById, getPhotosByCategory, addPhoto, addPhotos, deleteCategory, deletePhotos } = usePhotosContext();
  const { colors } = useTheme();
  const { sortOrder, setSortOrder } = useSettings();
  const insets = useSafeAreaInsets();
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const [pendingAssets, setPendingAssets] = useState<{ uri: string; takenAt?: string }[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSharing, setIsSharing] = useState(false);

  const category = getCategoryById(id);
  const rawPhotos = getPhotosByCategory(id);
  const photos = [...rawPhotos].sort((a, b) => {
    const diff = new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime();
    return sortOrder === 'newest' ? diff : -diff;
  });

  function handleDeleteCategory() {
    setModal({
      title: 'Remove Category',
      message: `Remove "${category?.name}"? Photos won't be deleted, just untracked.`,
      buttons: [
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
    });
  }

  function enterSelectionMode(photoId: string) {
    setSelectionMode(true);
    setSelectedIds(new Set([photoId]));
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  function togglePhotoSelection(photoId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      if (next.size === 0) setSelectionMode(false);
      return next;
    });
  }

  async function handleBatchShare() {
    const uris = photos.filter((p) => selectedIds.has(p.id)).map((p) => p.uri);
    if (uris.length === 0) return;
    setIsSharing(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const RNShare = (require('react-native-share') as typeof import('react-native-share')).default;
      await RNShare.open({ urls: uris, type: 'image/*', failOnCancel: false });
    } catch (e: any) {
      if (String(e).includes('RNShare')) {
        Alert.alert(
          'Dev Build Required',
          'Sharing multiple photos at once requires a custom dev build. Run `npx expo run:android` or `npx expo run:ios` instead of Expo Go.',
        );
      }
    } finally {
      setIsSharing(false);
    }
  }

  function handleBatchDelete() {
    const count = selectedIds.size;
    setModal({
      title: `Remove ${count} Photo${count !== 1 ? 's' : ''}`,
      message: `Remove ${count} selected photo${count !== 1 ? 's' : ''} from tracking? Your original files won't be affected.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePhotos(Array.from(selectedIds));
            exitSelectionMode();
          },
        },
      ],
    });
  }

  function parseExifDate(raw?: string | null): string | undefined {
    if (!raw) return undefined;
    const normalized = raw.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  async function saveAssets(assets: { uri: string; takenAt?: string }[], date: Date) {
    const mapped = assets.map((a) => ({ uri: a.uri, takenAt: a.takenAt ?? date.toISOString() }));
    await addPhotos(mapped, id);
  }

  async function handlePicked(assets: { uri: string; takenAt?: string }[]) {
    if (assets.some((a) => !a.takenAt)) {
      setPendingAssets(assets);
      // Wait for the image picker's native dismiss animation to fully complete
      // before presenting the date picker modal, otherwise iOS silently drops it.
      InteractionManager.runAfterInteractions(() => setShowDatePicker(true));
    } else {
      await saveAssets(assets, new Date());
    }
  }

  async function handleAddPhoto() {
    setModal({
      title: 'Add Photo',
      buttons: [
        {
          text: 'Camera',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              setModal({ title: 'Permission Required', message: 'Camera access is needed.' });
              return;
            }
            const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.9, exif: true });
            if (!result.canceled) {
              const a = result.assets[0];
              await handlePicked([{ uri: a.uri, takenAt: parseExifDate(a.exif?.DateTimeOriginal) }]);
            }
          },
        },
        {
          text: 'Library',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              setModal({ title: 'Permission Required', message: 'Photo library access is needed.' });
              return;
            }
            let result;
            try {
              result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                quality: 0.9,
                allowsMultipleSelection: true,
                exif: true,
              });
            } catch {
              // EXIF reading fails for cloud-only Google Photos URIs on Android — retry without it
              try {
                result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: 'images',
                  quality: 0.9,
                  allowsMultipleSelection: true,
                  exif: false,
                });
              } catch {
                setModal({ title: 'Error', message: 'Could not load the selected photos. Try selecting from the main library view instead of an album.' });
                return;
              }
            }
            if (!result.canceled) {
              await handlePicked(
                result.assets.map((a) => ({
                  uri: a.uri,
                  takenAt: parseExifDate(a.exif?.DateTimeOriginal),
                })),
              );
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  const toggleSort = useCallback(() => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  }, [sortOrder, setSortOrder]);

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
          title: selectionMode ? `${selectedIds.size} selected` : category.name,
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerLeft: selectionMode
            ? () => (
                <Pressable onPress={exitSelectionMode} hitSlop={12} style={{ marginRight: 8 }}>
                  <MaterialIcons name="close" size={24} color={colors.text} />
                </Pressable>
              )
            : undefined,
          headerRight: selectionMode
            ? () => (
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <Pressable
                    onPress={handleBatchShare}
                    hitSlop={12}
                    disabled={selectedIds.size === 0 || isSharing}
                    style={{ opacity: selectedIds.size === 0 || isSharing ? 0.4 : 1 }}
                  >
                    <MaterialIcons name="share" size={22} color={colors.text} />
                  </Pressable>
                  <Pressable
                    onPress={handleBatchDelete}
                    hitSlop={12}
                    disabled={selectedIds.size === 0 || isSharing}
                    style={{ opacity: selectedIds.size === 0 || isSharing ? 0.4 : 1 }}
                  >
                    <MaterialIcons name="delete-outline" size={24} color={colors.danger} />
                  </Pressable>
                </View>
              )
            : () => (
                <View style={{ flexDirection: 'row', gap: 16 }}>
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
          ListHeaderComponent={
            <Pressable
              onPress={toggleSort}
              style={({ pressed }) => [
                styles.sortBar,
                { backgroundColor: colors.tintSubtle, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <MaterialIcons name="event" size={14} color={colors.tint} />
              <Text style={[styles.sortBarText, { color: colors.tint }]}>
                {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
              </Text>
              <MaterialIcons
                name={sortOrder === 'newest' ? 'arrow-downward' : 'arrow-upward'}
                size={14}
                color={colors.tint}
              />
            </Pressable>
          }
          renderItem={({ item }) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <View style={styles.photoItem}>
                <Pressable
                  onPress={() => {
                    if (selectionMode) {
                      togglePhotoSelection(item.id);
                    } else {
                      router.push(`/photo/${item.id}?categoryId=${id}`);
                    }
                  }}
                  onLongPress={() => {
                    if (!selectionMode) {
                      enterSelectionMode(item.id);
                    }
                  }}
                  delayLongPress={300}
                >
                  <Image
                    source={{ uri: item.uri }}
                    style={[styles.photo, isSelected && styles.photoSelected]}
                    contentFit="cover"
                  />
                  {isSelected && (
                    <View style={styles.checkOverlay}>
                      <MaterialIcons name="check-circle" size={26} color="#fff" />
                    </View>
                  )}
                  <Text style={[styles.photoDate, { color: colors.subtext }]}>
                    {formatDate(item.takenAt)}
                  </Text>
                </Pressable>
              </View>
            );
          }}
        />
      )}

      {!selectionMode && (
        <View style={[styles.fabWrapper, { bottom: 28 + insets.bottom }]}>
          <Pressable
            style={[styles.fab, { backgroundColor: category.color }]}
            onPress={handleAddPhoto}
          >
            <MaterialIcons name="add" size={30} color="#fff" />
          </Pressable>
        </View>
      )}

      <AppModal
        visible={!!modal}
        {...(modal ?? { title: '' })}
        onDismiss={() => setModal(null)}
      />
      <DatePickerModal
        visible={showDatePicker}
        date={new Date()}
        onConfirm={async (d) => {
          setShowDatePicker(false);
          await saveAssets(pendingAssets, d);
          setPendingAssets([]);
        }}
        onDismiss={() => {
          setShowDatePicker(false);
          setPendingAssets([]);
        }}
      />
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
  photoSelected: {
    opacity: 0.65,
  },
  checkOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  photoDate: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  sortBarText: {
    fontSize: 13,
    fontWeight: '500',
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
