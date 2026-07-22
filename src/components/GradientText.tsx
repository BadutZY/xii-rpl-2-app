// GradientText: renders text with a gradient color using a simple
// LinearGradient background + clipping approach that works without
// @react-native-masked-view (which requires extra native setup).
// For simplicity in this project, we use the primary color directly.
// The visual result is close to the web gradient text.

import React from 'react';
import { Text, TextStyle, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface GradientTextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  variant?: 'primary' | 'teacher';
}

export const GradientText = ({ children, style, variant = 'primary' }: GradientTextProps) => {
  const { colors } = useTheme();
  const color = variant === 'teacher' ? colors.orange : colors.primary;
  return (
    <Text style={[style, { color }]}>{children}</Text>
  );
};

export default GradientText;