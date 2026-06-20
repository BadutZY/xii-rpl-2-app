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
import { Colors, Typography, BorderRadius, Spacing } from '../constants/theme';
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

function getSocialIcon(platform: string) {
  const size = 18;
  const color = Colors.foreground;
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
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (student) {
      scale.value = withSpring(1, { damping: 25, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 180 });
    }
  }, [student]);

  const handleClose = () => {
    scale.value = withSpring(0.92, { damping: 25, stiffness: 300 });
    opacity.value = withTiming(0, { duration: 150 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!student) return null;

  const hasSocials = Object.values(student.socials).some((h) => h && h !== '-');

  return (
    <Modal transparent visible={!!student} onRequestClose={handleClose} animationType="none">
      <AnimatedView style={[styles.overlay, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
        <AnimatedView style={[styles.box, boxStyle]}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <XIcon size={22} color={Colors.mutedForeground} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Photo */}
            <View style={styles.photoWrap}>
              {student.photo ? (
                <Image source={student.photo} style={styles.photo} resizeMode="cover" />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <PersonIcon size={48} color={`${Colors.mutedForeground}50`} />
                </View>
              )}
            </View>

            <Text style={styles.nameText}>{student.fullName}</Text>
            <Text style={styles.positionText}>{student.position}</Text>

            {/* Info table */}
            <View style={styles.infoTable}>
              {[
                ['Nomor Absen', student.no],
                ['Umur', student.age > 0 ? `${student.age} tahun` : '-'],
                ['Tanggal Lahir', student.birthdate],
                ['Kredit Poin', student.kreditPoin],
              ].map(([label, value]) => (
                <View key={label} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoColon}>:</Text>
                  <Text style={styles.infoValue}>{value}</Text>
                </View>
              ))}
            </View>

            {/* Socials */}
            {hasSocials && (
              <View style={styles.socialsSection}>
                <Text style={styles.socialsLabel}>SOSIAL MEDIA</Text>
                <View style={styles.socialRow}>
                  {Object.entries(student.socials).map(([platform, handle]) => {
                    if (!handle || handle === '-') return null;
                    const icon = getSocialIcon(platform);
                    if (!icon) return null;
                    return (
                      <TouchableOpacity
                        key={platform}
                        style={styles.socialBtn}
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
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  box: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    width: Math.min(SCREEN_W - 32, 420),
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
    padding: 4,
  },
  scroll: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  photoWrap: {
    width: 100,
    height: 128,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
    backgroundColor: Colors.muted,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.muted,
  },
  nameText: {
    fontFamily: Typography.heading,
    fontSize: 16,
    color: Colors.primaryLight,
    marginBottom: 4,
    textAlign: 'center',
  },
  positionText: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  infoTable: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.mutedForeground,
    width: 110,
  },
  infoColon: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.mutedForeground,
    marginHorizontal: 6,
  },
  infoValue: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.foreground,
    flex: 1,
  },
  socialsSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  socialsLabel: {
    fontFamily: Typography.body,
    fontSize: 10,
    color: Colors.mutedForeground,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StudentModal;
