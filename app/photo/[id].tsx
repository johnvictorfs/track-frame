import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
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
import DatePickerModal from '@/components/DatePickerModal';
import { usePhotosContext } from '@/context/photos-context';
import { calendarDayNumber } from '@/utils/day-number';
import { formatShortDate } from '@/utils/format-date';

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

  const { photos, getPhotosByCategory, deletePhoto, updatePhoto } = usePhotosContext();

  const rawPhotos = categoryId ? getPhotosByCategory(categoryId) : photos.filter((p) => p.id === id);
  const categoryPhotos = [...rawPhotos].sort(
    (a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime()
  );

  const initialIndex = Math.max(0, categoryPhotos.findIndex((p) => p.id === id));
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [compareMode, setCompareMode] = useState(false);
  const [listHeight, setListHeight] = useState(0);
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
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
    return `Day ${calendarDayNumber(categoryPhotos[0].takenAt, iso)}`;
  }

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        const idx = viewableItems[0].index;
        setCurrentIndex(idx);
        if (idx === 0) setCompareMode(false);
      }
    },
    []
  );

  async function handleShare() {
    if (!currentPhoto) return;
    const available = await Sharing.isAvailableAsync();
    if (!available) return;
    try {
      await Sharing.shareAsync(currentPhoto.uri);
    } catch {
      // dismissed or another share in progress — ignore
    }
  }

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
        {listHeight > 0 && compareMode && currentIndex > 0 && (
          <View style={[StyleSheet.absoluteFillObject, styles.compareContainer]}>
            <View style={styles.compareSide}>
              <Image source={{ uri: categoryPhotos[0].uri }} style={{ flex: 1 }} contentFit="contain" />
              <View style={styles.compareLabel}>
                <Text style={styles.compareLabelDay}>Day 1 · Start</Text>
                <Text style={styles.compareLabelDate}>{formatShortDate(categoryPhotos[0].takenAt)}</Text>
              </View>
            </View>
            <View style={styles.compareDivider} />
            <View style={styles.compareSide}>
              <Image source={{ uri: currentPhoto.uri }} style={{ flex: 1 }} contentFit="contain" />
              <View style={styles.compareLabel}>
                <Text style={styles.compareLabelDay}>{getDayLabel(currentPhoto.takenAt, currentIndex)}</Text>
                <Text style={styles.compareLabelDate}>{formatShortDate(currentPhoto.takenAt)}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {categoryPhotos.length > 1 && (
          <Text style={styles.dayLabel}>{getDayLabel(currentPhoto.takenAt, currentIndex)}</Text>
        )}
        <Text style={styles.date}>{formatDate(currentPhoto.takenAt)}</Text>
        {categoryPhotos.length > 1 && (
          <View style={styles.navRow}>
            <Pressable
              style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
              onPress={() => flatListRef.current?.scrollToIndex({ index: 0, animated: true })}
              disabled={currentIndex === 0}
            >
              <MaterialIcons name="first-page" size={20} color={currentIndex === 0 ? 'rgba(255,255,255,0.2)' : '#fff'} />
              <Text style={[styles.navBtnText, currentIndex === 0 && styles.navBtnTextDisabled]}>First</Text>
            </Pressable>
            <Pressable
              style={[styles.navBtn, currentIndex === categoryPhotos.length - 1 && styles.navBtnDisabled]}
              onPress={() => flatListRef.current?.scrollToIndex({ index: categoryPhotos.length - 1, animated: true })}
              disabled={currentIndex === categoryPhotos.length - 1}
            >
              <Text style={[styles.navBtnText, currentIndex === categoryPhotos.length - 1 && styles.navBtnTextDisabled]}>Latest</Text>
              <MaterialIcons name="last-page" size={20} color={currentIndex === categoryPhotos.length - 1 ? 'rgba(255,255,255,0.2)' : '#fff'} />
            </Pressable>
          </View>
        )}
        <View style={styles.actionRows}>
          <View style={styles.actionRow}>
            <Pressable style={styles.actionBtn} onPress={handleShare}>
              <MaterialIcons name="share" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Share</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, compareMode && styles.actionBtnActive, currentIndex === 0 && styles.actionBtnDisabled]}
              onPress={() => setCompareMode((v) => !v)}
              disabled={currentIndex === 0}
            >
              <MaterialIcons name="compare" size={20} color={compareMode ? '#a78bfa' : '#fff'} />
              <Text style={[styles.actionBtnText, compareMode && { color: '#a78bfa' }]}>Compare</Text>
            </Pressable>
          </View>
          <View style={styles.actionRow}>
            <Pressable style={styles.actionBtn} onPress={() => setShowDatePicker(true)}>
              <MaterialIcons name="edit-calendar" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Edit Date</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleRemove}>
              <MaterialIcons name="remove-circle-outline" size={20} color="#ff4444" />
              <Text style={[styles.actionBtnText, { color: '#ff4444' }]}>Remove</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <AppModal
        visible={!!modal}
        {...(modal ?? { title: '' })}
        onDismiss={() => setModal(null)}
      />
      {currentPhoto && (
        <DatePickerModal
          visible={showDatePicker}
          date={new Date(currentPhoto.takenAt)}
          onConfirm={async (d) => {
            await updatePhoto(currentPhoto.id, { takenAt: d.toISOString() });
            setShowDatePicker(false);
          }}
          onDismiss={() => setShowDatePicker(false)}
        />
      )}
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
  actionRows: {
    alignSelf: 'stretch',
    gap: 8,
    marginTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  actionBtnActive: {
    backgroundColor: '#1a0030',
  },
  actionBtnDisabled: {
    opacity: 0.35,
  },
  compareContainer: {
    flexDirection: 'row',
    backgroundColor: '#000',
  },
  compareSide: {
    flex: 1,
  },
  compareDivider: {
    width: 1,
    backgroundColor: '#444',
  },
  compareLabel: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  compareLabelDay: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  compareLabelDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  navBtnTextDisabled: {
    color: 'rgba(255,255,255,0.2)',
  },
});
