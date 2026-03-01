import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppModal, { ModalConfig } from '@/components/AppModal';
import { usePhotosContext } from '@/context/photos-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PhotoScreen() {
  const { id: paramId, categoryId: paramCategoryId } = useLocalSearchParams<{
    id: string;
    categoryId?: string;
  }>();

  const idRef = useRef(paramId ?? '');
  if (paramId) idRef.current = paramId;
  const id = idRef.current;

  const catIdRef = useRef(paramCategoryId ?? '');
  if (paramCategoryId) catIdRef.current = paramCategoryId;
  const categoryId = catIdRef.current;

  const { photos, getPhotosByCategory, deletePhoto } = usePhotosContext();

  const rawPhotos = categoryId ? getPhotosByCategory(categoryId) : photos.filter((p) => p.id === id);
  const categoryPhotos = [...rawPhotos].sort(
    (a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime()
  );

  const initialIndex = Math.max(0, categoryPhotos.findIndex((p) => p.id === id));
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [listHeight, setListHeight] = useState(0);
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const currentPhoto = categoryPhotos[currentIndex] ?? categoryPhotos[0];

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function getDayLabel(iso: string, index: number): string {
    if (index === 0) return 'Day 1 · Start';
    const start = new Date(categoryPhotos[0].takenAt);
    const current = new Date(iso);
    const days = Math.round((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `Day ${days + 1}`;
  }

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  function handleRemove() {
    if (!currentPhoto) return;
    setModal({
      title: 'Remove Photo',
      message: 'This will remove the photo from your progress tracking. The original file on your device will not be affected.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (categoryPhotos.length <= 1) {
              await deletePhoto(currentPhoto.id);
              router.back();
              return;
            }
            const targetIndex =
              currentIndex >= categoryPhotos.length - 1 ? currentIndex - 1 : currentIndex;
            await deletePhoto(currentPhoto.id);
            setCurrentIndex(targetIndex);
            flatListRef.current?.scrollToIndex({ index: targetIndex, animated: false });
          },
        },
      ],
    });
  }

  if (categoryPhotos.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#fff', padding: 20 }}>Photo not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: categoryPhotos.length > 1 ? `${currentIndex + 1} / ${categoryPhotos.length}` : '',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerShadowVisible: false,
        }}
      />

      <View
        style={{ flex: 1 }}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0) setListHeight(h);
        }}
      >
        {listHeight > 0 && (
          <FlatList
            ref={flatListRef}
            data={categoryPhotos}
            keyExtractor={(p) => p.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig.current}
            renderItem={({ item }) => (
              <View style={{ width: SCREEN_WIDTH, height: listHeight }}>
                <Image source={{ uri: item.uri }} style={{ flex: 1 }} contentFit="contain" />
              </View>
            )}
          />
        )}
      </View>

      <View style={styles.footer}>
        {categoryPhotos.length > 1 && (
          <Text style={styles.dayLabel}>{getDayLabel(currentPhoto.takenAt, currentIndex)}</Text>
        )}
        <Text style={styles.date}>{formatDate(currentPhoto.takenAt)}</Text>
        <Pressable style={styles.removeBtn} onPress={handleRemove}>
          <MaterialIcons name="remove-circle-outline" size={22} color="#ff4444" />
          <Text style={styles.removeBtnText}>Remove from Tracking</Text>
        </Pressable>
      </View>
      <AppModal
        visible={!!modal}
        {...(modal ?? { title: '' })}
        onDismiss={() => setModal(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 6,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  date: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    marginTop: 10,
  },
  removeBtnText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '500',
  },
});
