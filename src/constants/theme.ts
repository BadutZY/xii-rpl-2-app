// Design tokens matching the web version exactly

export const Colors = {
  background: '#171a2e',
  card: '#1e2240',
  cardBorder: 'rgba(120, 60, 210, 0.25)',
  foreground: '#fbfbff',
  primary: '#7c3aed',       // hsl(263 70% 50%)
  primaryLight: '#a78bfa',
  secondary: '#10b981',     // hsl(160 84% 39%)
  secondaryLight: '#6ee7b7',
  muted: '#252843',
  mutedForeground: '#9ba3c0',
  border: '#2d3158',
  orange: '#f59e0b',
  orangeLight: '#fbbf24',
  overlay: 'rgba(8, 11, 28, 0.88)',
  inputBg: '#1e2240',
};

export const Gradients = {
  primary: ['#7c3aed', '#10b981'] as const,
  button: ['#6d28d9', '#5b21b6'] as const,
  buttonHover: ['#7c3aed', '#6d28d9'] as const,
  emerald: ['#059669', '#047857'] as const,
  teacher: ['#f59e0b', '#ef4444'] as const,
  detail: ['#6d28d9', '#059669'] as const,
  cardBg: ['rgba(120,60,210,0.08)', 'rgba(16,185,129,0.04)'] as const,
  heroOverlay: ['rgba(10,14,40,0.82)', 'rgba(8,11,28,0.92)'] as const,
  teacherCard: ['rgba(245,158,11,0.10)', 'rgba(239,68,68,0.05)'] as const,
};

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
