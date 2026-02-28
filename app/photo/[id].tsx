import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePhotosContext } from '@/context/photos-context';

export default function PhotoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { photos, deletePhoto } = usePhotosContext();
  const subtext = 'rgba(255,255,255,0.6)';

  const photo = photos.find((p) => p.id === id);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function handleRemove() {
    Alert.alert(
      'Remove Photo',
      'This will remove the photo from your progress tracking. The original file on your device will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deletePhoto(id);
            router.back();
          },
        },
      ]
    );
  }

  if (!photo) {
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
          title: '',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerShadowVisible: false,
        }}
      />

      <Image source={{ uri: photo.uri }} style={styles.photo} contentFit="contain" />

      <View style={styles.footer}>
        <Text style={[styles.date, { color: subtext }]}>{formatDate(photo.takenAt)}</Text>
        <Pressable style={styles.removeBtn} onPress={handleRemove}>
          <MaterialIcons name="remove-circle-outline" size={22} color="#ff4444" />
          <Text style={styles.removeBtnText}>Remove from Tracking</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  photo: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  removeBtnText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '500',
  },
});
