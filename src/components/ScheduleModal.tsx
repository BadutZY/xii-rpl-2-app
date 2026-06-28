import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
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
import type { ScheduleDetail } from '../data/schedule';
import { XIcon, GraduationCapIcon, BookOpenIcon } from './Icons';

const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
  isOpen: boolean;
  onClose: () => void;
  details: ScheduleDetail[];
  dayLabel: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const ScheduleModal = ({ isOpen, onClose, details, dayLabel }: Props) => {
  const scale = useSharedValue(0.88);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  React.useEffect(() => {
    if (isOpen) {
      scale.value = withSpring(1, { damping: 22, stiffness: 280 });
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 280 });
    }
  }, [isOpen]);

  const handleClose = () => {
    scale.value = withSpring(0.92, { damping: 22 });
    translateY.value = withTiming(20, { duration: 160 });
    opacity.value = withTiming(0, { duration: 180 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!isOpen) return null;

  return (
    <Modal transparent visible={isOpen} onRequestClose={handleClose} animationType="none">
      <AnimatedView style={[styles.overlay, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
        <AnimatedView style={[styles.box, boxStyle]}>
          {/* Gradient header */}
          <LinearGradient
            colors={['rgba(124,58,237,0.25)', 'rgba(16,185,129,0.15)', 'transparent']}
            style={styles.headerGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconWrap}>
                <BookOpenIcon size={18} color={Colors.secondary} />
              </View>
              <View>
                <Text style={styles.headerSub}>Detail Jadwal</Text>
                <Text style={styles.title}>{dayLabel}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <View style={styles.closeBtnInner}>
                <XIcon size={18} color={Colors.foreground} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.headerDivider} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {details.map((item, idx) => (
              <View key={idx} style={styles.lessonItem}>
                <LinearGradient
                  colors={['rgba(124,58,237,0.08)', 'rgba(16,185,129,0.04)']}
                  style={styles.lessonItemInner}
                >
                  {/* Left accent */}
                  <LinearGradient
                    colors={['#7c3aed', '#10b981']}
                    style={styles.lessonAccentBar}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />

                  <View style={styles.lessonContent}>
                    <View style={styles.subjectBadge}>
                      <Text style={styles.subjectText}>{item.subject}</Text>
                    </View>
                    <View style={styles.teacherRow}>
                      <View style={styles.teacherIconWrap}>
                        <GraduationCapIcon size={15} color={Colors.secondary} />
                      </View>
                      <Text style={styles.teacherText}>{item.teacher}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>

          {/* Count badge */}
          <View style={styles.footer}>
            <LinearGradient colors={['rgba(16,185,129,0.1)', 'rgba(124,58,237,0.08)']} style={styles.footerInner}>
              <Text style={styles.footerText}>{details.length} mata pelajaran</Text>
            </LinearGradient>
          </View>
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
    width: Math.min(SCREEN_W - 32, 480),
    maxHeight: '82%',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  headerGrad: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  headerSub: {
    fontFamily: Typography.body,
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  title: {
    fontFamily: Typography.heading,
    fontSize: 18,
    color: Colors.secondary,
  },
  closeBtn: {
    marginLeft: Spacing.sm,
    zIndex: 1,
  },
  closeBtnInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
  },
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  lessonItem: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  lessonItemInner: {
    flexDirection: 'row',
    padding: Spacing.md,
  },
  lessonAccentBar: {
    width: 4,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  lessonContent: {
    flex: 1,
    gap: Spacing.sm,
  },
  subjectBadge: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  subjectText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 13,
    color: Colors.secondaryLight,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  teacherIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16,185,129,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherText: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.foreground,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerInner: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.mutedForeground,
  },
});

export default ScheduleModal;