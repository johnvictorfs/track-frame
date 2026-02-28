import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Category = {
  id: string;
  name: string;
  createdAt: string;
  color: string;
};

export type Photo = {
  id: string;
  uri: string;
  categoryId: string;
  takenAt: string;
};

type PhotosContextType = {
  categories: Category[];
  photos: Photo[];
  loading: boolean;
  addCategory: (name: string) => Promise<Category>;
  addPhoto: (uri: string, categoryId: string) => Promise<Photo>;
  deletePhoto: (id: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getPhotosByCategory: (categoryId: string) => Photo[];
  getCategoryById: (id: string) => Category | undefined;
  getLatestPhotoForCategory: (categoryId: string) => Photo | null;
};

const PhotosContext = createContext<PhotosContextType | null>(null);

const CATEGORY_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

const CATEGORIES_KEY = 'TF_CATEGORIES';
const PHOTOS_KEY = 'TF_PHOTOS';

export function PhotosProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [catsRaw, phtsRaw] = await Promise.all([
        AsyncStorage.getItem(CATEGORIES_KEY),
        AsyncStorage.getItem(PHOTOS_KEY),
      ]);
      if (catsRaw) setCategories(JSON.parse(catsRaw));
      if (phtsRaw) setPhotos(JSON.parse(phtsRaw));
      setLoading(false);
    })();
  }, []);

  const addCategory = useCallback(async (name: string): Promise<Category> => {
    const usedColors = categories.map((c) => c.color);
    const available = CATEGORY_COLORS.filter((c) => !usedColors.includes(c));
    const color =
      available.length > 0
        ? available[0]
        : CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length];

    const category: Category = {
      id: Date.now().toString(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      color,
    };
    const updated = [...categories, category];
    setCategories(updated);
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
    return category;
  }, [categories]);

  const addPhoto = useCallback(async (uri: string, categoryId: string): Promise<Photo> => {
    const dir = `${FileSystem.documentDirectory}photos/`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const filename = `${Date.now()}.jpg`;
    const dest = `${dir}${filename}`;
    await FileSystem.copyAsync({ from: uri, to: dest });

    const photo: Photo = {
      id: Date.now().toString(),
      uri: dest,
      categoryId,
      takenAt: new Date().toISOString(),
    };
    const updated = [...photos, photo];
    setPhotos(updated);
    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updated));
    return photo;
  }, [photos]);

  const deletePhoto = useCallback(async (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (photo) {
      await FileSystem.deleteAsync(photo.uri, { idempotent: true });
    }
    const updated = photos.filter((p) => p.id !== id);
    setPhotos(updated);
    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updated));
  }, [photos]);

  const deleteCategory = useCallback(async (id: string) => {
    const catPhotos = photos.filter((p) => p.categoryId === id);
    await Promise.all(catPhotos.map((p) => FileSystem.deleteAsync(p.uri, { idempotent: true })));
    const updatedPhotos = photos.filter((p) => p.categoryId !== id);
    setPhotos(updatedPhotos);
    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updatedPhotos));
    const updatedCategories = categories.filter((c) => c.id !== id);
    setCategories(updatedCategories);
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));
  }, [photos, categories]);

  const getPhotosByCategory = useCallback((categoryId: string): Photo[] => {
    return photos
      .filter((p) => p.categoryId === categoryId)
      .sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime());
  }, [photos]);

  const getCategoryById = useCallback((id: string): Category | undefined => {
    return categories.find((c) => c.id === id);
  }, [categories]);

  const getLatestPhotoForCategory = useCallback((categoryId: string): Photo | null => {
    const catPhotos = photos
      .filter((p) => p.categoryId === categoryId)
      .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
    return catPhotos[0] ?? null;
  }, [photos]);

  return (
    <PhotosContext.Provider
      value={{
        categories,
        photos,
        loading,
        addCategory,
        addPhoto,
        deletePhoto,
        deleteCategory,
        getPhotosByCategory,
        getCategoryById,
        getLatestPhotoForCategory,
      }}
    >
      {children}
    </PhotosContext.Provider>
  );
}

export function usePhotosContext() {
  const ctx = useContext(PhotosContext);
  if (!ctx) throw new Error('usePhotosContext must be used within PhotosProvider');
  return ctx;
}
