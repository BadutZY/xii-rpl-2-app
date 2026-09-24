import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Typography, BorderRadius, Spacing, Shadows, type ThemeColors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_W } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);

interface Props {
  visible: boolean;
  title: string;
  message: string;
  icon?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as a destructive action (red) */
  danger?: boolean;
  /** Shows a spinner in the confirm button and disables both actions */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A themed, animated replacement for React Native's built-in `Alert.alert`.
 * Matches the same visual language as StudentModal / TeacherModal so
 * confirmation dialogs (logout, delete, etc.) feel native to the app
 * instead of falling back to the plain OS alert box.
 */
export const ConfirmModal = ({
  visible,
  title,
  message,
  icon,
  confirmLabel = 'Ya, lanjutkan',
  cancelLabel = 'Batal',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors, danger), [colors, danger]);

  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(18);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 20, stiffness: 280 });
      opacity.value = withTiming(1, { duration: 180 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 280 });
    }
  }, [visible]);

  const dismiss = (callback: () => void) => {
    if (loading) return;
    scale.value = withSpring(0.95, { damping: 20, stiffness: 300 });
    translateY.value = withTiming(10, { duration: 140 });
    opacity.value = withTiming(0, { duration: 160 }, (finished) => {
      if (finished) runOnJS(callback)();
    });
  };

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={() => dismiss(onCancel)}>
      <AnimatedView style={[styles.overlay, overlayStyle]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => dismiss(onCancel)}
        />
        <AnimatedView style={[styles.box, boxStyle]}>
          {icon && <View style={styles.iconCircle}>{icon}</View>}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => dismiss(onCancel)}
              disabled={loading}
              activeOpacity={0.8}
              style={[styles.cancelBtn, loading && styles.disabled]}
            >
              <Text style={styles.cancelLabel}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.85}
              style={[styles.confirmBtn, loading && styles.disabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={danger ? '#ffffff' : colors.primaryForeground} />
              ) : (
                <Text style={styles.confirmLabel}>{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </AnimatedView>
      </AnimatedView>
    </Modal>
  );
};

const makeStyles = (colors: ThemeColors, danger: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.lg,
    },
    box: {
      width: Math.min(SCREEN_W - 56, 360),
      backgroundColor: colors.background,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg + 6,
      paddingBottom: Spacing.lg,
      alignItems: 'center',
      ...Shadows.lg,
    },
    iconCircle: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: danger ? `${colors.red}1F` : colors.surface2,
      borderWidth: 1,
      borderColor: danger ? `${colors.red}40` : colors.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    title: {
      fontFamily: Typography.heading,
      fontSize: 17.5,
      color: colors.foreground,
      marginBottom: 6,
      textAlign: 'center',
    },
    message: {
      fontFamily: Typography.body,
      fontSize: 13,
      lineHeight: 19.5,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginBottom: Spacing.lg,
      maxWidth: 280,
    },
    actions: {
      flexDirection: 'row',
      gap: Spacing.sm,
      width: '100%',
    },
    disabled: { opacity: 0.6 },
    cancelBtn: {
      flex: 1,
      height: 46,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelLabel: {
      fontFamily: Typography.bodyMedium,
      fontSize: 13.5,
      color: colors.foreground,
    },
    confirmBtn: {
      flex: 1,
      height: 46,
      borderRadius: BorderRadius.md,
      backgroundColor: danger ? colors.red : colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.sm,
    },
    confirmLabel: {
      fontFamily: Typography.bodyMedium,
      fontSize: 13.5,
      color: danger ? '#ffffff' : colors.primaryForeground,
    },
  });

export default ConfirmModal;