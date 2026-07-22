import React, { useMemo } from 'react';
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
import { Typography, BorderRadius, Spacing, type ThemeColors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
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
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  React.useEffect(() => {
    if (isOpen) {
      scale.value = withSpring(1, { damping: 22, stiffness: 280 });
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 280 });
    }
  }, [isOpen]);

  const handleClose = () => {
    scale.value = withSpring(0.94, { damping: 22 });
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

  if (!isOpen) return null;

  return (
    <Modal transparent visible={isOpen} onRequestClose={handleClose} animationType="none">
      <AnimatedView style={[styles.overlay, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
        <AnimatedView style={[styles.box, boxStyle]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconWrap}>
                <BookOpenIcon size={17} color={colors.foreground} />
              </View>
              <View>
                <Text style={styles.headerSub}>Detail Jadwal</Text>
                <Text style={styles.title}>{dayLabel}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <View style={styles.closeBtnInner}>
                <XIcon size={17} color={colors.foreground} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.headerDivider} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {details.map((item, idx) => (
              <View key={idx} style={styles.lessonItem}>
                <View style={styles.lessonAccentBar} />
                <View style={styles.lessonContent}>
                  <View style={styles.subjectBadge}>
                    <Text style={styles.subjectText}>{item.subject}</Text>
                  </View>
                  <View style={styles.teacherRow}>
                    <View style={styles.teacherIconWrap}>
                      <GraduationCapIcon size={14} color={colors.mutedForeground} />
                    </View>
                    <Text style={styles.teacherText}>{item.teacher}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{details.length} mata pelajaran</Text>
          </View>
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
    width: Math.min(SCREEN_W - 32, 480),
    maxHeight: '82%',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  headerIconWrap: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.surface2,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  headerSub: { fontFamily: Typography.body, fontSize: 10.5, color: colors.mutedForeground },
  title: { fontFamily: Typography.heading, fontSize: 18, color: colors.foreground },
  closeBtn: { marginLeft: Spacing.sm },
  closeBtnInner: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  headerDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: Spacing.lg },
  scroll: { padding: Spacing.lg, gap: Spacing.sm },
  lessonItem: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  lessonAccentBar: { width: 3, borderRadius: 2, marginRight: Spacing.md, backgroundColor: colors.foreground },
  lessonContent: { flex: 1, gap: Spacing.sm },
  subjectBadge: {
    backgroundColor: colors.surface2,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12, paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  subjectText: { fontFamily: Typography.bodyMedium, fontSize: 13, color: colors.foreground },
  teacherRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  teacherIconWrap: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  teacherText: { fontFamily: Typography.body, fontSize: 13, color: colors.foreground, flex: 1, lineHeight: 20 },
  footer: { borderTopWidth: 1, borderTopColor: colors.border },
  footerText: {
    fontFamily: Typography.body, fontSize: 12, color: colors.mutedForeground,
    textAlign: 'center', paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.lg,
  },
});

export default ScheduleModal;