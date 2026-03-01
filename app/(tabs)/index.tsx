import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import TabScreenWrapper from '@/components/tab-screen-wrapper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppModal, { ModalConfig } from '@/components/AppModal';
import { CATEGORY_SUGGESTIONS } from '@/constants/category-suggestions';
import { Category, usePhotosContext } from '@/context/photos-context';
import { useTheme } from '@/hooks/use-theme';
import Onboarding from '@/components/Onboarding';

function NewCategoryFooter() {
  const { addCategory } = usePhotosContext();
  const { colors } = useTheme();

  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  function collapse() {
    setExpanded(false);
    setName('');
  }

  async function handleCreate(categoryName: string) {
    const trimmed = categoryName.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    try {
      const category = await addCategory(trimmed);
      collapse();
      router.navigate({ pathname: '/(tabs)/add', params: { categoryId: category.id } });
    } finally {
      setLoading(false);
    }
  }

  if (!expanded) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.newCategoryBtn,
          { borderColor: colors.border, backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => setExpanded(true)}
      >
        <MaterialIcons name="add" size={18} color={colors.tint} />
        <Text style={[styles.newCategoryBtnText, { color: colors.tint }]}>New category</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.newCategoryCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <View style={styles.newCategoryCardHeader}>
        <Text style={[styles.newCategoryCardLabel, { color: colors.text }]}>New category</Text>
        <Pressable onPress={collapse} hitSlop={8}>
          <MaterialIcons name="close" size={18} color={colors.subtext} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {CATEGORY_SUGGESTIONS.map(({ name: suggName, icon: suggIcon }) => (
          <Pressable
            key={suggName}
            style={({ pressed }) => [
              styles.chip,
              { backgroundColor: colors.input, borderColor: colors.border },
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => handleCreate(suggName)}
            disabled={loading}
          >
            <MaterialIcons name={suggIcon as any} size={14} color={colors.text} />
            <Text style={[styles.chipText, { color: colors.text }]}>{suggName}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.ncInputCard, { backgroundColor: colors.input, borderColor: colors.border }]}>
        <View style={styles.ncInputRow}>
          <TextInput
            style={[styles.ncInput, { color: colors.text }]}
            placeholder="Category name…"
            placeholderTextColor={colors.subtext}
            value={name}
            onChangeText={setName}
            returnKeyType="go"
            onSubmitEditing={() => handleCreate(name)}
            autoFocus
          />
          <Pressable
            style={[
              styles.ncGoButton,
              { backgroundColor: colors.tint },
              !name.trim() && styles.ncGoButtonDisabled,
            ]}
            onPress={() => handleCreate(name)}
            disabled={!name.trim() || loading}
          >
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function GalleryScreen() {
  const { categories, photos, loading, getLatestPhotoForCategory, deleteCategory } = usePhotosContext();
  const { colors } = useTheme();
  const [modal, setModal] = useState<ModalConfig | null>(null);

  function renderCategory({ item, index }: { item: Category; index: number }) {
    const latestPhoto = getLatestPhotoForCategory(item.id);
    const photoCount = photos.filter((p) => p.categoryId === item.id).length;
    const lastDate = latestPhoto
      ? new Date(latestPhoto.takenAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null;

    function handleLongPress() {
      setModal({
        title: 'Remove Category',
        message: `Remove "${item.name}"? Photos won't be deleted, just untracked.`,
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteCategory(item.id) },
        ],
      });
    }

    return (
      <Animated.View entering={FadeInDown.delay(index * 60).duration(300)}>
      <Pressable
        style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}
        onPress={() => router.push(`/category/${item.id}`)}
        onLongPress={handleLongPress}
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
            <MaterialIcons
              name="add-a-photo"
              size={28}
              color={item.color}
            />
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
      </Animated.View>
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
    <TabScreenWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>TrackFrame</Text>
        </View>
        {categories.length === 0 ? (
          <Onboarding />
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={renderCategory}
            ListFooterComponent={NewCategoryFooter}
            ListFooterComponentStyle={styles.listFooter}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </SafeAreaView>
      <AppModal
        visible={!!modal}
        {...(modal ?? { title: '' })}
        onDismiss={() => setModal(null)}
      />
    </TabScreenWrapper>
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
  listFooter: {
    marginTop: 4,
  },
  newCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  newCategoryBtnText: {
    fontSize: 15,
    fontWeight: '500',
  },
  newCategoryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  newCategoryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newCategoryCardLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  ncInputCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  ncInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
  },
  ncInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 6,
  },
  ncGoButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ncGoButtonDisabled: {
    opacity: 0.35,
  },
});
