import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { Colors, Typography, BorderRadius, Spacing } from '../../src/constants/theme';
import {
  lessonSchedule,
  scheduleDetails,
  piketSchedule,
  dayNames,
  dayLabels,
} from '../../src/data/schedule';
import { studentsData, type Student } from '../../src/data/students';
import { ScheduleModal } from '../../src/components/ScheduleModal';
import { StudentModal } from '../../src/components/StudentModal';
import { BookOpenIcon, BrushIcon, EyeIcon, UserCircleIcon, ArrowDownIcon } from '../../src/components/Icons';

const { width: SCREEN_W } = Dimensions.get('window');

const AnimatedView = Animated.createAnimatedComponent(View);

export default function ScheduleScreen() {
  const [activeTab, setActiveTab] = useState<'lesson' | 'piket'>('lesson');
  const [filterDay, setFilterDay] = useState<string>('all');
  const [modalDay, setModalDay] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const filteredDays = filterDay === 'all' ? [...dayNames] : dayNames.filter((d) => d === filterDay);

  const findStudentByName = (fullName: string): Student | null =>
    studentsData.find((s) => s.fullName.toUpperCase() === fullName.toUpperCase()) || null;

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <AnimatedView entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.pageTitle}>Jadwal</Text>
          <Text style={styles.pageDesc}>Jadwal kelas XI RPL 2.</Text>
        </AnimatedView>

        {/* Toggle Tabs */}
        <AnimatedView entering={FadeInDown.delay(100).duration(400)} style={styles.toggleWrap}>
          <View style={styles.toggleContainer}>
            {/* Sliding background */}
            <View
              style={[
                styles.toggleSlider,
                activeTab === 'piket' && { transform: [{ translateX: (SCREEN_W - 64) / 2 }] },
              ]}
            />
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => { setActiveTab('lesson'); setFilterDay('all'); }}
              activeOpacity={0.8}
            >
              <BookOpenIcon size={14} color={activeTab === 'lesson' ? Colors.foreground : Colors.mutedForeground} />
              <Text style={[styles.toggleText, activeTab === 'lesson' && styles.toggleTextActive]}>
                Pelajaran
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => { setActiveTab('piket'); setFilterDay('all'); }}
              activeOpacity={0.8}
            >
              <BrushIcon size={14} color={activeTab === 'piket' ? Colors.foreground : Colors.mutedForeground} />
              <Text style={[styles.toggleText, activeTab === 'piket' && styles.toggleTextActive]}>
                Piket
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedView>

        {/* Day Filter - Dropdown */}
        <AnimatedView entering={FadeInDown.delay(200).duration(400)} style={styles.dropdownWrap}>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setDropdownOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownBtnText}>
              {filterDay === 'all' ? 'Semua Hari' : dayLabels[filterDay]}
            </Text>
            <ArrowDownIcon size={16} color={Colors.primary} />
          </TouchableOpacity>

          <Modal
            transparent
            visible={dropdownOpen}
            animationType="fade"
            onRequestClose={() => setDropdownOpen(false)}
          >
            <TouchableOpacity
              style={styles.dropdownOverlay}
              activeOpacity={1}
              onPress={() => setDropdownOpen(false)}
            >
              <View style={styles.dropdownMenu}>
                {(['all', ...dayNames] as const).map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dropdownItem, filterDay === d && styles.dropdownItemActive]}
                    onPress={() => { setFilterDay(d); setDropdownOpen(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownItemText, filterDay === d && styles.dropdownItemTextActive]}>
                      {d === 'all' ? 'Semua Hari' : dayLabels[d]}
                    </Text>
                    {filterDay === d && (
                      <View style={styles.dropdownItemDot} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </AnimatedView>

        {/* Cards */}
        <View style={styles.cards}>
          {filteredDays.map((day, i) => (
            <AnimatedView key={day} entering={FadeInDown.delay(i * 60).duration(350)}>
              <LinearGradient
                colors={['rgba(124,58,237,0.08)', 'rgba(16,185,129,0.04)']}
                style={styles.scheduleCard}
              >
                <View style={styles.scheduleBorder} />
                <Text style={styles.dayTitle}>{dayLabels[day]}</Text>

                {activeTab === 'lesson' ? (
                  <>
                    <View style={styles.lessonList}>
                      {lessonSchedule[day].map((item, idx) => (
                        <View key={idx} style={styles.lessonRow}>
                          <View style={styles.timeBadge}>
                            <Text style={styles.timeBadgeText}>{item.time}</Text>
                          </View>
                          <View style={styles.subjectBadge}>
                            <Text style={styles.subjectBadgeText}>{item.subject}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                    <TouchableOpacity
                      onPress={() => setModalDay(day)}
                      style={styles.detailBtn}
                      activeOpacity={0.8}
                    >
                      <LinearGradient colors={['#6d28d9', '#059669']} style={styles.detailBtnGrad}>
                        <EyeIcon size={14} color={Colors.foreground} />
                        <Text style={styles.detailBtnText}>Lihat Detail</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.piketList}>
                    {piketSchedule[day].map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.piketRow}
                        onPress={() => {
                          const found = findStudentByName(item.fullName);
                          if (found) setSelectedStudent(found);
                        }}
                        activeOpacity={0.7}
                      >
                        <UserCircleIcon size={18} color={Colors.secondary} />
                        <View style={styles.subjectBadge}>
                          <Text style={styles.subjectBadgeText}>
                            {item.fullName} ({item.nickname})
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </LinearGradient>
            </AnimatedView>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <ScheduleModal
        isOpen={!!modalDay}
        onClose={() => setModalDay(null)}
        details={modalDay ? scheduleDetails[modalDay] : []}
        dayLabel={modalDay ? dayLabels[modalDay] : ''}
      />
      <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  pageTitle: {
    fontFamily: Typography.heading,
    fontSize: 28,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  pageDesc: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
  // Toggle
  toggleWrap: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.muted,
    borderRadius: BorderRadius.full,
    padding: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  toggleSlider: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    width: '50%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    zIndex: 0,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 10,
    zIndex: 1,
    borderRadius: BorderRadius.full,
  },
  toggleText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 13,
    color: Colors.mutedForeground,
  },
  toggleTextActive: {
    color: Colors.foreground,
  },
  // Dropdown Filter
  dropdownWrap: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  dropdownBtnText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 14,
    color: Colors.foreground,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  dropdownMenu: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    width: '100%',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(124,58,237,0.15)',
  },
  dropdownItemText: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.foreground,
  },
  dropdownItemTextActive: {
    fontFamily: Typography.bodyMedium,
    color: Colors.primaryLight,
  },
  dropdownItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  // Cards
  cards: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  scheduleCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    position: 'relative',
    overflow: 'hidden',
  },
  scheduleBorder: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  dayTitle: {
    fontFamily: Typography.heading,
    fontSize: 20,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  lessonList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  timeBadge: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.5)',
  },
  timeBadgeText: {
    fontFamily: Typography.headingMedium,
    fontSize: 11,
    color: '#c4b5fd',
  },
  subjectBadge: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
    flex: 1,
  },
  subjectBadgeText: {
    fontFamily: Typography.body,
    fontSize: 11,
    color: Colors.secondaryLight,
  },
  detailBtn: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  detailBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  detailBtnText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 13,
    color: Colors.foreground,
  },
  piketList: {
    gap: Spacing.sm,
  },
  piketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});