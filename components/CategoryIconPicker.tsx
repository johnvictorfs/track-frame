import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { CATEGORY_ICONS } from '@/constants/category-suggestions';

type Props = {
  value: string | undefined;
  onChange: (icon: string | undefined) => void;
  tint: string;
  isDark: boolean;
};

export default function CategoryIconPicker({ value, onChange, tint, isDark }: Props) {
  const defaultColor = isDark ? '#666' : '#999';
  const border = isDark ? '#2a2a2a' : '#e5e5e5';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Pressable
        style={[
          styles.btn,
          { borderColor: !value ? tint : border },
          !value && { backgroundColor: tint + '18' },
        ]}
        onPress={() => onChange(undefined)}
      >
        <MaterialIcons name="block" size={22} color={!value ? tint : defaultColor} />
      </Pressable>

      {CATEGORY_ICONS.map((icon) => {
        const selected = value === icon;
        return (
          <Pressable
            key={icon}
            style={[
              styles.btn,
              { borderColor: selected ? tint : border },
              selected && { backgroundColor: tint + '18' },
            ]}
            onPress={() => onChange(icon)}
          >
            <MaterialIcons
              name={icon as any}
              size={22}
              color={selected ? tint : defaultColor}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
