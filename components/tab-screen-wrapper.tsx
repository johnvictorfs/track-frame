import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
};

export default function TabScreenWrapper({ children }: Props) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(6);

  useFocusEffect(
    useCallback(() => {
      opacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
      translateY.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) });
      return () => {
        opacity.value = 0;
        translateY.value = 6;
      };
    }, [])
  );

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
