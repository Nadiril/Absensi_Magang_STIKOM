export const Colors = {
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
};

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
