import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeInDown,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, BorderRadius, Spacing } from '../../src/constants/theme';
import { studentsData, type Student } from '../../src/data/students';
import { teachersData, type Teacher } from '../../src/data/teachers';
import { StudentModal } from '../../src/components/StudentModal';
import { TeacherModal } from '../../src/components/TeacherModal';
import { UsersIcon, GraduationCapIcon, SearchIcon, PersonIcon } from '../../src/components/Icons';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - Spacing.md * 2 - Spacing.sm) / 2;

const AnimatedView = Animated.createAnimatedComponent(View);

// Pressable card with spring scale
function PressableCard({
  onPress,
  children,
  style,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[animStyle, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95, { damping: 18, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 18, stiffness: 300 }); }}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function StudentsScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return studentsData;
    const isNumeric = /^\d+$/.test(term);
    return studentsData.filter((s) => {
      const noMatch = isNumeric ? s.no === term : s.no.toLowerCase().includes(term);
      return (
        s.name.toLowerCase().includes(term) ||
        s.fullName.toLowerCase().includes(term) ||
        s.position.toLowerCase().includes(term) ||
        noMatch
      );
    });
  }, [searchTerm]);

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <AnimatedView entering={ZoomIn.duration(450).springify()} style={styles.headerBadgeWrap}>
            <LinearGradient
              colors={['rgba(124,58,237,0.18)', 'rgba(16,185,129,0.18)']}
              style={styles.headerBadgeGrad}
            >
              <UsersIcon size={34} color={Colors.primary} />
            </LinearGradient>
          </AnimatedView>

          <AnimatedView entering={FadeInDown.delay(100).duration(450)}>
            <Text style={styles.pageTitle}>
              Daftar Murid{'\n'}
              <Text style={{ color: Colors.primary }}>XI RPL 2</Text>
            </Text>
          </AnimatedView>

          <AnimatedView entering={FadeInDown.delay(200).duration(450)}>
            <Text style={styles.pageDesc}>
              Kenali para calon developer masa depan dari kelas XI RPL 2 SMK INFOKOM.
            </Text>
          </AnimatedView>

          {/* Stats strip */}
          <AnimatedView entering={FadeInDown.delay(300).duration(400)} style={styles.statsStrip}>
            <LinearGradient colors={['rgba(124,58,237,0.12)', 'rgba(16,185,129,0.08)']} style={styles.statsStripInner}>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{studentsData.length}</Text>
                <Text style={styles.statLbl}>Siswa</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: Colors.orange }]}>{teachersData.length}</Text>
                <Text style={styles.statLbl}>Wali Kelas</Text>
              </View>
            </LinearGradient>
          </AnimatedView>
        </View>

        {/* Teacher Section */}
        <View style={styles.teacherSection}>
          <AnimatedView entering={FadeInDown.delay(150).duration(400)} style={styles.teacherHeaderRow}>
            <View style={styles.teacherHeaderLeft}>
              <View style={styles.teacherIconWrap}>
                <GraduationCapIcon size={20} color="#f97316" />
              </View>
              <Text style={styles.teacherSectionTitle}>Wali Kelas</Text>
            </View>
          </AnimatedView>
          <Text style={styles.teacherSectionDesc}>Wali kelas XI RPL 2.</Text>

          {teachersData.map((teacher, i) => (
            <AnimatedView key={teacher.id} entering={FadeInDown.delay(i * 80 + 200).duration(400)}>
              <PressableCard
                onPress={() => setSelectedTeacher(teacher)}
                style={styles.teacherCardWrap}
              >
                <LinearGradient
                  colors={['rgba(245,158,11,0.10)', 'rgba(239,68,68,0.06)']}
                  style={styles.teacherCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.teacherPhotoWrap}>
                    {teacher.photo ? (
                      <Image source={teacher.photo} style={styles.teacherPhoto} resizeMode="cover" />
                    ) : (
                      <View style={styles.teacherPhotoPlaceholder}>
                        <GraduationCapIcon size={36} color="rgba(251,191,36,0.5)" />
                      </View>
                    )}
                    <LinearGradient
                      colors={['rgba(245,158,11,0.4)', 'rgba(239,68,68,0.2)']}
                      style={styles.teacherPhotoOverlay}
                    />
                  </View>
                  <View style={styles.teacherInfo}>
                    <Text style={styles.teacherName}>{teacher.fullName}</Text>
                    <View style={styles.teacherRoleBadge}>
                      <Text style={styles.teacherRole}>{teacher.role}</Text>
                    </View>
                    <Text style={styles.teacherSubject}>
                      <Text style={{ color: `${Colors.foreground}70` }}></Text>
                      {teacher.subject}
                    </Text>
                    <View style={styles.teacherAccent} />
                  </View>
                  <View style={styles.teacherChevron}>
                    <Text style={{ color: Colors.orange, fontSize: 18 }}>›</Text>
                  </View>
                </LinearGradient>
              </PressableCard>
            </AnimatedView>
          ))}
        </View>

        {/* Search */}
        <AnimatedView entering={FadeInDown.delay(350).duration(400)} style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <SearchIcon size={18} color={Colors.mutedForeground} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama murid..."
              placeholderTextColor={Colors.mutedForeground}
              value={searchTerm}
              onChangeText={setSearchTerm}
              returnKeyType="search"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearBtn}>
                <Text style={{ color: Colors.mutedForeground, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          {searchTerm.length > 0 && (
            <Text style={styles.searchResultCount}>
              {filtered.length} hasil ditemukan
            </Text>
          )}
        </AnimatedView>

        {/* Student Grid */}
        <View style={styles.grid}>
          {filtered.map((student, i) => (
            <AnimatedView key={student.id} entering={FadeInDown.delay(Math.min(i * 25, 450)).duration(350)}>
              <PressableCard
                onPress={() => setSelectedStudent(student)}
                style={styles.studentCardOuter}
              >
                <LinearGradient
                  colors={['rgba(124,58,237,0.10)', 'rgba(16,185,129,0.05)']}
                  style={styles.studentCardGrad}
                >
                  <View style={styles.studentPhotoWrap}>
                    {student.photo ? (
                      <Image source={student.photo} style={styles.studentPhoto} resizeMode="cover" />
                    ) : (
                      <View style={styles.studentPhotoPlaceholder}>
                        <PersonIcon size={44} color={`${Colors.mutedForeground}40`} />
                      </View>
                    )}
                    <LinearGradient
                      colors={['transparent', 'rgba(124,58,237,0.3)']}
                      style={styles.studentPhotoGrad}
                    />
                  </View>
                  <Text style={styles.studentName} numberOfLines={1}>{student.name}</Text>
                  <View style={styles.studentPositionBadge}>
                    <Text style={styles.studentPosition} numberOfLines={1}>{student.position}</Text>
                  </View>
                  <View style={styles.studentAccent} />
                </LinearGradient>
              </PressableCard>
            </AnimatedView>
          ))}
        </View>

        {filtered.length === 0 && (
          <AnimatedView entering={FadeInDown.duration(300)} style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>Tidak ada siswa ditemukan</Text>
            <Text style={styles.emptySubText}>Coba kata kunci lain</Text>
          </AnimatedView>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      <TeacherModal teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} />
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
  headerBadgeWrap: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.3)',
  },
  headerBadgeGrad: {
    padding: 16,
  },
  pageTitle: {
    fontFamily: Typography.heading,
    fontSize: 28,
    color: Colors.foreground,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 38,
  },
  pageDesc: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 300,
    marginBottom: Spacing.md,
  },
  statsStrip: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    width: '100%',
  },
  statsStripInner: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: Typography.heading,
    fontSize: 24,
    color: Colors.primary,
  },
  statLbl: {
    fontFamily: Typography.body,
    fontSize: 11,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  // Teacher
  teacherSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  teacherHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  teacherHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  teacherIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245,158,11,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherSectionTitle: {
    fontFamily: Typography.heading,
    fontSize: 22,
    color: Colors.orange,
  },
  teacherSectionDesc: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.mutedForeground,
    marginBottom: Spacing.md,
    marginLeft: Spacing.sm,
  },
  teacherCardWrap: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    marginBottom: Spacing.sm,
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  teacherPhotoWrap: {
    width: 72,
    height: 88,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.muted,
    flexShrink: 0,
    position: 'relative',
  },
  teacherPhoto: { width: '100%', height: '100%' },
  teacherPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
  },
  teacherPhotoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245,158,11,0.08)',
  },
  teacherInfo: { flex: 1 },
  teacherName: {
    fontFamily: Typography.heading,
    fontSize: 15,
    color: Colors.orange,
    marginBottom: 4,
  },
  teacherRoleBadge: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  teacherRole: {
    fontFamily: Typography.body,
    fontSize: 11,
    color: Colors.orangeLight,
  },
  teacherSubject: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  teacherAccent: {
    marginTop: 8,
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.orange,
  },
  teacherChevron: {
    paddingLeft: Spacing.xs,
  },
  // Search
  searchWrap: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.foreground,
  },
  clearBtn: {
    padding: 2,
  },
  searchResultCount: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.mutedForeground,
    marginTop: 6,
    marginLeft: Spacing.md,
  },
  // Student grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  studentCardOuter: {
    width: CARD_W,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  studentCardGrad: {
    padding: Spacing.sm + 2,
    alignItems: 'center',
  },
  studentPhotoWrap: {
    width: 84,
    height: 106,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
    backgroundColor: Colors.muted,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
    position: 'relative',
  },
  studentPhoto: { width: '100%', height: '100%' },
  studentPhotoGrad: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  studentPhotoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentName: {
    fontFamily: Typography.heading,
    fontSize: 13,
    color: Colors.primaryLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  studentPositionBadge: {
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  studentPosition: {
    fontFamily: Typography.body,
    fontSize: 11,
    color: Colors.primary,
    textAlign: 'center',
  },
  studentAccent: {
    marginTop: 6,
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.primary,
  },
  // Empty
  emptyBox: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontFamily: Typography.heading,
    fontSize: 16,
    color: Colors.foreground,
    marginBottom: 4,
  },
  emptySubText: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.mutedForeground,
  },
});