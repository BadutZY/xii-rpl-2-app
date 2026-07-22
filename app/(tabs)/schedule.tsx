import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { Typography, BorderRadius, Spacing, type ThemeColors } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
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
import { BookOpenIcon, BrushIcon, EyeIcon, UserCircleIcon, CalendarIcon } from '../../src/components/Icons';

const jsToDay = ['ahad', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];

export default function ScheduleScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [activeTab, setActiveTab] = useState<'lesson' | 'piket'>('lesson');
  const [filterDay, setFilterDay] = useState<string>('all');
  const [modalDay, setModalDay] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const today = jsToDay[new Date().getDay()];
  const filteredDays = filterDay === 'all' ? [...dayNames] : dayNames.filter((d) => d === filterDay);

  const findStudentByName = (fullName: string): Student | null =>
    studentsData.find((s) => s.fullName.toUpperCase() === fullName.toUpperCase()) || null;

  const stats = useMemo(() => {
    const totalLessons = dayNames.reduce(
      (acc, d) => acc + (lessonSchedule[d]?.filter((i) => i.subject.toLowerCase() !== 'istirahat').length ?? 0), 0);
    const uniqueSubjects = new Set<string>();
    dayNames.forEach((d) => lessonSchedule[d]?.forEach((i) => {
      if (i.subject.toLowerCase() !== 'istirahat') uniqueSubjects.add(i.subject);
    }));
    return [
      { label: 'Hari sekolah', value: dayNames.length.toString().padStart(2, '0') },
      { label: 'Sesi/minggu', value: totalLessons.toString().padStart(2, '0') },
      { label: 'Mapel', value: uniqueSubjects.size.toString().padStart(2, '0') },
    ];
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.eyebrow}>
            <CalendarIcon size={11} color={colors.mutedForeground} />
            <Text style={styles.eyebrowText}>Jadwal kelas</Text>
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(80).duration(400)} style={styles.pageTitle}>
            Jadwal pelajaran & <Text style={styles.pageTitleItalic}>piket</Text>.
          </Animated.Text>

          <Animated.Text entering={FadeInDown.delay(150).duration(400)} style={styles.pageDesc}>
            Jadwal piket dan jadwal pelajaran kelas XII RPL 2.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(220).duration(400)} style={styles.statsRow}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, activeTab === 'lesson' && styles.toggleBtnActive]}
              onPress={() => { setActiveTab('lesson'); setFilterDay('all'); }}
              activeOpacity={0.85}
            >
              <BookOpenIcon size={13} color={activeTab === 'lesson' ? colors.primaryForeground : colors.mutedForeground} />
              <Text style={[styles.toggleText, activeTab === 'lesson' && styles.toggleTextActive]}>Pelajaran</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, activeTab === 'piket' && styles.toggleBtnActive]}
              onPress={() => { setActiveTab('piket'); setFilterDay('all'); }}
              activeOpacity={0.85}
            >
              <BrushIcon size={13} color={activeTab === 'piket' ? colors.primaryForeground : colors.mutedForeground} />
              <Text style={[styles.toggleText, activeTab === 'piket' && styles.toggleTextActive]}>Piket</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.todayText}>
            Hari ini: <Text style={{ color: colors.foreground, fontFamily: Typography.bodyMedium }}>{dayLabels[today] ?? 'Libur'}</Text>
          </Text>

          {/* Day filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: Spacing.sm }} contentContainerStyle={{ gap: Spacing.xs }}>
            <TouchableOpacity
              onPress={() => setFilterDay('all')}
              style={[styles.chip, filterDay === 'all' && styles.chipActive]}
            >
              <Text style={[styles.chipText, filterDay === 'all' && styles.chipTextActive]}>Semua hari</Text>
            </TouchableOpacity>
            {dayNames.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setFilterDay(d)}
                style={[styles.chip, filterDay === d && styles.chipActive]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Text style={[styles.chipText, filterDay === d && styles.chipTextActive]}>{dayLabels[d]}</Text>
                  {d === today && <View style={[styles.todayDot, { backgroundColor: filterDay === d ? colors.primaryForeground : colors.emerald }]} />}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Cards */}
        <View style={styles.cards}>
          {activeTab === 'lesson'
            ? filteredDays.map((day, i) => (
                <LessonCard key={day} day={day} isToday={day === today} index={i} onOpenDetail={() => setModalDay(day)} />
              ))
            : filteredDays.map((day, i) => (
                <PiketCard
                  key={day}
                  day={day}
                  isToday={day === today}
                  index={i}
                  onSelectStudent={(name) => {
                    const found = findStudentByName(name);
                    if (found) setSelectedStudent(found);
                  }}
                />
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

function DayHeader({ day, isToday, count, kind }: { day: string; isToday: boolean; count: number; kind: 'lesson' | 'piket' }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.dayHeaderRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.dayHeaderEyebrow}>{kind === 'lesson' ? 'Hari' : 'Piket'}</Text>
        <Text style={styles.dayHeaderTitle}>{dayLabels[day]}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        {isToday && (
          <View style={styles.todayBadge}>
            <View style={styles.todayBadgeDot} />
            <Text style={styles.todayBadgeText}>Hari ini</Text>
          </View>
        )}
        <Text style={styles.dayHeaderCount}>{count.toString().padStart(2, '0')} {kind === 'lesson' ? 'sesi' : 'petugas'}</Text>
      </View>
    </View>
  );
}

function LessonCard({ day, isToday, index, onOpenDetail }: { day: string; isToday: boolean; index: number; onOpenDetail: () => void }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const items = lessonSchedule[day] ?? [];
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 50, 300)).duration(350)} style={[styles.dayCard, isToday && styles.dayCardToday]}>
      <DayHeader day={day} isToday={isToday} count={items.length} kind="lesson" />
      <View style={{ marginTop: Spacing.md, gap: Spacing.xs }}>
        {items.map((item, idx) => {
          const isBreak = item.subject.toLowerCase() === 'istirahat';
          return (
            <View key={idx} style={[styles.lessonRow, isBreak && styles.lessonRowBreak]}>
              <View style={styles.timeBadge}>
                <Text style={styles.timeBadgeText}>{item.time}</Text>
              </View>
              <Text style={[styles.lessonSubject, isBreak && styles.lessonSubjectBreak]} numberOfLines={1}>
                {item.subject}
              </Text>
            </View>
          );
        })}
      </View>
      <TouchableOpacity style={styles.detailBtn} onPress={onOpenDetail} activeOpacity={0.85}>
        <EyeIcon size={14} color={colors.primaryForeground} />
        <Text style={styles.detailBtnText}>Lihat Detail</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function PiketCard({ day, isToday, index, onSelectStudent }: { day: string; isToday: boolean; index: number; onSelectStudent: (name: string) => void }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const items = piketSchedule[day] ?? [];
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 50, 300)).duration(350)} style={[styles.dayCard, isToday && styles.dayCardToday]}>
      <DayHeader day={day} isToday={isToday} count={items.length} kind="piket" />
      <View style={{ marginTop: Spacing.md, gap: Spacing.xs }}>
        {items.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.piketRow}
            onPress={() => onSelectStudent(item.fullName)}
            activeOpacity={0.75}
          >
            <View style={styles.piketIconWrap}>
              <UserCircleIcon size={16} color={colors.foreground} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.piketName} numberOfLines={1}>{item.nickname}</Text>
              <Text style={styles.piketFullName} numberOfLines={1}>{item.fullName}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  eyebrow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  eyebrowText: { fontFamily: Typography.headingMedium, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.mutedForeground },

  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  pageTitle: { fontFamily: Typography.heading, fontSize: 28, lineHeight: 32, color: colors.foreground, marginTop: Spacing.sm },
  pageTitleItalic: { fontFamily: Typography.body, fontStyle: 'italic', color: colors.mutedForeground },
  pageDesc: { fontFamily: Typography.body, fontSize: 14, lineHeight: 20, color: colors.mutedForeground, marginTop: Spacing.sm },

  statsRow: { flexDirection: 'row', marginTop: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  statItem: { flex: 1 },
  statLabel: { fontFamily: Typography.bodyMedium, fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', color: colors.mutedForeground },
  statValue: { fontFamily: Typography.heading, fontSize: 20, color: colors.foreground, marginTop: 4 },

  controls: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full },
  toggleBtnActive: { backgroundColor: colors.primary },
  toggleText: { fontFamily: Typography.bodyMedium, fontSize: 12.5, color: colors.mutedForeground },
  toggleTextActive: { color: colors.primaryForeground },
  todayText: { fontFamily: Typography.body, fontSize: 12, color: colors.mutedForeground, marginTop: Spacing.sm },

  chip: {
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, paddingHorizontal: 13, paddingVertical: 7,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: Typography.bodyMedium, fontSize: 12, color: colors.mutedForeground },
  chipTextActive: { color: colors.primaryForeground },
  todayDot: { width: 6, height: 6, borderRadius: 3 },

  cards: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: Spacing.md },
  dayCard: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  dayCardToday: { borderColor: colors.emerald },

  dayHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  dayHeaderEyebrow: { fontFamily: Typography.bodyMedium, fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.mutedForeground },
  dayHeaderTitle: { fontFamily: Typography.heading, fontSize: 19, color: colors.foreground, marginTop: 3 },
  todayBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: colors.emerald, backgroundColor: 'rgba(63,125,87,0.10)',
    borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 3,
  },
  todayBadgeDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.emerald },
  todayBadgeText: { fontFamily: Typography.bodyMedium, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.6, color: colors.emerald },
  dayHeaderCount: { fontFamily: Typography.bodyMedium, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.6, color: colors.mutedForeground },

  lessonRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.background,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.sm, paddingVertical: 8,
  },
  lessonRowBreak: { backgroundColor: colors.surface2 },
  timeBadge: { backgroundColor: colors.surface2, borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 3 },
  timeBadgeText: { fontFamily: Typography.bodyMedium, fontSize: 10.5, color: colors.foreground },
  lessonSubject: { flex: 1, fontFamily: Typography.bodyMedium, fontSize: 12.5, color: colors.foreground },
  lessonSubjectBreak: { color: colors.mutedForeground, fontStyle: 'italic' },

  detailBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: BorderRadius.md,
    marginTop: Spacing.md, paddingVertical: 11,
  },
  detailBtnText: { fontFamily: Typography.bodyMedium, fontSize: 12.5, color: colors.primaryForeground },

  piketRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.background,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.sm, paddingVertical: 8,
  },
  piketIconWrap: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface2,
  },
  piketName: { fontFamily: Typography.bodyMedium, fontSize: 13, color: colors.foreground },
  piketFullName: { fontFamily: Typography.body, fontSize: 10.5, color: colors.mutedForeground },
});