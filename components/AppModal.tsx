import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, Keyframe } from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

export type ModalButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

export type ModalConfig = {
  title: string;
  message?: string;
  buttons?: ModalButton[];
};

type Props = ModalConfig & {
  visible: boolean;
  onDismiss?: () => void;
};

const cardEntering = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.92 }] },
  100: { opacity: 1, transform: [{ scale: 1 }] },
}).duration(200);

export default function AppModal({ visible, title, message, buttons, onDismiss }: Props) {
  const { colors } = useTheme();
  const btns = buttons ?? [{ text: 'OK' }];
  const stacked = btns.length !== 2;

  function handlePress(btn: ModalButton) {
    onDismiss?.();
    btn.onPress?.();
  }

  function btnColor(btn: ModalButton) {
    if (btn.style === 'destructive') return colors.danger;
    if (btn.style === 'cancel') return colors.subtext;
    return colors.tint;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Animated.View entering={FadeIn.duration(150)} style={styles.overlay}>
        <Animated.View
          entering={cardEntering}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.body}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {message != null && (
              <Text style={[styles.message, { color: colors.subtext }]}>{message}</Text>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {stacked ? (
            <View>
              {btns.map((btn, i) => (
                <View key={i}>
                  {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                  <Pressable
                    style={({ pressed }) => [styles.btnStacked, { opacity: pressed ? 0.5 : 1 }]}
                    onPress={() => handlePress(btn)}
                  >
                    <Text
                      style={[
                        styles.btnText,
                        btn.style === 'cancel' && styles.btnCancelWeight,
                        { color: btnColor(btn) },
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.btnRow}>
              {btns.map((btn, i) => (
                <View key={i} style={styles.btnInlineWrap}>
                  {i > 0 && <View style={[styles.vDivider, { backgroundColor: colors.border }]} />}
                  <Pressable
                    style={({ pressed }) => [styles.btnInline, { opacity: pressed ? 0.5 : 1 }]}
                    onPress={() => handlePress(btn)}
                  >
                    <Text
                      style={[
                        styles.btnText,
                        btn.style === 'cancel' && styles.btnCancelWeight,
                        { color: btnColor(btn) },
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
    gap: 7,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  divider: {
    height: 1,
  },
  btnRow: {
    flexDirection: 'row',
    height: 52,
  },
  btnInlineWrap: {
    flex: 1,
    flexDirection: 'row',
  },
  vDivider: {
    width: 1,
  },
  btnInline: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnStacked: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 17,
    fontWeight: '600',
  },
  btnCancelWeight: {
    fontWeight: '400',
  },
});
