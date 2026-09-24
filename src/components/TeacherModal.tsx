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
import type { Teacher } from '../data/teachers';
import { toImageSource } from '../lib/imageSource';
import {
  XIcon,
  GraduationCapIcon,
  InstagramIcon,
  GithubIcon,
  TwitterIcon,
  YoutubeIcon,
  GlobeIcon,
  QuoteIcon,
} from './Icons';

const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
  teacher: Teacher | null;
  onClose: () => void;
}

function getSocialUrl(platform: string, handle: string): string {
  if (handle.startsWith('http')) return handle;
  const c = handle.replace('@', '');
  switch (platform) {
    case 'instagram': return `https://www.instagram.com/${c}/`;
    case 'github':    return `https://github.com/${c}`;
    case 'twitter':   return `https://x.com/${c}`;
    case 'youtube':   return `https://www.youtube.com/@${c}`;
    case 'website':   return `https://${c}`;
    default:          return handle;
  }
}

const socialColors: Record<string, string> = {
  instagram: '#c1462f',
  github: '#4a473f',
  twitter: '#2f6fa8',
  youtube: '#c1462f',
  website: '#b8712f',
};

function getSocialIcon(platform: string, color: string) {
  const size = 17;
  switch (platform) {
    case 'instagram': return <InstagramIcon size={size} color={color} />;
    case 'github':    return <GithubIcon size={size} color={color} />;
    case 'twitter':   return <TwitterIcon size={size} color={color} />;
    case 'youtube':   return <YoutubeIcon size={size} color={color} />;
    case 'website':   return <GlobeIcon size={size} color={color} />;
    default:          return null;
  }
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const TeacherModal = ({ teacher, onClose }: Props) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const scale   = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  React.useEffect(() => {
    if (teacher) {
      scale.value   = withSpring(1, { damping: 22, stiffness: 280 });
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 280 });
    }
  }, [teacher]);

  const handleClose = () => {
    scale.value   = withSpring(0.94, { damping: 22, stiffness: 280 });
    translateY.value = withTiming(16, { duration: 160 });
    opacity.value = withTiming(0, { duration: 180 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const boxStyle     = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!teacher) return null;

  const hasSocials =
    teacher.socials != null &&
    Object.values(teacher.socials).some((h) => h && h !== '-');

  const infoRows: [string, string][] = [
    ['Umur',           teacher.age && teacher.age > 0 ? `${teacher.age} tahun` : '-'],
    ['Tanggal Lahir',  teacher.birthdate ?? '-'],
    ['Mata Pelajaran', teacher.subject ?? '-'],
  ];

  return (
    <Modal transparent visible={!!teacher} onRequestClose={handleClose} animationType="none">
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
                {teacher.photo ? (
                  <Image source={toImageSource(teacher.photo)} style={styles.photo} resizeMode="cover" />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <GraduationCapIcon size={48} color={colors.amber} />
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.nameText}>{teacher.fullName}</Text>

            <View style={styles.roleBadge}>
              <GraduationCapIcon size={13} color={colors.amber} />
              <Text style={styles.roleText}>{teacher.role}</Text>
            </View>

            {!!(teacher as { bio?: string | null }).bio && (
              <View style={styles.bioCard}>
                <View style={styles.bioQuoteIcon}>
                  <QuoteIcon size={13} color={colors.amber} strokeWidth={2.4} />
                </View>
                <Text style={styles.bioText}>
                  {(teacher as { bio?: string | null }).bio}
                </Text>
                <Text style={styles.bioCaption}>Bio pribadi · diatur oleh {teacher.fullName.split(' ')[0]}</Text>
              </View>
            )}

            <View style={styles.infoGrid}>
              {infoRows.map(([label, value]) => (
                <View key={label} style={[styles.infoCard, label === 'Mata Pelajaran' && styles.infoCardFull]}>
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoValue}>{value}</Text>
                </View>
              ))}
            </View>

            {hasSocials && (
              <View style={styles.socialsSection}>
                <View style={styles.socialsDivider} />
                <Text style={styles.socialsLabel}>SOSIAL MEDIA</Text>
                <View style={styles.socialRow}>
                  {Object.entries(teacher.socials!).map(([platform, handle]) => {
                    if (!handle || handle === '-') return null;
                    const color = socialColors[platform] || colors.amber;
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

  bioCard: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm + 2,
    paddingBottom: Spacing.sm + 4,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bioQuoteIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
    marginBottom: 6,
  },
  bioText: {
    fontFamily: Typography.body,
    fontStyle: 'italic',
    fontSize: 12.5,
    lineHeight: 18.5,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  bioCaption: {
    fontFamily: Typography.bodyMedium,
    fontSize: 9.5,
    letterSpacing: 0.4,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginTop: 8,
    textTransform: 'uppercase',
  },
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

  nameText: { fontFamily: Typography.heading, fontSize: 18, color: colors.foreground, marginBottom: Spacing.sm, textAlign: 'center' },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14, paddingVertical: 6,
    marginBottom: Spacing.lg,
  },
  roleText: { fontFamily: Typography.bodyMedium, fontSize: 12.5, color: colors.amber },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, width: '100%', marginBottom: Spacing.md },
  infoCard: {
    flex: 1, minWidth: 120,
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
    padding: Spacing.sm + 2,
    alignItems: 'center',
  },
  infoCardFull: { width: '100%', flex: undefined, minWidth: '100%' },
  infoLabel: { fontFamily: Typography.body, fontSize: 9.5, color: colors.mutedForeground, textAlign: 'center', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' },
  infoValue: { fontFamily: Typography.heading, fontSize: 14, color: colors.foreground, textAlign: 'center' },

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

export default TeacherModal;