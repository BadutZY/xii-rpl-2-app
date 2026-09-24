import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
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
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { Typography, BorderRadius, Spacing, type ThemeColors } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import {
  fetchAllProfiles,
  mergeStudents,
  mergeTeachers,
  type MergedStudent,
  type MergedTeacher,
} from '../../src/lib/profilesApi';
import { toImageSource } from '../../src/lib/imageSource';
import { StudentModal } from '../../src/components/StudentModal';
import { TeacherModal } from '../../src/components/TeacherModal';
import { UsersIcon, GraduationCapIcon, SearchIcon, PersonIcon, XIcon } from '../../src/components/Icons';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_GAP = Spacing.sm;
const CARD_W = (SCREEN_W - Spacing.md * 2 - CARD_GAP * 2) / 3;

const AnimatedView = Animated.createAnimatedComponent(View);

function PressableCard({ onPress, children, style }: { onPress: () => void; children: React.ReactNode; style?: any }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[animStyle, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 18, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 18, stiffness: 300 }); }}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function StudentsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<MergedStudent | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<MergedTeacher | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Roster dasar (nama, id) tetap dari data/students.ts & data/teachers.ts —
  // sama seperti website — tapi nickname, bio, foto, posisi, dan sosial media
  // semuanya ditarik & di-overlay langsung dari tabel `profiles` di Supabase,
  // supaya perubahan lewat Profil/Admin langsung terlihat di sini juga.
  const [studentsList, setStudentsList] = useState<MergedStudent[]>(() => mergeStudents([]));
  const [teachersList, setTeachersList] = useState<MergedTeacher[]>(() => mergeTeachers([]));

  useEffect(() => {
    let active = true;
    fetchAllProfiles().then((profiles) => {
      if (!active) return;
      setStudentsList(mergeStudents(profiles));
      setTeachersList(mergeTeachers(profiles));
    });
    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const roles = useMemo(() => {
    const set = new Set<string>();
    studentsList.forEach((s) => {
      const p = (s.position || '').trim();
      if (p && p !== '-') set.add(p);
    });
    return ['all', ...Array.from(set)];
  }, [studentsList]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const isNumeric = /^\d+$/.test(term);
    return studentsList.filter((s) => {
      if (roleFilter !== 'all' && s.position !== roleFilter) return false;
      if (!term) return true;
      const noMatch = isNumeric ? s.no === term : s.no.toLowerCase().includes(term);
      return (
        s.name.toLowerCase().includes(term) ||
        s.fullName.toLowerCase().includes(term) ||
        s.position.toLowerCase().includes(term) ||
        noMatch
      );
    });
  }, [searchTerm, roleFilter, studentsList]);

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.eyebrow}>
            <UsersIcon size={11} color={colors.mutedForeground} />
            <Text style={styles.eyebrowText}>Anggota kelas</Text>
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(80).duration(400)} style={styles.pageTitle}>
            Murid & wali <Text style={styles.pageTitleItalic}>XII RPL 2</Text>.
          </Animated.Text>

          <Animated.Text entering={FadeInDown.delay(150).duration(400)} style={styles.pageDesc}>
            Kenali (mungkin) calon developer masa depan dari kelas XII RPL 2 SMK INFOKOM
            beserta wali kelas yang membimbing di balik layar.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(220).duration(400)} style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Murid</Text>
              <Text style={styles.statValue}>{studentsList.length.toString().padStart(2, '0')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Wali kelas</Text>
              <Text style={styles.statValue}>{teachersList.length.toString().padStart(2, '0')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Peran khusus</Text>
              <Text style={styles.statValue}>{(roles.length - 1).toString().padStart(2, '0')}</Text>
            </View>
          </Animated.View>
        </View>

        {/* Teacher Section */}
        <View style={styles.teacherSection}>
          <View style={styles.eyebrow}>
            <GraduationCapIcon size={11} color={colors.mutedForeground} />
            <Text style={styles.eyebrowText}>Wali kelas</Text>
          </View>
          <Text style={styles.subSectionTitle}>Yang membimbing di balik layar.</Text>

          <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
            {teachersList.map((teacher, i) => (
              <AnimatedView key={teacher.id} entering={FadeInDown.delay(i * 60).duration(380)}>
                <PressableCard onPress={() => setSelectedTeacher(teacher)}>
                  <View style={styles.teacherCard}>
                    <View style={styles.teacherPhotoWrap}>
                      {teacher.photo ? (
                        <Image source={toImageSource(teacher.photo)} style={styles.teacherPhoto} resizeMode="cover" />
                      ) : (
                        <View style={styles.teacherPhotoPlaceholder}>
                          <GraduationCapIcon size={30} color={colors.amber} />
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.teacherRole}>{teacher.role}</Text>
                      <Text style={styles.teacherName} numberOfLines={1}>{teacher.fullName}</Text>
                      <Text style={styles.teacherSubject} numberOfLines={1}>
                        <Text style={{ color: colors.mutedForeground }}>Mapel: </Text>{teacher.subject}
                      </Text>
                      <View style={styles.teacherAccent} />
                    </View>
                  </View>
                </PressableCard>
              </AnimatedView>
            ))}
          </View>
        </View>

        {/* Students Section */}
        <View style={styles.studentsSection}>
          <View style={styles.studentsHeaderRow}>
            <View>
              <View style={styles.eyebrow}>
                <UsersIcon size={11} color={colors.mutedForeground} />
                <Text style={styles.eyebrowText}>Murid</Text>
              </View>
              <Text style={styles.subSectionTitle}>Semua anggota kelas.</Text>
            </View>
            <Text style={styles.resultCount}>
              <Text style={{ color: colors.foreground, fontFamily: Typography.bodyMedium }}>{filtered.length}</Text> dari {studentsList.length}
            </Text>
          </View>

          {/* Search */}
          <View style={styles.searchBox}>
            <SearchIcon size={16} color={colors.mutedForeground} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama, nomor absen, atau peran..."
              placeholderTextColor={colors.mutedForeground}
              value={searchTerm}
              onChangeText={setSearchTerm}
              returnKeyType="search"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearBtn}>
                <XIcon size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>

          {/* Role filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={{ gap: Spacing.xs }}>
            {roles.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRoleFilter(r)}
                style={[styles.chip, roleFilter === r && styles.chipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, roleFilter === r && styles.chipTextActive]}>
                  {r === 'all' ? 'Semua peran' : r}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Grid */}
          {filtered.length === 0 ? (
            <AnimatedView entering={FadeIn.duration(250)} style={styles.emptyBox}>
              <View style={styles.iconBadge}>
                <UsersIcon size={18} color={colors.foreground} />
              </View>
              <Text style={styles.emptyTitle}>Tidak ada murid</Text>
              <Text style={styles.emptySub}>Coba ubah kata kunci atau reset filter.</Text>
              {(searchTerm || roleFilter !== 'all') && (
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={() => { setSearchTerm(''); setRoleFilter('all'); }}
                >
                  <Text style={styles.resetBtnText}>Reset filter</Text>
                </TouchableOpacity>
              )}
            </AnimatedView>
          ) : (
            <View style={styles.grid}>
              {filtered.map((student, i) => {
                const hasRole = student.position && student.position !== '-';
                return (
                  <AnimatedView key={student.id} entering={FadeInDown.delay(Math.min(i * 15, 350)).duration(300)}>
                    <PressableCard onPress={() => setSelectedStudent(student)} style={{ width: CARD_W }}>
                      <View style={styles.studentCard}>
                        <View style={styles.studentPhotoWrap}>
                          {student.photo ? (
                            <Image source={toImageSource(student.photo)} style={styles.studentPhoto} resizeMode="cover" />
                          ) : (
                            <View style={styles.studentPhotoPlaceholder}>
                              <PersonIcon size={26} color={colors.mutedForeground} />
                            </View>
                          )}
                          <View style={styles.studentNoBadge}>
                            <Text style={styles.studentNoText}>{student.no.padStart(2, '0')}</Text>
                          </View>
                        </View>
                        <Text style={styles.studentName} numberOfLines={1}>{student.name}</Text>
                        {hasRole ? (
                          <View style={styles.studentPositionBadge}>
                            <Text style={styles.studentPosition} numberOfLines={1}>{student.position}</Text>
                          </View>
                        ) : (
                          <Text style={styles.studentAnggota}>Anggota</Text>
                        )}
                      </View>
                    </PressableCard>
                  </AnimatedView>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      <TeacherModal teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  eyebrow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  eyebrowText: {
    fontFamily: Typography.headingMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.mutedForeground,
  },

  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  pageTitle: {
    fontFamily: Typography.heading,
    fontSize: 30,
    lineHeight: 34,
    color: colors.foreground,
    marginTop: Spacing.sm,
  },
  pageTitleItalic: { fontFamily: Typography.body, fontStyle: 'italic', color: colors.mutedForeground },
  pageDesc: { fontFamily: Typography.body, fontSize: 14, lineHeight: 20, color: colors.mutedForeground, marginTop: Spacing.sm },

  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: { flex: 1 },
  statLabel: { fontFamily: Typography.bodyMedium, fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', color: colors.mutedForeground },
  statValue: { fontFamily: Typography.heading, fontSize: 20, color: colors.foreground, marginTop: 4 },

  subSectionTitle: { fontFamily: Typography.heading, fontSize: 21, color: colors.foreground, marginTop: Spacing.sm },

  // Teacher
  teacherSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: BorderRadius.xl,
    padding: Spacing.sm + 4,
  },
  teacherPhotoWrap: {
    width: 64, height: 78,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface2,
    flexShrink: 0,
  },
  teacherPhoto: { width: '100%', height: '100%' },
  teacherPhotoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  teacherRole: { fontFamily: Typography.bodyMedium, fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', color: colors.amber },
  teacherName: { fontFamily: Typography.heading, fontSize: 15, color: colors.foreground, marginTop: 3 },
  teacherSubject: { fontFamily: Typography.body, fontSize: 12, color: colors.foreground, marginTop: 3 },
  teacherAccent: { marginTop: 8, width: 32, height: 3, borderRadius: 2, backgroundColor: colors.amber },

  // Students
  studentsSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  studentsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  resultCount: { fontFamily: Typography.body, fontSize: 11.5, color: colors.mutedForeground },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: Spacing.md,
  },
  searchInput: { flex: 1, fontFamily: Typography.body, fontSize: 14, color: colors.foreground },
  clearBtn: { padding: 2 },

  chipsRow: { marginTop: Spacing.sm, marginBottom: Spacing.md },
  chip: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: Typography.bodyMedium, fontSize: 12, color: colors.mutedForeground },
  chipTextActive: { color: colors.primaryForeground },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  studentCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  studentPhotoWrap: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface2,
    position: 'relative',
  },
  studentPhoto: { width: '100%', height: '100%' },
  studentPhotoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  studentNoBadge: {
    position: 'absolute', top: 4, left: 4,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1,
  },
  studentNoText: { fontFamily: Typography.bodyMedium, fontSize: 9, color: colors.foreground },
  studentName: { fontFamily: Typography.heading, fontSize: 12.5, color: colors.foreground, textAlign: 'center', marginTop: 6 },
  studentPositionBadge: {
    marginTop: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface2,
    paddingHorizontal: 7, paddingVertical: 2,
    maxWidth: '100%',
  },
  studentPosition: { fontFamily: Typography.body, fontSize: 9.5, color: colors.mutedForeground },
  studentAnggota: { fontFamily: Typography.body, fontSize: 9, color: colors.mutedForeground, opacity: 0.6, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.6 },

  iconBadge: {
    width: 40, height: 40, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1, borderColor: colors.cardBorder,
  },

  // Empty
  emptyBox: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyTitle: { fontFamily: Typography.heading, fontSize: 16, color: colors.foreground, marginTop: Spacing.sm },
  emptySub: { fontFamily: Typography.body, fontSize: 12.5, color: colors.mutedForeground, marginTop: 4 },
  resetBtn: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  resetBtnText: { fontFamily: Typography.bodyMedium, fontSize: 12, color: colors.foreground },
});