import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams } from 'expo-router';
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

import { Photo, usePhotosContext } from '@/context/photos-context';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_SIZE = (SCREEN_WIDTH - 48) / 2;

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCategoryById, getPhotosByCategory, addPhoto, deletePhoto } = usePhotosContext();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#111' : '#f5f5f5',
    text: isDark ? '#f0f0f0' : '#1a1a1a',
    subtext: isDark ? '#999' : '#666',
    photoDate: isDark ? '#bbb' : '#555',
  };

  const category = getCategoryById(id);
  const photos = getPhotosByCategory(id);

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

  function handleLongPress(photo: Photo) {
    Alert.alert('Delete Photo', 'Remove this photo from your progress?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deletePhoto(photo.id),
      },
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
          headerStyle: { backgroundColor: isDark ? '#1a1a1a' : '#fff' },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      {photos.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="add-a-photo" size={72} color={isDark ? '#444' : '#ccc'} />
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
            <Pressable style={styles.photoItem} onLongPress={() => handleLongPress(item)}>
              <Image source={{ uri: item.uri }} style={styles.photo} contentFit="cover" />
              <Text style={[styles.photoDate, { color: colors.photoDate }]}>
                {formatDate(item.takenAt)}
              </Text>
            </Pressable>
          )}
        />
      )}

      <Pressable
        style={[styles.fab, { backgroundColor: category.color }]}
        onPress={handleAddPhoto}
      >
        <MaterialIcons name="add" size={30} color="#fff" />
      </Pressable>
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
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
});
