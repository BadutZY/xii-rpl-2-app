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
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
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
          <AnimatedView entering={ZoomIn.duration(400)} style={styles.headerBadge}>
            <LinearGradient
              colors={['rgba(124,58,237,0.15)', 'rgba(16,185,129,0.15)']}
              style={styles.headerBadgeGrad}
            >
              <UsersIcon size={32} color={Colors.primary} />
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
        </View>

        {/* Teacher Section */}
        <View style={styles.teacherSection}>
          <View style={styles.teacherHeader}>
            <GraduationCapIcon size={24} color="#f97316" />
            <Text style={styles.teacherSectionTitle}>Wali Kelas</Text>
          </View>
          <Text style={styles.teacherSectionDesc}>Wali kelas XI RPL 2.</Text>

          {teachersData.map((teacher, i) => (
            <AnimatedView key={teacher.id} entering={FadeInDown.delay(i * 50).duration(350)}>
              <TouchableOpacity
                onPress={() => setSelectedTeacher(teacher)}
                style={styles.teacherCard}
                activeOpacity={0.8}
              >
                <View style={styles.teacherBorder} />
                <View style={styles.teacherPhotoWrap}>
                  {teacher.photo ? (
                    <Image source={teacher.photo} style={styles.teacherPhoto} resizeMode="cover" />
                  ) : (
                    <View style={styles.teacherPhotoPlaceholder}>
                      <GraduationCapIcon size={36} color="rgba(251,191,36,0.5)" />
                    </View>
                  )}
                </View>
                <View style={styles.teacherInfo}>
                  <Text style={styles.teacherName}>{teacher.fullName}</Text>
                  <Text style={styles.teacherRole}>{teacher.role}</Text>
                  <Text style={styles.teacherSubject}>
                    <Text style={{ color: `${Colors.foreground}90` }}>Mapel: </Text>
                    {teacher.subject}
                  </Text>
                  <View style={styles.teacherAccent} />
                </View>
              </TouchableOpacity>
            </AnimatedView>
          ))}
        </View>

        {/* Search */}
        <AnimatedView entering={FadeInDown.delay(300).duration(400)} style={styles.searchWrap}>
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
          </View>
        </AnimatedView>

        {/* Student Grid */}
        <View style={styles.grid}>
          {filtered.map((student, i) => (
            <AnimatedView key={student.id} entering={FadeInDown.delay(Math.min(i * 20, 400)).duration(300)}>
              <TouchableOpacity
                onPress={() => setSelectedStudent(student)}
                activeOpacity={0.8}
                style={styles.studentCard}
              >
                <LinearGradient colors={['rgba(124,58,237,0.08)', 'rgba(16,185,129,0.04)']} style={styles.studentCardGrad}>
                  <View style={styles.studentBorder} />
                  <View style={styles.studentPhotoWrap}>
                    {student.photo ? (
                      <Image source={student.photo} style={styles.studentPhoto} resizeMode="cover" />
                    ) : (
                      <View style={styles.studentPhotoPlaceholder}>
                        <PersonIcon size={44} color={`${Colors.mutedForeground}40`} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.studentName} numberOfLines={1}>{student.name}</Text>
                  <Text style={styles.studentPosition} numberOfLines={1}>{student.position}</Text>
                  <View style={styles.studentAccent} />
                </LinearGradient>
              </TouchableOpacity>
            </AnimatedView>
          ))}
        </View>

        <View style={{ height: 32 }} />
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
  headerBadge: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
  },
  headerBadgeGrad: {
    padding: 14,
  },
  pageTitle: {
    fontFamily: Typography.heading,
    fontSize: 28,
    color: Colors.foreground,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 36,
  },
  pageDesc: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  // Teacher
  teacherSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
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
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  teacherBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  teacherPhotoWrap: {
    width: 72,
    height: 88,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.muted,
    flexShrink: 0,
  },
  teacherPhoto: { width: '100%', height: '100%' },
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
    marginBottom: 2,
  },
  teacherRole: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.orangeLight,
    marginBottom: 4,
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
    paddingVertical: 10,
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
  // Student grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  studentCard: {
    width: CARD_W,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  studentCardGrad: {
    padding: Spacing.sm,
    alignItems: 'center',
  },
  studentBorder: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  studentPhotoWrap: {
    width: 80,
    height: 100,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
    backgroundColor: Colors.muted,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  studentPhoto: { width: '100%', height: '100%' },
  studentPhotoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentName: {
    fontFamily: Typography.heading,
    fontSize: 14,
    color: Colors.primaryLight,
    textAlign: 'center',
    marginBottom: 2,
  },
  studentPosition: {
    fontFamily: Typography.body,
    fontSize: 12,
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
});