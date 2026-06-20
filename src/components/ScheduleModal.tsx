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
import { Colors, Typography, BorderRadius, Spacing } from '../constants/theme';
import type { ScheduleDetail } from '../data/schedule';
import { XIcon, GraduationCapIcon } from './Icons';

const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
  isOpen: boolean;
  onClose: () => void;
  details: ScheduleDetail[];
  dayLabel: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const ScheduleModal = ({ isOpen, onClose, details, dayLabel }: Props) => {
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (isOpen) {
      scale.value = withSpring(1, { damping: 25, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 180 });
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <Modal transparent visible={isOpen} onRequestClose={handleClose} animationType="none">
      <AnimatedView style={[styles.overlay, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
        <AnimatedView style={[styles.box, boxStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>Detail Jadwal {dayLabel}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <XIcon size={22} color={Colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {details.map((item, idx) => (
              <View key={idx} style={styles.lessonItem}>
                <View style={styles.subjectBadge}>
                  <Text style={styles.subjectText}>{item.subject}</Text>
                </View>
                <View style={styles.teacherRow}>
                  <GraduationCapIcon size={18} color={Colors.secondary} />
                  <Text style={styles.teacherText}>{item.teacher}</Text>
                </View>
              </View>
            ))}
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
    width: Math.min(SCREEN_W - 32, 480),
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontFamily: Typography.heading,
    fontSize: 17,
    color: Colors.primary,
    flex: 1,
  },
  closeBtn: {
    padding: 4,
    marginLeft: Spacing.sm,
  },
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  lessonItem: {
    backgroundColor: Colors.muted,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  subjectBadge: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  subjectText: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.secondaryLight,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  teacherText: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.foreground,
    flex: 1,
    lineHeight: 20,
  },
});

export default ScheduleModal;
