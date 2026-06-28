import React from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, BorderRadius, Spacing } from '../constants/theme';
import type { Teacher } from '../data/teachers';
import {
  XIcon,
  GraduationCapIcon,
  InstagramIcon,
  GithubIcon,
  TwitterIcon,
  YoutubeIcon,
  GlobeIcon,
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
  instagram: '#e1306c',
  github: '#9ba3c0',
  twitter: '#1d9bf0',
  youtube: '#ef4444',
  website: '#7c3aed',
};

function getSocialIcon(platform: string, color: string) {
  const size = 18;
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
  const scale   = useSharedValue(0.88);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  React.useEffect(() => {
    if (teacher) {
      scale.value   = withSpring(1, { damping: 22, stiffness: 280 });
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 280 });
    }
  }, [teacher]);

  const handleClose = () => {
    scale.value   = withSpring(0.92, { damping: 22, stiffness: 280 });
    translateY.value = withTiming(20, { duration: 160 });
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
    ['Umur',          teacher.age && teacher.age > 0 ? `${teacher.age} tahun` : '-'],
    ['Tanggal Lahir', teacher.birthdate ?? '-'],
    ['Mata Pelajaran', teacher.subject ?? '-'],
  ];

  return (
    <Modal
      transparent
      visible={!!teacher}
      onRequestClose={handleClose}
      animationType="none"
    >
      <AnimatedView style={[styles.overlay, overlayStyle]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />

        <AnimatedView style={[styles.box, boxStyle]}>
          {/* Header gradient bar */}
          <LinearGradient
            colors={['rgba(245,158,11,0.35)', 'rgba(239,68,68,0.15)', 'transparent']}
            style={styles.boxHeaderGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <View style={styles.closeBtnInner}>
              <XIcon size={18} color={Colors.foreground} />
            </View>
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            {/* Photo */}
            <View style={styles.photoContainer}>
              <View style={styles.photoRing}>
                <View style={styles.photoWrap}>
                  {teacher.photo ? (
                    <Image source={teacher.photo} style={styles.photo} resizeMode="cover" />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <GraduationCapIcon size={52} color="rgba(251,191,36,0.5)" />
                    </View>
                  )}
                </View>
              </View>
              <LinearGradient
                colors={['rgba(245,158,11,0.4)', 'transparent']}
                style={styles.photoGlow}
              />
            </View>

            <Text style={styles.nameText}>{teacher.fullName}</Text>

            <View style={styles.roleBadge}>
              <LinearGradient
                colors={['rgba(245,158,11,0.2)', 'rgba(239,68,68,0.15)']}
                style={styles.roleBadgeGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <GraduationCapIcon size={14} color={Colors.orange} />
                <Text style={styles.roleText}>{teacher.role}</Text>
              </LinearGradient>
            </View>

            {/* Info cards */}
            <View style={styles.infoGrid}>
              {infoRows.map(([label, value]) => (
                <View key={label} style={[styles.infoCard, label === 'Mata Pelajaran' && styles.infoCardFull]}>
                  <LinearGradient
                    colors={['rgba(245,158,11,0.08)', 'rgba(239,68,68,0.04)']}
                    style={styles.infoCardInner}
                  >
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{value}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>

            {/* Socials */}
            {hasSocials && (
              <View style={styles.socialsSection}>
                <View style={styles.socialsDivider} />
                <Text style={styles.socialsLabel}>SOSIAL MEDIA</Text>
                <View style={styles.socialRow}>
                  {Object.entries(teacher.socials!).map(([platform, handle]) => {
                    if (!handle || handle === '-') return null;
                    const color = socialColors[platform] || Colors.orange;
                    const icon = getSocialIcon(platform, color);
                    if (!icon) return null;
                    return (
                      <TouchableOpacity
                        key={platform}
                        style={[styles.socialBtn, { borderColor: `${color}40`, backgroundColor: `${color}12` }]}
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4,6,20,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  box: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl + 4,
    width: Math.min(SCREEN_W - 32, 420),
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    overflow: 'hidden',
  },
  boxHeaderGrad: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 0,
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 20,
  },
  closeBtnInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: Spacing.lg,
    alignItems: 'center',
    zIndex: 1,
  },
  // Photo
  photoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  photoRing: {
    padding: 3,
    borderRadius: BorderRadius.lg + 3,
    borderWidth: 2,
    borderColor: Colors.orange,
  },
  photoWrap: {
    width: 110,
    height: 140,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.muted,
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245,158,11,0.08)',
  },
  photoGlow: {
    position: 'absolute',
    bottom: -16,
    width: 80,
    height: 30,
    borderRadius: 40,
    alignSelf: 'center',
  },
  nameText: {
    fontFamily: Typography.heading,
    fontSize: 18,
    color: Colors.orange,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  roleBadge: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
    marginBottom: Spacing.lg,
  },
  roleBadgeGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  roleText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 13,
    color: Colors.orangeLight,
  },
  // Info
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    width: '100%',
    marginBottom: Spacing.md,
  },
  infoCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
    minWidth: 120,
  },
  infoCardFull: {
    width: '100%',
    flex: undefined,
    minWidth: '100%',
  },
  infoCardInner: {
    padding: Spacing.sm + 2,
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: Typography.body,
    fontSize: 10,
    color: Colors.mutedForeground,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontFamily: Typography.heading,
    fontSize: 14,
    color: Colors.foreground,
    textAlign: 'center',
  },
  // Socials
  socialsSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  socialsDivider: {
    height: 1,
    backgroundColor: 'rgba(245,158,11,0.2)',
    width: '100%',
    marginBottom: Spacing.md,
  },
  socialsLabel: {
    fontFamily: Typography.bodyMedium,
    fontSize: 10,
    color: Colors.mutedForeground,
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TeacherModal;