export interface ThemeColors {
  primary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  primaryFixed: string;
  onPrimary: string;

  secondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  tertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  background: string;
  onBackground: string;

  surface: string;
  surfaceContainer: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceContainerLowest: string;
  onSurface: string;
  onSurfaceVariant: string;

  outline: string;
  outlineVariant: string;

  error: string;
  errorContainer: string;
  onErrorContainer: string;

  success: string;
  successContainer: string;
  onSuccessContainer: string;
}

export type PaletteName = 'light' | 'sunset';

export type ThemeMode = 'auto' | 'light' | 'sunset';

export const palettes: Record<PaletteName, ThemeColors> = {
  /* Pagi & siang: cerah */
  light: {
    primary: '#003fb1',
    primaryContainer: '#1a56db',
    onPrimaryContainer: '#d4dcff',
    primaryFixed: '#dbe1ff',
    onPrimary: '#ffffff',

    secondary: '#5c5f60',
    secondaryContainer: '#dee0e2',
    onSecondaryContainer: '#606365',

    tertiary: '#005438',
    tertiaryContainer: '#006f4b',
    onTertiaryContainer: '#7af3bb',

    background: '#f0f4fc',
    onBackground: '#151c27',

    surface: '#e8f0fe',
    surfaceContainer: '#dbe7ff',
    surfaceContainerLow: '#eef4ff',
    surfaceContainerHigh: '#d5e3fc',
    surfaceContainerHighest: '#c5d7f7',
    surfaceContainerLowest: '#ffffff',
    onSurface: '#151c27',
    onSurfaceVariant: '#434654',

    outline: '#737686',
    outlineVariant: '#c5d5f5',

    error: '#ba1a1a',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',

    success: '#10b981',
    successContainer: '#d1fae5',
    onSuccessContainer: '#065f46',
  },

  /* Sore: hangat kekuningan */
  sunset: {
    primary: '#003fb1',
    primaryContainer: '#1a56db',
    onPrimaryContainer: '#d4dcff',
    primaryFixed: '#e3e0ff',
    onPrimary: '#ffffff',

    secondary: '#7a5b34',
    secondaryContainer: '#f0e2c8',
    onSecondaryContainer: '#6b4e26',

    tertiary: '#005438',
    tertiaryContainer: '#006f4b',
    onTertiaryContainer: '#7af3bb',

    background: '#faf3e5',
    onBackground: '#231c12',

    surface: '#f6ecd8',
    surfaceContainer: '#f1e4cb',
    surfaceContainerLow: '#fbf5e9',
    surfaceContainerHigh: '#ecdec1',
    surfaceContainerHighest: '#e2d2b1',
    surfaceContainerLowest: '#fffdf7',
    onSurface: '#231c12',
    onSurfaceVariant: '#5c554a',

    outline: '#857b6b',
    outlineVariant: '#eadbc0',

    error: '#ba1a1a',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',

    success: '#10b981',
    successContainer: '#d1fae5',
    onSuccessContainer: '#065f46',
  },
};

// Default palette (dipakai sebagai fallback static export)
export const Colors: ThemeColors = palettes.light;

// ------------------------------------------------------------
// Interpolasi warna antar palet berdasarkan jam
// ------------------------------------------------------------

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex([r, g, b]: RGB): string {
  const to = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function lerpColor(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex(ca.map((v, i) => v + (cb[i] - v) * t) as RGB);
}

function lerpPalettes(a: ThemeColors, b: ThemeColors, t: number): ThemeColors {
  const result = {} as ThemeColors;
  (Object.keys(a) as (keyof ThemeColors)[]).forEach((key) => {
    result[key] = lerpColor(a[key], b[key], t);
  });
  return result;
}

// Jadwal tema: 05:00-16:30 cerah, 17:00-18:00 sore (kekuningan), malam pakai hangat sunset
const schedule: { t: number; palette: PaletteName }[] = [
  { t: 4.5, palette: 'sunset' },
  { t: 5.0, palette: 'light' },
  { t: 16.5, palette: 'light' },
  { t: 17.0, palette: 'sunset' },
  { t: 18.0, palette: 'sunset' },
  { t: 18.5, palette: 'sunset' },
];

// Smoothstep: warna cepat berpindah di tengah transisi, tidak berlama-lama di warna antara
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export function getPaletteForHour(hour: number): ThemeColors {
  const points = [...schedule];
  if (hour < points[0].t) {
    const last = points[points.length - 1];
    points.unshift({ t: last.t - 24, palette: last.palette });
  }

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (hour >= a.t && hour <= b.t) {
      const span = b.t - a.t;
      const f = span === 0 ? 0 : smoothstep((hour - a.t) / span);
      return lerpPalettes(palettes[a.palette], palettes[b.palette], f);
    }
  }

  return palettes[points[points.length - 1].palette];
}

export function getCurrentHour(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
}

export function isDarkPalette(colors: ThemeColors): boolean {
  const [r, g, b] = hexToRgb(colors.background);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

// Material 3 elevation & shape tokens (visual-only polish, palette unchanged)
export const Shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const Elevations = {
  level0: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: Shadows.sm,
  level2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  level3: Shadows.md,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  search: 28,
  pill: 999,
};
