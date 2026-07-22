import React, { useRef, useCallback, useMemo } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, Image,
  StyleSheet, Dimensions, ImageBackground,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  FadeInDown, interpolate, useAnimatedScrollHandler, Easing,
} from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';
import { Typography, BorderRadius, Spacing, type ThemeColors } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import {
  CodeIcon, UsersIcon, CalendarIcon, ArrowRightIcon, ArrowUpRightIcon,
  DatabaseIcon, CpuIcon, ImagesIcon, PlayIcon,
} from '../../src/components/Icons';
import { studentsData } from '../../src/data/students';
import { teachersData } from '../../src/data/teachers';

const { width: SCREEN_W } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Same curve the website uses for its hero reveal: cubic-bezier(0.22, 1, 0.36, 1)
const HERO_EASING = Easing.bezier(0.22, 1, 0.36, 1);

const stats = [
  { label: 'Murid aktif', value: studentsData.length.toString().padStart(2, '0') },
  { label: 'Wali kelas', value: teachersData.length.toString().padStart(2, '0') },
  { label: 'Hari sekolah', value: '05' },
];

const aboutItems = [
  { title: 'Kurikulum', desc: 'Fokus pada pemrograman, pengembangan web, manajemen database, dan robotika dengan proyek yang mendekati praktik industri.' },
  { title: 'Kegiatan', desc: 'Pelatihan intensif, review kode, dan kolaborasi tim untuk membentuk kebiasaan kerja profesional sejak dini.' },
  { title: 'Identitas', desc: 'Kelas yang menghargai proses, dokumentasi, dan estetika dari setiap detail pekerjaan yang dikerjakan.' },
  { title: 'Tujuan', desc: 'Menyiapkan murid menjadi profesional di bidang teknologi siap kerja, magang, atau melanjutkan studi.' },
];

const lessons = [
  { icon: CodeIcon, title: 'Web dan App Development', desc: 'Membangun aplikasi web modern dengan pendekatan berbasis proyek, dari markup hingga deployment.' },
  { icon: DatabaseIcon, title: 'Pemrograman GIM', desc: 'Merancang dan mengembangkan sebuah permainan digital dengan mengatur berbagai elemen serta aturan permainan.' },
  { icon: CpuIcon, title: 'Robotika', desc: 'Perancangan perangkat, pemrograman kontroler, dan integrasi sensor untuk sistem otomatis.' },
];

// Press feedback wrapper — scales down slightly on press, like the web's hover lift
function PressCard({ onPress, children, style }: { onPress: () => void; children: React.ReactNode; style?: any }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[animStyle, style]}>
      <TouchableOpacity
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 20, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 20, stiffness: 300 }); }}
        onPress={onPress}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

function Eyebrow({ label, styles }: { label: string; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.eyebrow}>
      <Text style={styles.eyebrowText}>{label}</Text>
    </View>
  );
}

function QuickCard({
  icon: Icon, title, desc, tag, onPress, style, styles, colors,
}: {
  icon: any; title: string; desc: string; tag?: string; onPress: () => void; style?: any;
  styles: ReturnType<typeof makeStyles>; colors: ThemeColors;
}) {
  return (
    <PressCard onPress={onPress} style={[styles.quickCardWrap, style]}>
      <View style={styles.quickCardTop}>
        <View style={styles.iconBadge}>
          <Icon size={18} color={colors.foreground} />
        </View>
        {tag ? <Text style={styles.quickTag}>{tag}</Text> : null}
      </View>
      <View>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickDesc}>{desc}</Text>
        <View style={styles.quickOpenRow}>
          <Text style={styles.quickOpenText}>Buka</Text>
          <ArrowUpRightIcon size={14} color={colors.foreground} />
        </View>
      </View>
    </PressCard>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({ onScroll: (e) => { scrollY.value = e.contentOffset.y; } });

  useFocusEffect(useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []));

  const heroParallax = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, 300], [0, -30]) }],
  }));

  return (
    <AnimatedScrollView
      ref={scrollRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    >
      {/* ── HERO ── */}
      <View style={styles.section}>
        <Animated.Text
          entering={FadeInDown.delay(100).duration(700).easing(HERO_EASING)}
          style={styles.heroTitle}
        >
          Mari berkenalan dengan murid
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(220).duration(700).easing(HERO_EASING)}
          style={[styles.heroTitle, styles.heroTitleItalic]}
        >
          XII RPL 2
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(550).duration(600).easing(HERO_EASING)}
          style={styles.heroDesc}
        >
          Website ini adalah pusat informasi kelas XII RPL 2 SMK INFOKOM. Jadwal, murid,
          guru, galeri, dan arsip video tersusun dalam satu antarmuka yang bersih dan
          mudah dijelajahi.
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(700).duration(600).easing(HERO_EASING)}
          style={styles.heroButtons}
        >
          <PressCard onPress={() => router.push('/students')}>
            <View style={styles.btnPrimary}>
              <Text style={styles.btnPrimaryText}>Jelajahi Kelas</Text>
              <ArrowRightIcon size={15} color={colors.primaryForeground} />
            </View>
          </PressCard>
          <PressCard onPress={() => router.push('/schedule')}>
            <View style={styles.btnOutline}>
              <Text style={styles.btnOutlineText}>Lihat jadwal</Text>
            </View>
          </PressCard>
        </Animated.View>

        {/* Hero image card */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(900).easing(HERO_EASING)}
          style={[styles.heroImageWrap, heroParallax]}
        >
          <ImageBackground
            source={require('../../assets/gallery/hero-class.jpeg')}
            style={styles.heroImage}
            imageStyle={{ borderRadius: BorderRadius.xl }}
            resizeMode="cover"
          >
            <View style={styles.heroImageOverlay}>
              <Text style={styles.heroImageBadge}>SMK INFOKOM (XII RPL 2)</Text>
            </View>
          </ImageBackground>
          <Animated.View
            entering={FadeInDown.delay(950).duration(600).easing(HERO_EASING)}
            style={styles.heroProgramCard}
          >
            <Text style={styles.heroProgramLabel}>PROGRAM</Text>
            <Text style={styles.heroProgramTitle}>Rekayasa Perangkat Lunak</Text>
          </Animated.View>
        </Animated.View>

        {/* Stats — each stat fades in on its own delayed beat, like the web */}
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <Animated.View
              key={s.label}
              entering={FadeInDown.delay(850 + i * 100).duration(600).easing(HERO_EASING)}
              style={styles.statItem}
            >
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* ── ABOUT ── */}
      <View style={[styles.section, styles.sectionBordered]}>
        <Eyebrow label="Tentang" styles={styles} />
        <Text style={styles.sectionTitle}>
          Belajar merancang perangkat lunak dengan disiplin nyata.
        </Text>
        <View style={styles.aboutGrid}>
          {aboutItems.map((item) => (
            <View key={item.title} style={styles.techCard}>
              <Text style={styles.techCardTitle}>{item.title}</Text>
              <Text style={styles.techCardDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── LESSONS ── */}
      <View style={[styles.section, styles.sectionBordered]}>
        <Eyebrow label="Pelajaran" styles={styles} />
        <Text style={styles.sectionTitle}>
          Fondasi yang kami pelajari, digunakan di produk nyata.
        </Text>
        <View style={styles.lessonsGrid}>
          {lessons.map((item, i) => {
            const Icon = item.icon;
            return (
              <Animated.View key={item.title} entering={FadeInDown.delay(i * 80).duration(450)} style={styles.techCard}>
                <View style={styles.lessonTopRow}>
                  <View style={styles.iconBadge}>
                    <Icon size={18} color={colors.foreground} />
                  </View>
                  <Text style={styles.lessonIndex}>0{i + 1}</Text>
                </View>
                <Text style={styles.techCardTitle}>{item.title}</Text>
                <Text style={styles.techCardDesc}>{item.desc}</Text>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* ── QUICK ACCESS ── */}
      <View style={[styles.section, styles.sectionBordered]}>
        <Eyebrow label="Jelajahi" styles={styles} />
        <Text style={styles.sectionTitle}>
          Semua yang perlu diketahui tentang kelas ini.
        </Text>
        <View style={{ gap: Spacing.sm, marginTop: Spacing.lg }}>
          <QuickCard
            icon={UsersIcon}
            title="Murid & Guru"
            desc="Kenali seluruh anggota kelas XII RPL 2 dari ketua kelas hingga wali kelas."
            tag={`${studentsData.length} murid · ${teachersData.length} guru`}
            onPress={() => router.push('/students')}
            styles={styles}
            colors={colors}
          />
          <QuickCard
            icon={CalendarIcon}
            title="Jadwal Pelajaran"
            desc="Jadwal harian, piket, dan agenda kelas untuk seminggu penuh."
            tag="Senin – Jumat"
            onPress={() => router.push('/schedule')}
            styles={styles}
            colors={colors}
          />
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <QuickCard
              icon={ImagesIcon}
              title="Galeri"
              desc="Dokumentasi kegiatan kelas dalam gaya polaroid."
              tag="Foto"
              onPress={() => router.push('/gallery')}
              style={{ flex: 1 }}
              styles={styles}
              colors={colors}
            />
            <QuickCard
              icon={PlayIcon}
              title="Video"
              desc="Rekaman momen dan projek kelas."
              tag="Video"
              onPress={() => router.push('/videos')}
              style={{ flex: 1 }}
              styles={styles}
              colors={colors}
            />
          </View>
        </View>
      </View>

      {/* ── FOOTER ── */}
      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <View style={styles.footerBadge}>
          <CodeIcon size={16} color={colors.primaryForeground} />
        </View>
        <Text style={styles.footerTitle}>XII RPL 2 SMK INFOKOM</Text>
        <Text style={styles.footerSub}>Rekayasa Perangkat Lunak - Membangun Masa Depan Digital</Text>
        <View style={styles.footerDividerSmall} />
        <Text style={styles.footerCopy}>XII RPL 2 - All rights reserved</Text>
        <Text style={styles.footerMade}>Made by BadutZY, and supported by Claude AI</Text>
      </View>
    </AnimatedScrollView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  section: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xl },
  sectionBordered: { borderTopWidth: 1, borderTopColor: colors.border },

  eyebrow: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: Spacing.sm,
  },
  eyebrowText: {
    fontFamily: Typography.headingMedium,
    fontSize: 10.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.mutedForeground,
  },

  // Hero
  heroTitle: {
    fontFamily: Typography.heading,
    fontSize: 38,
    lineHeight: 40,
    color: colors.foreground,
    letterSpacing: -0.5,
  },
  heroTitleItalic: {
    fontFamily: Typography.body,
    fontStyle: 'italic',
    color: colors.mutedForeground,
    fontSize: 34,
  },
  heroDesc: {
    fontFamily: Typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.mutedForeground,
    marginTop: Spacing.md,
  },
  heroButtons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg, flexWrap: 'wrap' },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: BorderRadius.full,
  },
  btnPrimaryText: { fontFamily: Typography.bodyMedium, fontSize: 13.5, color: colors.primaryForeground },
  btnOutline: {
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: BorderRadius.full,
  },
  btnOutlineText: { fontFamily: Typography.bodyMedium, fontSize: 13.5, color: colors.foreground },

  heroImageWrap: { marginTop: Spacing.xl },
  heroImage: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'flex-end',
  },
  heroImageOverlay: { padding: Spacing.md },
  heroImageBadge: {
    alignSelf: 'flex-start',
    fontFamily: Typography.bodyMedium,
    fontSize: 11,
    color: colors.foreground,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  heroProgramCard: {
    position: 'absolute',
    left: Spacing.md,
    bottom: -18,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  heroProgramLabel: { fontFamily: Typography.body, fontSize: 9, letterSpacing: 1.2, color: colors.mutedForeground, marginBottom: 2 },
  heroProgramTitle: { fontFamily: Typography.heading, fontSize: 13, color: colors.foreground },

  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.xl + 6,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: { flex: 1 },
  statLabel: { fontFamily: Typography.bodyMedium, fontSize: 9.5, letterSpacing: 1.1, textTransform: 'uppercase', color: colors.mutedForeground },
  statValue: { fontFamily: Typography.heading, fontSize: 24, color: colors.foreground, marginTop: 4 },

  // Section title
  sectionTitle: {
    fontFamily: Typography.heading,
    fontSize: 24,
    lineHeight: 29,
    color: colors.foreground,
    marginTop: Spacing.xs,
  },

  // About / lessons cards
  aboutGrid: { marginTop: Spacing.lg, gap: Spacing.sm },
  techCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md + 2,
  },
  techCardTitle: { fontFamily: Typography.heading, fontSize: 16, color: colors.foreground, marginTop: Spacing.sm },
  techCardDesc: { fontFamily: Typography.body, fontSize: 13, lineHeight: 19, color: colors.mutedForeground, marginTop: 6 },

  lessonsGrid: { marginTop: Spacing.lg, gap: Spacing.sm },
  lessonTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lessonIndex: { fontFamily: Typography.bodyMedium, fontSize: 11, color: colors.mutedForeground },

  iconBadge: {
    width: 40, height: 40, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1, borderColor: colors.cardBorder,
  },

  // Quick access
  quickCardWrap: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md + 2,
    minHeight: 150,
    justifyContent: 'space-between',
  },
  quickCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  quickTag: { fontFamily: Typography.bodyMedium, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.mutedForeground },
  quickTitle: { fontFamily: Typography.heading, fontSize: 17, color: colors.foreground, marginTop: Spacing.md },
  quickDesc: { fontFamily: Typography.body, fontSize: 12.5, lineHeight: 18, color: colors.mutedForeground, marginTop: 4 },
  quickOpenRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm },
  quickOpenText: { fontFamily: Typography.bodyMedium, fontSize: 12.5, color: colors.foreground },

  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  footerDivider: { height: 1, backgroundColor: colors.border, width: '100%', marginBottom: Spacing.lg },
  footerBadge: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  footerTitle: { fontFamily: Typography.heading, fontSize: 15, color: colors.foreground, textAlign: 'center' },
  footerSub: { fontFamily: Typography.body, fontSize: 12.5, color: colors.mutedForeground, textAlign: 'center', marginTop: 4 },
  footerDividerSmall: { height: 1, width: 32, backgroundColor: colors.border, marginVertical: Spacing.md },
  footerCopy: { fontFamily: Typography.body, fontSize: 11.5, color: colors.mutedForeground },
  footerMade: { fontFamily: Typography.body, fontSize: 10.5, color: colors.mutedForeground, opacity: 0.6, marginTop: 4 },
});