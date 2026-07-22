// Design tokens — "Paper & Ink" editorial theme
// Mirrors the XII RPL 2 website design system 1:1 (see src/styles.css on web).
// Now available in two modes: `light` (the original warm paper look) and
// `dark` (an inverted "ink paper" look). The app defaults to dark mode —
// see src/context/ThemeContext.tsx for the toggle logic.

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surface2: string;
  card: string;
  cardBorder: string;
  borderStrong: string;

  foreground: string;
  ink: string;
  inkSoft: string;
  mutedForeground: string;

  primary: string;
  primaryForeground: string;

  amber: string;
  amberLight: string;
  red: string;
  redLight: string;
  emerald: string;
  emeraldLight: string;

  // Legacy aliases kept so existing screens compile without touching every call-site
  secondary: string;
  secondaryLight: string;
  orange: string;
  orangeLight: string;
  primaryLight: string;
  muted: string;
  border: string;
  overlay: string;
  inputBg: string;
}

export interface ThemeGradients {
  primary: readonly [string, string];
  button: readonly [string, string];
  buttonHover: readonly [string, string];
  emerald: readonly [string, string];
  teacher: readonly [string, string];
  detail: readonly [string, string];
  cardBg: readonly [string, string];
  heroOverlay: readonly [string, string];
  teacherCard: readonly [string, string];
}

// ── Light theme (original "warm paper" look) ─────────────────────────────────
const lightColors: ThemeColors = {
  background: '#f5f3ee',
  surface: '#f6f4ef',
  surface2: '#eeece4',
  card: '#f6f4ef',
  cardBorder: '#e1ddd0',
  borderStrong: '#d1cbb8',

  foreground: '#242220',
  ink: '#242220',
  inkSoft: '#4a473f',
  mutedForeground: '#726d5f',

  primary: '#242220',
  primaryForeground: '#f9f8f4',

  amber: '#b8712f',
  amberLight: '#c98a48',
  red: '#c1462f',
  redLight: '#d2604a',
  emerald: '#3f7d57',
  emeraldLight: '#579170',

  secondary: '#3f7d57',
  secondaryLight: '#579170',
  orange: '#b8712f',
  orangeLight: '#c98a48',
  primaryLight: '#4a473f',
  muted: '#eeece4',
  border: '#e1ddd0',
  overlay: 'rgba(36,34,32,0.55)',
  inputBg: '#f6f4ef',
};

// ── Dark theme (inverted "ink paper" look) ────────────────────────────────────
const darkColors: ThemeColors = {
  background: '#161512',
  surface: '#1e1c18',
  surface2: '#252219',
  card: '#1e1c18',
  cardBorder: '#332f26',
  borderStrong: '#463f30',

  foreground: '#f2f0ea',
  ink: '#f2f0ea',
  inkSoft: '#d8d4c8',
  mutedForeground: '#9c9587',

  primary: '#f2f0ea',
  primaryForeground: '#1a1917',

  amber: '#d99a52',
  amberLight: '#e6b378',
  red: '#e2735a',
  redLight: '#ea8b74',
  emerald: '#5fae7c',
  emeraldLight: '#7cc296',

  secondary: '#5fae7c',
  secondaryLight: '#7cc296',
  orange: '#d99a52',
  orangeLight: '#e6b378',
  primaryLight: '#d8d4c8',
  muted: '#252219',
  border: '#332f26',
  overlay: 'rgba(0,0,0,0.6)',
  inputBg: '#1e1c18',
};

export const ColorsByMode: Record<ThemeMode, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};

const lightGradients: ThemeGradients = {
  primary: ['#242220', '#3a372f'],
  button: ['#242220', '#1a1917'],
  buttonHover: ['#3a372f', '#242220'],
  emerald: ['#3f7d57', '#356a49'],
  teacher: ['#b8712f', '#c1462f'],
  detail: ['#3a372f', '#242220'],
  cardBg: ['#f6f4ef', '#f6f4ef'],
  heroOverlay: ['rgba(245,243,238,0.35)', 'rgba(245,243,238,0.95)'],
  teacherCard: ['#f6f2ea', '#f6f2ea'],
};

const darkGradients: ThemeGradients = {
  primary: ['#f2f0ea', '#d8d4c8'],
  button: ['#f2f0ea', '#e5e2da'],
  buttonHover: ['#e5e2da', '#f2f0ea'],
  emerald: ['#5fae7c', '#4a9268'],
  teacher: ['#d99a52', '#e2735a'],
  detail: ['#252219', '#1e1c18'],
  cardBg: ['#1e1c18', '#1e1c18'],
  heroOverlay: ['rgba(22,21,18,0.35)', 'rgba(22,21,18,0.95)'],
  teacherCard: ['#211d16', '#211d16'],
};

export const GradientsByMode: Record<ThemeMode, ThemeGradients> = {
  light: lightGradients,
  dark: darkGradients,
};

// Backward-compatible default exports. The app's default theme is DARK,
// so these point at the dark palette. Screens should prefer `useTheme()`
// (see src/context/ThemeContext.tsx) so colors update when the user toggles.
export const Colors = darkColors;
export const Gradients = darkGradients;

export const Typography = {
  heading: 'SpaceGrotesk_700Bold',
  headingMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Shared shadow presets matching the web's --shadow-* tokens (soft, low-contrast)
export const Shadows = {
  sm: { shadowColor: '#242220', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  md: { shadowColor: '#242220', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  lg: { shadowColor: '#242220', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.10, shadowRadius: 24, elevation: 6 },
};