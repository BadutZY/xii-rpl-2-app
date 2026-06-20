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
    case 'github': return `https://github.com/${c}`;
    case 'twitter': return `https://x.com/${c}`;
    case 'youtube': return `https://www.youtube.com/@${c}`;
    case 'website': return `https://${c}`;
    default: return handle;
  }
}

function getSocialIcon(platform: string, color: string) {
  const size = 18;
  switch (platform) {
    case 'instagram': return <InstagramIcon size={size} color={color} />;
    case 'github': return <GithubIcon size={size} color={color} />;
    case 'twitter': return <TwitterIcon size={size} color={color} />;
    case 'youtube': return <YoutubeIcon size={size} color={color} />;
    case 'website': return <GlobeIcon size={size} color={color} />;
    default: return null;
  }
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const TeacherModal = ({ teacher, onClose }: Props) => {
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (teacher) {
      scale.value = withSpring(1, { damping: 25, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 180 });
    }
  }, [teacher]);

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

  if (!teacher) return null;

  const hasSocials =
    teacher.socials != null &&
    Object.values(teacher.socials).some((h) => h && h !== '-');

  return (
    <Modal transparent visible={!!teacher} onRequestClose={handleClose} animationType="none">
      <AnimatedView style={[styles.overlay, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
        <AnimatedView style={[styles.box, boxStyle]}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <XIcon size={22} color={Colors.mutedForeground} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Photo */}
            <View style={styles.photoWrap}>
              {teacher.photo ? (
                <Image source={teacher.photo} style={styles.photo} resizeMode="cover" />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <GraduationCapIcon size={52} color="rgba(251,191,36,0.5)" />
                </View>
              )}
            </View>

            <Text style={styles.nameText}>{teacher.fullName}</Text>
            <Text style={styles.roleText}>{teacher.role}</Text>

            <View style={styles.infoTable}>
              {[
                ['Umur', teacher.age && teacher.age > 0 ? `${teacher.age} tahun` : '-'],
                ['Tanggal Lahir', teacher.birthdate],
                ['Mata Pelajaran', teacher.subject],
              ].map(([label, value]) => (
                <View key={label} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoColon}>:</Text>
                  <Text style={styles.infoValue}>{value}</Text>
                </View>
              ))}
            </View>

            {hasSocials && (
              <View style={styles.socialsSection}>
                <Text style={styles.socialsLabel}>SOSIAL MEDIA</Text>
                <View style={styles.socialRow}>
                  {Object.entries(teacher.socials!).map(([platform, handle]) => {
                    if (!handle || handle === '-') return null;
                    const icon = getSocialIcon(platform, Colors.foreground);
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
    borderColor: 'rgba(245,158,11,0.3)',
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
    borderColor: 'rgba(245,158,11,0.4)',
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
    backgroundColor: 'rgba(245,158,11,0.08)',
  },
  nameText: {
    fontFamily: Typography.heading,
    fontSize: 17,
    color: Colors.orange,
    marginBottom: 4,
    textAlign: 'center',
  },
  roleText: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.orangeLight,
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
    borderColor: 'rgba(245,158,11,0.3)',
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TeacherModal;
