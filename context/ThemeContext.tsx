import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  palettes,
  ThemeColors,
  ThemeMode,
  getPaletteForHour,
  getCurrentHour,
  isDarkPalette,
} from '../constants/theme';

const STORAGE_KEY = '@magangku_theme_mode';

const lightPalette = palettes.light;
const sunsetPalette = palettes.sunset;

interface ThemeContextType {
  Colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [hour, setHour] = useState<number>(getCurrentHour);
  const prevPalette = useRef<ThemeColors | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'auto' || saved === 'light' || saved === 'sunset') {
          setModeState(saved);
        } else if (saved === 'dark') {
          setModeState('sunset');
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setHour(getCurrentHour()), 60000);
    return () => clearInterval(interval);
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  // Hitung palet aktif; reuse referensi lama jika nilainya sama (menghindari re-render tidak perlu)
  const Colors = useMemo(() => {
    const computed = mode === 'auto' ? getPaletteForHour(hour) : mode === 'light' ? lightPalette : sunsetPalette;
    const prev = prevPalette.current;
    if (prev && Object.keys(computed).every((k) => prev[k as keyof ThemeColors] === computed[k as keyof ThemeColors])) {
      return prev;
    }
    prevPalette.current = computed;
    return computed;
  }, [hour, mode]);

  const isDark = useMemo(() => isDarkPalette(Colors), [Colors]);

  const value = useMemo(
    () => ({ Colors, isDark, mode, setMode }),
    [Colors, isDark, mode, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
