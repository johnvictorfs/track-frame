import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Category, usePhotosContext } from '@/context/photos-context';

export default function GalleryScreen() {
  const { categories, photos, loading, getLatestPhotoForCategory } = usePhotosContext();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#111' : '#f5f5f5',
    card: isDark ? '#1e1e1e' : '#fff',
    text: isDark ? '#f0f0f0' : '#1a1a1a',
    subtext: isDark ? '#999' : '#666',
    border: isDark ? '#2a2a2a' : '#e5e5e5',
  };

  function renderCategory({ item }: { item: Category }) {
    const latestPhoto = getLatestPhotoForCategory(item.id);
    const photoCount = photos.filter((p) => p.categoryId === item.id).length;
    const lastDate = latestPhoto
      ? new Date(latestPhoto.takenAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null;

    return (
      <Pressable
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push(`/category/${item.id}`)}
      >
        <View style={[styles.colorBar, { backgroundColor: item.color }]} />
        {latestPhoto ? (
          <Image source={{ uri: latestPhoto.uri }} style={styles.thumbnail} contentFit="cover" />
        ) : (
          <View
            style={[
              styles.thumbnail,
              styles.thumbnailPlaceholder,
              { backgroundColor: item.color + '22' },
            ]}
          >
            <MaterialIcons name="add-a-photo" size={28} color={item.color} />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.photoCount, { color: colors.subtext }]}>
            {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
          </Text>
          {lastDate && (
            <Text style={[styles.lastDate, { color: colors.subtext }]}>Updated {lastDate}</Text>
          )}
        </View>
        <MaterialIcons name="chevron-right" size={24} color={colors.subtext} style={{ marginRight: 12 }} />
      </Pressable>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>TrackFrame</Text>
      </View>
      {categories.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="photo-library" size={72} color={isDark ? '#444' : '#ccc'} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing tracked yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
            Tap the Add Photo tab to start tracking your progress
          </Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
  },
  colorBar: {
    width: 5,
    alignSelf: 'stretch',
  },
  thumbnail: {
    width: 72,
    height: 72,
    margin: 12,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    paddingVertical: 14,
    gap: 3,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '600',
  },
  photoCount: {
    fontSize: 13,
  },
  lastDate: {
    fontSize: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
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
});
