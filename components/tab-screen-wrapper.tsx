import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const TIMING = { duration: 220, easing: Easing.out(Easing.quad) } as const;

type Props = { children: React.ReactNode };

export default function TabScreenWrapper({ children }: Props) {
  const navigation = useNavigation();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(6);

  useEffect(() => {
    opacity.value = withTiming(1, TIMING);
    translateY.value = withTiming(0, TIMING);

    const unsubFocus = navigation.addListener('focus', () => {
      opacity.value = withTiming(1, TIMING);
      translateY.value = withTiming(0, TIMING);
    });

    const unsubBlur = navigation.addListener('blur', () => {
      // If the root stack pushed a new screen on top (index > 0), the tab is
      // merely covered — keep it at full opacity so there's no flash on return.
      // Only reset when we're actually switching to a different tab (index === 0).
      const parentState = navigation.getParent()?.getState();
      if (!parentState || parentState.index === 0) {
        opacity.value = 0;
        translateY.value = 6;
      }
    });

    return () => {
      unsubFocus();
      unsubBlur();
    };
  }, [navigation]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animStyle]}>
      {children}
    </Animated.View>
  );
}
