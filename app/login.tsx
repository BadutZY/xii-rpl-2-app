import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, Spacing, BorderRadius, Shadows, type ThemeColors } from '../src/constants/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import {
  LogInIcon,
  LockIcon,
  PersonIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowLeftIcon,
  AlertTriangleIcon,
} from '../src/components/Icons';

const { width: SCREEN_W } = Dimensions.get('window');

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { session, loading, signIn } = useAuth();

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [focusedField, setFocusedField] = React.useState<'username' | 'password' | null>(null);

  useEffect(() => {
    if (!loading && session) {
      router.replace('/profile');
    }
  }, [loading, session]);

  // Shared value that drives a subtle shake on the error banner so a wrong
  // login attempt feels acknowledged instead of just silently appearing.
  const errorShake = useSharedValue(0);

  const triggerShake = () => {
    errorShake.value = withSequence(
      withTiming(-6, { duration: 45 }),
      withTiming(6, { duration: 90 }),
      withTiming(-4, { duration: 90 }),
      withTiming(0, { duration: 70 }),
    );
  };

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      setError('Username dan password wajib diisi.');
      triggerShake();
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await signIn(username, password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError);
      triggerShake();
      return;
    }
    router.replace('/profile');
  };

  const errorAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }],
  }));

  // ── Ambient floating glow orbs behind the card — slow, looping, subtle ──
  const orbA = useSharedValue(0);
  const orbB = useSharedValue(0);
  useEffect(() => {
    orbA.value = withRepeat(
      withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    orbB.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);
  const orbAStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -18 + orbA.value * 36 },
      { translateX: -10 + orbA.value * 20 },
    ],
  }));
  const orbBStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: 14 - orbB.value * 28 },
      { translateX: 8 - orbB.value * 16 },
    ],
  }));

  // ── Gentle continuous "breathing" halo behind the logo ──
  const logoPulse = useSharedValue(0);
  useEffect(() => {
    logoPulse.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);
  const logoHaloStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + logoPulse.value * 0.25,
    transform: [{ scale: 1 + logoPulse.value * 0.12 }],
  }));

  const styles = makeStyles(colors, isDark);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Ambient background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <AnimatedView
          style={[
            styles.orb,
            {
              top: -SCREEN_W * 0.35,
              left: -SCREEN_W * 0.2,
              backgroundColor: isDark ? 'rgba(217,154,82,0.12)' : 'rgba(184,113,47,0.10)',
            },
            orbAStyle,
          ]}
        />
        <AnimatedView
          style={[
            styles.orb,
            {
              bottom: -SCREEN_W * 0.3,
              right: -SCREEN_W * 0.25,
              backgroundColor: isDark ? 'rgba(95,174,124,0.10)' : 'rgba(63,125,87,0.08)',
            },
            orbBStyle,
          ]}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.wrap}>
            {/* Logo mark with breathing halo */}
            <View style={styles.logoZone}>
              <AnimatedView style={[styles.logoHalo, logoHaloStyle]} />
              <Animated.View
                entering={FadeIn.duration(500)}
                style={styles.logoBadge}
              >
                <Image source={require('../assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
              </Animated.View>
            </View>

            <Animated.Text entering={FadeInDown.delay(80).duration(400)} style={styles.title}>
              Masuk
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(130).duration(400)} style={styles.brandLabel}>
              XII RPL 2
            </Animated.Text>

            {/* Card */}
            <Animated.View entering={FadeInDown.delay(180).duration(450)} style={styles.card}>
              <LoginField colors={colors} label="Username" focused={focusedField === 'username'}>
                <PersonIcon
                  size={16}
                  color={focusedField === 'username' ? colors.foreground : colors.mutedForeground}
                />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Username"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitting}
                  returnKeyType="next"
                  style={[styles.input, { color: colors.foreground }]}
                />
              </LoginField>

              <LoginField colors={colors} label="Password" focused={focusedField === 'password'}>
                <LockIcon
                  size={16}
                  color={focusedField === 'password' ? colors.foreground : colors.mutedForeground}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Password"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!submitting}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  style={[styles.input, { color: colors.foreground }]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={10}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <EyeOffIcon size={16} color={colors.mutedForeground} />
                  ) : (
                    <EyeIcon size={16} color={colors.mutedForeground} />
                  )}
                </TouchableOpacity>
              </LoginField>

              {error && (
                <AnimatedView entering={FadeIn.duration(180)} style={[styles.errorBox, errorAnimStyle]}>
                  <AlertTriangleIcon size={14} color={colors.red} />
                  <Text style={styles.errorText}>{error}</Text>
                </AnimatedView>
              )}

              <PressableScale onPress={handleSubmit} disabled={submitting} style={styles.submitBtnWrap}>
                <LinearGradient
                  colors={isDark ? ['#f2f0ea', '#e2ded2'] : ['#242220', '#3a372f']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.submitBtn, submitting && { opacity: 0.85 }]}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={colors.primaryForeground} />
                  ) : (
                    <LogInIcon size={16} color={colors.primaryForeground} />
                  )}
                  <Text style={styles.submitLabel}>{submitting ? 'Memeriksa...' : 'Masuk'}</Text>
                </LinearGradient>
              </PressableScale>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(320).duration(400)}>
              <TouchableOpacity
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                style={styles.backBtn}
                hitSlop={8}
              >
                <ArrowLeftIcon size={13} color={colors.mutedForeground} />
                <Text style={styles.backLabel}>Kembali ke beranda</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/**
 * A labeled input row whose border/background smoothly animates between the
 * resting and focused state instead of snapping instantly, so the form feels
 * closer to a native, polished login page.
 */
function LoginField({
  colors,
  label,
  focused,
  children,
}: {
  colors: ThemeColors;
  label: string;
  focused: boolean;
  children: React.ReactNode;
}) {
  const progress = useSharedValue(focused ? 1 : 0);
  React.useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: 200, easing: Easing.out(Easing.quad) });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      borderColor: interpolateColor(progress.value, [0, 1], [colors.cardBorder, colors.borderStrong]),
      backgroundColor: interpolateColor(progress.value, [0, 1], [colors.inputBg, colors.surface2]),
      transform: [{ scale: 1 + progress.value * 0.012 }],
    }),
    [colors],
  );

  return (
    <View style={{ marginBottom: Spacing.md, alignSelf: 'stretch' }}>
      <Text style={{ fontFamily: Typography.bodyMedium, fontSize: 11.5, color: colors.mutedForeground, marginBottom: 6 }}>
        {label}
      </Text>
      <AnimatedView style={[fieldBaseStyle, animatedStyle]}>{children}</AnimatedView>
    </View>
  );
}

const fieldBaseStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 10,
  borderWidth: 1,
  borderRadius: BorderRadius.md,
  paddingHorizontal: 14,
  height: 48,
};

/** Wraps a touchable with a gentle press-in scale so buttons feel tactile. */
function PressableScale({
  onPress,
  disabled,
  style,
  children,
}: {
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedTouchable
      activeOpacity={1}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 100 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 260 });
      }}
      onPress={onPress}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedTouchable>
  );
}

const makeStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    orb: {
      position: 'absolute',
      width: SCREEN_W * 0.9,
      height: SCREEN_W * 0.9,
      borderRadius: SCREEN_W * 0.45,
    },
    wrap: {
      paddingHorizontal: Spacing.lg,
      alignItems: 'center',
    },
    logoZone: {
      width: 84,
      height: 84,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    logoHalo: {
      position: 'absolute',
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: colors.amber,
    },
    logoBadge: {
      width: 64,
      height: 64,
      borderRadius: BorderRadius.lg,
      backgroundColor: '#ffffff',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      ...Shadows.md,
    },
    logoImg: {
      width: '100%',
      height: '100%',
    },
    title: {
      fontFamily: Typography.heading,
      fontSize: 26,
      color: colors.foreground,
      textAlign: 'center',
    },
    brandLabel: {
      fontFamily: Typography.bodyMedium,
      fontSize: 11,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: colors.mutedForeground,
      marginTop: 4,
      marginBottom: Spacing.xl,
    },
    card: {
      alignSelf: 'stretch',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      ...Shadows.lg,
    },
    input: {
      flex: 1,
      fontFamily: Typography.body,
      fontSize: 14,
      height: '100%',
    },
    eyeBtn: {
      padding: 4,
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      alignSelf: 'stretch',
      borderWidth: 1,
      borderColor: 'rgba(193,70,47,0.3)',
      backgroundColor: 'rgba(193,70,47,0.08)',
      borderRadius: BorderRadius.sm,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: Spacing.sm,
    },
    errorText: {
      flex: 1,
      fontFamily: Typography.bodyMedium,
      fontSize: 12,
      color: colors.red,
      lineHeight: 16,
    },
    submitBtnWrap: {
      alignSelf: 'stretch',
      marginTop: 4,
      borderRadius: BorderRadius.md,
      ...Shadows.md,
    },
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: BorderRadius.md,
      height: 48,
    },
    submitLabel: {
      fontFamily: Typography.bodyMedium,
      fontSize: 14,
      color: colors.primaryForeground,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: Spacing.lg,
      paddingVertical: 8,
    },
    backLabel: {
      fontFamily: Typography.bodyMedium,
      fontSize: 12,
      color: colors.mutedForeground,
    },
  });