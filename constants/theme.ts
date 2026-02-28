import { Platform } from 'react-native';

export const lightColors = {
  background: '#F5F0FF',
  card: '#FFFFFF',
  input: '#EDE7FA',
  text: '#2D1F4E',
  subtext: '#7B6899',
  border: '#E2D9F3',
  tint: '#7C5CBF',
  tintSubtle: '#EDE5FA',
  icon: '#9880BC',
  danger: '#C0392B',
  tabBar: '#FFFFFF',
  header: '#FFFFFF',
};

export const darkColors = {
  background: '#130F1E',
  card: '#1E1830',
  input: '#271F3D',
  text: '#EDE8FF',
  subtext: '#9080B0',
  border: '#362D52',
  tint: '#B39EE8',
  tintSubtle: '#2D2450',
  icon: '#8070A8',
  danger: '#C0392B',
  tabBar: '#1E1830',
  header: '#1E1830',
};

export const Colors = {
  light: {
    text: lightColors.text,
    background: lightColors.background,
    tint: lightColors.tint,
    icon: lightColors.icon,
    tabIconDefault: lightColors.icon,
    tabIconSelected: lightColors.tint,
  },
  dark: {
    text: darkColors.text,
    background: darkColors.background,
    tint: darkColors.tint,
    icon: darkColors.icon,
    tabIconDefault: darkColors.icon,
    tabIconSelected: darkColors.tint,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
