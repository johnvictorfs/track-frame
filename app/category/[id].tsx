import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePhotosContext } from '@/context/photos-context';
import { useTheme } from '@/hooks/use-theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_SIZE = (SCREEN_WIDTH - 48) / 2;

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCategoryById, getPhotosByCategory, addPhoto, deleteCategory } = usePhotosContext();
  const { colors } = useTheme();

  const category = getCategoryById(id);
  const photos = getPhotosByCategory(id);

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
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.9 });
          if (!result.canceled) await addPhoto(result.assets[0].uri, id);
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
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.9 });
          if (!result.canceled) await addPhoto(result.assets[0].uri, id);
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
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeIn.delay(index * 50).duration(300)} style={styles.photoItem}>
              <Pressable onPress={() => router.push(`/photo/${item.id}`)}>
                <Image source={{ uri: item.uri }} style={styles.photo} contentFit="cover" />
                <Text style={[styles.photoDate, { color: colors.subtext }]}>
                  {formatDate(item.takenAt)}
                </Text>
              </Pressable>
            </Animated.View>
          )}
        />
      )}

      <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.fabWrapper}>
        <Pressable
          style={[styles.fab, { backgroundColor: category.color }]}
          onPress={handleAddPhoto}
        >
          <MaterialIcons name="add" size={30} color="#fff" />
        </Pressable>
      </Animated.View>
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
    bottom: 28,
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
