import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ColorsByMode,
  GradientsByMode,
  type ThemeColors,
  type ThemeGradients,
  type ThemeMode,
} from '../constants/theme';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  gradients: ThemeGradients;
  isDark: boolean;
  /** True while the persisted theme is still being loaded from storage. */
  isThemeLoading: boolean;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Key used to persist the chosen theme mode across app restarts.
const THEME_STORAGE_KEY = 'xi-rpl2:theme-mode';

function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Initial theme mode used before the persisted value (if any) is loaded. Defaults to 'dark'. */
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode = 'dark' }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  // Guards against writing the just-loaded value straight back to storage,
  // and against updating state after the component has unmounted.
  const hasLoadedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Load the previously saved theme (if any) once, on mount.
  useEffect(() => {
    isMountedRef.current = true;

    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (isMountedRef.current && isValidThemeMode(stored)) {
          setModeState(stored);
        }
      } catch (error) {
        console.warn('[ThemeContext] Gagal membaca tema tersimpan:', error);
      } finally {
        hasLoadedRef.current = true;
        if (isMountedRef.current) {
          setIsThemeLoading(false);
        }
      }
    })();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Persist the theme mode to storage whenever it changes (after the
  // initial load has completed, so we don't overwrite storage with the
  // default value before the saved value has been read).
  useEffect(() => {
    if (!hasLoadedRef.current) {
      return;
    }

    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch((error) => {
      console.warn('[ThemeContext] Gagal menyimpan tema:', error);
    });
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: ColorsByMode[mode],
      gradients: GradientsByMode[mode],
      isDark: mode === 'dark',
      isThemeLoading,
      toggleTheme,
      setMode,
    }),
    [mode, isThemeLoading, toggleTheme, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>');
  }
  return ctx;
}