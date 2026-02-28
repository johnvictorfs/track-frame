import { darkColors, lightColors } from '@/constants/theme';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

export function useTheme() {
  const isDark = useAppColorScheme() === 'dark';
  return { colors: isDark ? darkColors : lightColors, isDark };
}
