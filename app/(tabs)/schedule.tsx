import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
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

// Animated toggle with smooth sliding pill
function ToggleTab({
  activeTab,
  onTabChange,
}: {
  activeTab: 'lesson' | 'piket';
  onTabChange: (tab: 'lesson' | 'piket') => void;
}) {
  const slideX = useSharedValue(activeTab === 'piket' ? 1 : 0);

  useEffect(() => {
    slideX.value = withSpring(activeTab === 'piket' ? 1 : 0, { damping: 22, stiffness: 260 });
  }, [activeTab]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(slideX.value, [0, 1], [4, (SCREEN_W - Spacing.md * 2 - 8) / 2]),
      },
    ],
  }));

  return (
    <View style={styles.toggleContainer}>
      <AnimatedView style={[styles.toggleSlider, pillStyle]} />
      <TouchableOpacity
        style={styles.toggleBtn}
        onPress={() => onTabChange('lesson')}
        activeOpacity={0.8}
      >
        <BookOpenIcon size={14} color={activeTab === 'lesson' ? Colors.foreground : Colors.mutedForeground} />
        <Text style={[styles.toggleText, activeTab === 'lesson' && styles.toggleTextActive]}>
          Pelajaran
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.toggleBtn}
        onPress={() => onTabChange('piket')}
        activeOpacity={0.8}
      >
        <BrushIcon size={14} color={activeTab === 'piket' ? Colors.foreground : Colors.mutedForeground} />
        <Text style={[styles.toggleText, activeTab === 'piket' && styles.toggleTextActive]}>
          Piket
        </Text>
      </TouchableOpacity>
    </View>
  );
}

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

  const dayColors: Record<string, string> = {
    monday: Colors.primary,
    tuesday: '#06b6d4',
    wednesday: Colors.secondary,
    thursday: Colors.orange,
    friday: '#a78bfa',
    saturday: '#f472b6',
  };

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <AnimatedView entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.headerBadge}>
            <LinearGradient colors={['rgba(16,185,129,0.2)', 'rgba(124,58,237,0.2)']} style={styles.headerBadgeGrad}>
              <BookOpenIcon size={30} color={Colors.secondary} />
            </LinearGradient>
          </View>
          <Text style={styles.pageTitle}>Jadwal</Text>
          <Text style={styles.pageDesc}>Jadwal kelas XI RPL 2.</Text>
        </AnimatedView>

        {/* Toggle Tabs */}
        <AnimatedView entering={FadeInDown.delay(100).duration(400)} style={styles.toggleWrap}>
          <ToggleTab
            activeTab={activeTab}
            onTabChange={(tab) => { setActiveTab(tab); setFilterDay('all'); }}
          />
        </AnimatedView>

        {/* Day Filter - Dropdown */}
        <AnimatedView entering={FadeInDown.delay(200).duration(400)} style={styles.dropdownWrap}>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setDropdownOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.dropdownBtnLeft}>
              <View style={[styles.dropdownDot, { backgroundColor: filterDay !== 'all' ? dayColors[filterDay] || Colors.primary : Colors.mutedForeground }]} />
              <Text style={styles.dropdownBtnText}>
                {filterDay === 'all' ? 'Semua Hari' : dayLabels[filterDay]}
              </Text>
            </View>
            <LinearGradient colors={['rgba(124,58,237,0.2)', 'rgba(16,185,129,0.2)']} style={styles.dropdownChevron}>
              <ArrowDownIcon size={14} color={Colors.primary} />
            </LinearGradient>
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
                <LinearGradient colors={['rgba(124,58,237,0.1)', 'rgba(16,185,129,0.05)']} style={styles.dropdownMenuHeader}>
                  <Text style={styles.dropdownMenuTitle}>Pilih Hari</Text>
                </LinearGradient>
                {(['all', ...dayNames] as const).map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dropdownItem, filterDay === d && styles.dropdownItemActive]}
                    onPress={() => { setFilterDay(d); setDropdownOpen(false); }}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.dropdownItemDot,
                      {
                        backgroundColor: d === 'all'
                          ? Colors.mutedForeground
                          : (dayColors[d] || Colors.primary),
                        opacity: filterDay === d ? 1 : 0.4,
                      }
                    ]} />
                    <Text style={[styles.dropdownItemText, filterDay === d && styles.dropdownItemTextActive]}>
                      {d === 'all' ? 'Semua Hari' : dayLabels[d]}
                    </Text>
                    {filterDay === d && (
                      <Text style={{ color: Colors.primary, fontSize: 16 }}>✓</Text>
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
            <AnimatedView key={day} entering={FadeInDown.delay(i * 70).duration(380)}>
              <LinearGradient
                colors={['rgba(124,58,237,0.08)', 'rgba(16,185,129,0.04)']}
                style={styles.scheduleCard}
              >
                {/* Day indicator bar */}
                <View style={[styles.dayAccentBar, { backgroundColor: dayColors[day] || Colors.primary }]} />

                <View style={styles.dayTitleRow}>
                  <View style={[styles.dayDot, { backgroundColor: dayColors[day] || Colors.primary }]} />
                  <Text style={[styles.dayTitle, { color: dayColors[day] || Colors.primary }]}>
                    {dayLabels[day]}
                  </Text>
                  {activeTab === 'lesson' && (
                    <View style={styles.lessonCountBadge}>
                      <Text style={styles.lessonCountText}>{lessonSchedule[day].length} mapel</Text>
                    </View>
                  )}
                </View>

                {activeTab === 'lesson' ? (
                  <>
                    <View style={styles.lessonList}>
                      {lessonSchedule[day].map((item, idx) => (
                        <View key={idx} style={styles.lessonRow}>
                          <View style={styles.timeBadge}>
                            <Text style={styles.timeBadgeText}>{item.time}</Text>
                          </View>
                          <View style={[styles.subjectBadge, { borderColor: `${dayColors[day] || Colors.primary}40` }]}>
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
                      <LinearGradient colors={['#6d28d9', '#059669']} style={styles.detailBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
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
                        <View style={styles.piketIconWrap}>
                          <UserCircleIcon size={18} color={Colors.secondary} />
                        </View>
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

        <View style={{ height: 40 }} />
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
  headerBadge: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    marginBottom: Spacing.md,
  },
  headerBadgeGrad: {
    padding: 14,
  },
  pageTitle: {
    fontFamily: Typography.heading,
    fontSize: 30,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(16,185,129,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  pageDesc: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
  // Toggle
  toggleWrap: {
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
  },
  toggleSlider: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
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
    paddingVertical: 11,
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
    backgroundColor: 'rgba(124,58,237,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.35)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
  },
  dropdownBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dropdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dropdownBtnText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 14,
    color: Colors.foreground,
  },
  dropdownChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  dropdownMenu: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    width: '100%',
    overflow: 'hidden',
  },
  dropdownMenuHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownMenuTitle: {
    fontFamily: Typography.heading,
    fontSize: 15,
    color: Colors.foreground,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(124,58,237,0.12)',
  },
  dropdownItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dropdownItemText: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.foreground,
    flex: 1,
  },
  dropdownItemTextActive: {
    fontFamily: Typography.bodyMedium,
    color: Colors.primaryLight,
  },
  // Cards
  cards: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  scheduleCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    position: 'relative',
    overflow: 'hidden',
  },
  dayAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    borderTopLeftRadius: BorderRadius.xl,
    borderBottomLeftRadius: BorderRadius.xl,
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingLeft: 4,
  },
  dayDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dayTitle: {
    fontFamily: Typography.heading,
    fontSize: 20,
    flex: 1,
  },
  lessonCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  lessonCountText: {
    fontFamily: Typography.body,
    fontSize: 11,
    color: Colors.mutedForeground,
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
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.35)',
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
    paddingVertical: 11,
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
  piketIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});