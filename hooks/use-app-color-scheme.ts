import { useSettings } from '@/context/settings-context';

export function useAppColorScheme(): 'light' | 'dark' {
  return useSettings().effectiveColorScheme;
}
