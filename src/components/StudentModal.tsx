import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Linking,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Typography, BorderRadius, Spacing, type ThemeColors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import type { Student } from '../data/students';
import {
  XIcon,
  PersonIcon,
  InstagramIcon,
  GithubIcon,
  TwitterIcon,
  YoutubeIcon,
  GlobeIcon,
  GamepadIcon,
} from './Icons';

const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
  student: Student | null;
  onClose: () => void;
}

function getSocialUrl(platform: string, handle: string): string {
  if (handle.startsWith('http')) return handle;
  const c = handle.replace('@', '');
  switch (platform) {
    case 'instagram': return `https://www.instagram.com/${c}/`;
    case 'github': return `https://github.com/${c}`;
    case 'twitter': return `https://x.com/${c}`;
    case 'youtube': return `https://www.youtube.com/@${c}`;
    case 'website': return `https://${c}`;
    default: return handle;
  }
}

const socialColors: Record<string, string> = {
  instagram: '#c1462f',
  github: '#4a473f',
  twitter: '#2f6fa8',
  youtube: '#c1462f',
  game: '#3f7d57',
  website: '#242220',
};

function getSocialIcon(platform: string, color: string) {
  const size = 17;
  switch (platform) {
    case 'instagram': return <InstagramIcon size={size} color={color} />;
    case 'github': return <GithubIcon size={size} color={color} />;
    case 'twitter': return <TwitterIcon size={size} color={color} />;
    case 'youtube': return <YoutubeIcon size={size} color={color} />;
    case 'game': return <GamepadIcon size={size} color={color} />;
    case 'website': return <GlobeIcon size={size} color={color} />;
    default: return null;
  }
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const StudentModal = ({ student, onClose }: Props) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  React.useEffect(() => {
    if (student) {
      scale.value = withSpring(1, { damping: 22, stiffness: 280 });
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 280 });
    }
  }, [student]);

  const handleClose = () => {
    scale.value = withSpring(0.94, { damping: 22, stiffness: 280 });
    translateY.value = withTiming(16, { duration: 160 });
    opacity.value = withTiming(0, { duration: 180 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!student) return null;

  const hasSocials = Object.values(student.socials).some((h) => h && h !== '-');

  const infoRows: [string, string | number][] = [
    ['Nomor Absen', student.no],
    ['Umur', student.age > 0 ? `${student.age} tahun` : '-'],
    ['Tanggal Lahir', student.birthdate],
  ];

  return (
    <Modal transparent visible={!!student} onRequestClose={handleClose} animationType="none">
      <AnimatedView style={[styles.overlay, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
        <AnimatedView style={[styles.box, boxStyle]}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <View style={styles.closeBtnInner}>
              <XIcon size={17} color={colors.foreground} />
            </View>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.photoContainer}>
              <View style={styles.photoWrap}>
                {student.photo ? (
                  <Image source={student.photo} style={styles.photo} resizeMode="cover" />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <PersonIcon size={48} color={colors.mutedForeground} />
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.nameText}>{student.fullName}</Text>

            <View style={styles.positionBadge}>
              <Text style={styles.positionText}>
                {student.position && student.position !== '-' ? student.position : 'Anggota'}
              </Text>
            </View>

            <View style={styles.infoGrid}>
              {infoRows.map(([label, value], idx) => {
                const isLastOdd = infoRows.length % 2 === 1 && idx === infoRows.length - 1;
                return (
                  <View key={label} style={[styles.infoCard, isLastOdd && styles.infoCardFull]}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{value}</Text>
                  </View>
                );
              })}
            </View>

            {hasSocials && (
              <View style={styles.socialsSection}>
                <View style={styles.socialsDivider} />
                <Text style={styles.socialsLabel}>SOSIAL MEDIA</Text>
                <View style={styles.socialRow}>
                  {Object.entries(student.socials).map(([platform, handle]) => {
                    if (!handle || handle === '-') return null;
                    const color = socialColors[platform] || colors.foreground;
                    const icon = getSocialIcon(platform, color);
                    if (!icon) return null;
                    return (
                      <TouchableOpacity
                        key={platform}
                        style={[styles.socialBtn, { borderColor: `${color}40` }]}
                        onPress={() => Linking.openURL(getSocialUrl(platform, handle))}
                      >
                        {icon}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>
        </AnimatedView>
      </AnimatedView>
    </Modal>
  );
};

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  box: {
    backgroundColor: colors.background,
    borderRadius: BorderRadius.xl + 4,
    width: Math.min(SCREEN_W - 32, 420),
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  closeBtn: { position: 'absolute', top: Spacing.md, right: Spacing.md, zIndex: 20 },
  closeBtnInner: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { padding: Spacing.lg, alignItems: 'center' },

  photoContainer: { alignItems: 'center', marginBottom: Spacing.md, marginTop: Spacing.xs },
  photoWrap: {
    width: 110, height: 140,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface2,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },

  nameText: {
    fontFamily: Typography.heading,
    fontSize: 18,
    color: colors.foreground,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  positionBadge: {
    borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14, paddingVertical: 5,
    marginBottom: Spacing.lg,
  },
  positionText: { fontFamily: Typography.bodyMedium, fontSize: 12.5, color: colors.mutedForeground, textAlign: 'center' },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, width: '100%', marginBottom: Spacing.md },
  infoCard: {
    width: '47%', flex: 1, minWidth: 120,
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
    padding: Spacing.sm + 2,
    alignItems: 'center',
  },
  infoLabel: { fontFamily: Typography.body, fontSize: 9.5, color: colors.mutedForeground, textAlign: 'center', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' },
  infoValue: { fontFamily: Typography.heading, fontSize: 14, color: colors.foreground, textAlign: 'center' },
  infoCardFull: { width: '100%', flex: undefined, minWidth: '100%' },

  socialsSection: { width: '100%', alignItems: 'center', marginTop: 4 },
  socialsDivider: { height: 1, backgroundColor: colors.border, width: '100%', marginBottom: Spacing.md },
  socialsLabel: { fontFamily: Typography.bodyMedium, fontSize: 10, color: colors.mutedForeground, letterSpacing: 1.5, marginBottom: Spacing.md },
  socialRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  socialBtn: {
    width: 42, height: 42, borderRadius: BorderRadius.md,
    borderWidth: 1, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
});

export default StudentModal;