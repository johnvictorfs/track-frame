import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';

const ITEM_HEIGHT = 44;
const VISIBLE = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE;
const PAD = ITEM_HEIGHT * 2;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function daysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

type WheelProps = {
  items: string[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  width: number;
  colors: any;
};

function Wheel({ items, selectedIndex, onSelect, width, colors }: WheelProps) {
  const ref = useRef<FlatList>(null);
  const scrolling = useRef(false);
  const internalIdx = useRef(selectedIndex);

  // Scroll to selectedIndex when it changes externally
  useEffect(() => {
    if (!scrolling.current && internalIdx.current !== selectedIndex) {
      internalIdx.current = selectedIndex;
      ref.current?.scrollToOffset({ offset: selectedIndex * ITEM_HEIGHT, animated: true });
    }
  }, [selectedIndex]);

  const snap = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const raw = e.nativeEvent.contentOffset.y;
      const idx = Math.max(0, Math.min(Math.round(raw / ITEM_HEIGHT), items.length - 1));
      scrolling.current = false;
      internalIdx.current = idx;
      ref.current?.scrollToOffset({ offset: idx * ITEM_HEIGHT, animated: true });
      onSelect(idx);
    },
    [items.length, onSelect],
  );

  return (
    <View style={{ width, height: PICKER_HEIGHT, overflow: 'hidden' }}>
      {/* selection highlight */}
      <View
        pointerEvents="none"
        style={[
          styles.highlight,
          { top: PAD, backgroundColor: colors.tintSubtle },
        ]}
      />
      <FlatList
        ref={ref}
        data={items}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        initialScrollIndex={selectedIndex}
        contentContainerStyle={{ paddingTop: PAD, paddingBottom: PAD }}
        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        onScrollBeginDrag={() => { scrolling.current = true; }}
        onMomentumScrollEnd={snap}
        onScrollEndDrag={snap}
        renderItem={({ item, index }) => (
          <Pressable
            style={styles.cell}
            onPress={() => {
              ref.current?.scrollToOffset({ offset: index * ITEM_HEIGHT, animated: true });
              internalIdx.current = index;
              onSelect(index);
            }}
          >
            <Text
              style={[
                styles.cellText,
                { color: index === selectedIndex ? colors.tint : colors.text },
                index === selectedIndex && styles.cellTextSelected,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

type Props = {
  visible: boolean;
  date: Date;
  onConfirm: (date: Date) => void;
  onDismiss: () => void;
};

export default function DatePickerModal({ visible, date, onConfirm, onDismiss }: Props) {
  const { colors } = useTheme();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 31 }, (_, i) => String(currentYear - 30 + i));

  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(0);
  const [yearIdx, setYearIdx] = useState(years.length - 1);

  useEffect(() => {
    if (visible) {
      setMonth(date.getMonth());
      setDay(date.getDate() - 1);
      const yi = years.indexOf(String(date.getFullYear()));
      setYearIdx(yi >= 0 ? yi : years.length - 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const numDays = daysInMonth(month, parseInt(years[yearIdx]));
  const clampedDay = Math.min(day, numDays - 1);

  // Auto-clamp day when month/year changes
  useEffect(() => {
    if (day >= numDays) setDay(numDays - 1);
  }, [numDays, day]);

  const dayItems = Array.from({ length: numDays }, (_, i) => String(i + 1).padStart(2, '0'));

  function confirm() {
    const d = new Date(parseInt(years[yearIdx]), month, clampedDay + 1, 12, 0, 0);
    onConfirm(d);
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Select Date</Text>

          <View style={styles.wheels}>
            <Wheel
              items={MONTHS}
              selectedIndex={month}
              onSelect={setMonth}
              width={84}
              colors={colors}
            />
            <Wheel
              items={dayItems}
              selectedIndex={clampedDay}
              onSelect={setDay}
              width={56}
              colors={colors}
            />
            <Wheel
              items={years}
              selectedIndex={yearIdx}
              onSelect={setYearIdx}
              width={76}
              colors={colors}
            />
          </View>

          <View style={styles.btnRow}>
            <Pressable
              style={[styles.btn, styles.cancelBtn, { borderColor: colors.border }]}
              onPress={onDismiss}
            >
              <Text style={[styles.btnText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.btn, { backgroundColor: colors.tint }]} onPress={confirm}>
              <Text style={[styles.btnText, { color: '#fff' }]}>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    width: '100%',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  wheels: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  highlight: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    borderRadius: 8,
  },
  cell: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 17,
  },
  cellTextSelected: {
    fontWeight: '600',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
