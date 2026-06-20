import React, { useRef, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeInDown,
  FadeIn,
  ZoomIn,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Typography, BorderRadius, Spacing, Gradients } from '../../src/constants/theme';
import {
  CodeIcon,
  UsersIcon,
  CalendarIcon,
  ArrowRightIcon,
  DatabaseIcon,
  CpuIcon,
  ImagesIcon,
} from '../../src/components/Icons';
import { galleryPreview } from '../../src/data/gallery';

const { width: SCREEN_W } = Dimensions.get('window');

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function SectionDivider() {
  return (
    <View style={styles.divider}>
      <LinearGradient colors={['#7c3aed', '#10b981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.dividerLine} />
    </View>
  );
}

function GradientText({ children, style }: { children: string; style?: any }) {
  return (
    <Text style={[style, { color: Colors.primary }]}>{children}</Text>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const scrollToAbout = () => {
    scrollRef.current?.scrollTo({ y: 480, animated: true });
  };

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {/* HERO */}
      <View style={styles.hero}>
        <ImageBackground
          source={require('../../assets/gallery/hero-class.jpeg')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(10,14,40,0.82)', 'rgba(8,11,28,0.93)']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.heroContent}>
          <AnimatedView entering={ZoomIn.duration(500)} style={styles.heroBadge}>
            <LinearGradient
              colors={['rgba(124,58,237,0.2)', 'rgba(16,185,129,0.2)']}
              style={styles.heroBadgeGrad}
            >
              <CodeIcon size={36} color={Colors.secondary} />
            </LinearGradient>
          </AnimatedView>

          <AnimatedView entering={FadeInDown.delay(100).duration(500)}>
            <Text style={styles.heroSchool}>SMK INFOKOM</Text>
            <Text style={styles.heroClass}>11 RPL 2</Text>
          </AnimatedView>

          <AnimatedView entering={FadeInDown.delay(200).duration(500)}>
            <Text style={styles.heroDesc}>
              Rekayasa Perangkat Lunak - Membangun masa depan digital dengan kode dan kreativitas.
            </Text>
          </AnimatedView>

          <AnimatedView entering={FadeInDown.delay(300).duration(500)} style={styles.heroButtons}>
            <TouchableOpacity onPress={() => router.push('/students')} activeOpacity={0.85}>
              <LinearGradient colors={['#6d28d9', '#5b21b6']} style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>Lihat Murid</Text>
                <ArrowRightIcon size={16} color={Colors.foreground} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/schedule')}
              style={styles.btnOutline}
              activeOpacity={0.85}
            >
              <Text style={styles.btnOutlineText}>Lihat Jadwal</Text>
            </TouchableOpacity>
          </AnimatedView>

          <TouchableOpacity onPress={scrollToAbout} style={styles.scrollDown} activeOpacity={0.7}>
            <ArrowDownBounce />
          </TouchableOpacity>
        </View>
      </View>

      {/* ABOUT */}
      <View style={styles.section}>
        <AnimatedView entering={FadeInDown.duration(500)}>
          <Text style={styles.sectionTitle}>Tentang <Text style={{ color: Colors.primary }}>XI RPL 2</Text></Text>
          <Text style={styles.sectionDesc}>
            XI RPL 2 di SMK Infokom fokus pada pengembangan keterampilan teknis dan kreatif untuk mempersiapkan siswa menjadi profesional di bidang teknologi informasi.
          </Text>
        </AnimatedView>

        <View style={styles.cardGrid}>
          {[
            { title: 'Kurikulum', desc: 'Kurikulum dirancang untuk mengajarkan pemrograman, pengembangan web, manajemen database, dan robotik dengan pendekatan praktis dan proyek berbasis industri.' },
            { title: 'Kegiatan', desc: 'Siswa terlibat dalam pelatihan intensif untuk mengasah kemampuan coding dan kolaborasi dalam lingkungan profesional.' },
          ].map((item, i) => (
            <AnimatedView key={item.title} entering={FadeInDown.delay(i * 100).duration(500)}>
              <LinearGradient colors={['rgba(124,58,237,0.08)', 'rgba(16,185,129,0.04)']} style={styles.techCard}>
                <View style={styles.techCardBorder} />
                <Text style={styles.techCardTitle}>{item.title}</Text>
                <Text style={styles.techCardDesc}>{item.desc}</Text>
              </LinearGradient>
            </AnimatedView>
          ))}
        </View>
      </View>

      {/* LESSONS */}
      <View style={styles.section}>
        <AnimatedView entering={FadeInDown.duration(500)} style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
          <Text style={styles.sectionTitleLarge}>
            <Text style={{ color: Colors.primary }}>Pelajaran</Text>
            {' '}
            <Text style={{ color: Colors.foreground }}>yang Kami Pelajari</Text>
          </Text>
          <SectionDivider />
          <Text style={[styles.sectionDesc, { textAlign: 'center' }]}>
            Menguasai berbagai teknologi modern untuk membangun aplikasi dan sistem yang inovatif.
          </Text>
        </AnimatedView>

        <View style={styles.lessonsGrid}>
          {[
            {
              icon: <CodeIcon size={36} color="#f97316" />,
              title: 'Web Development',
              desc: 'Membangun website modern dengan Laravel.',
              tags: [{ label: 'Laravel', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' }],
            },
            {
              icon: <DatabaseIcon size={36} color={Colors.secondary} />,
              title: 'Database',
              desc: 'Mengelola data dengan sistem database relasional dan non-relasional.',
              tags: [
                { label: 'MySQL', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
                { label: 'PhpMyAdmin', color: '#facc15', bg: 'rgba(250,204,21,0.15)' },
              ],
            },
            {
              icon: <CpuIcon size={36} color="#60a5fa" />,
              title: 'Robotic',
              desc: 'Perancangan, pembuatan, dan penggunaan robot.',
              tags: [{ label: 'C++', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' }],
            },
          ].map((item, i) => (
            <AnimatedView key={item.title} entering={FadeInDown.delay(i * 80).duration(400)}>
              <LinearGradient colors={['rgba(124,58,237,0.08)', 'rgba(16,185,129,0.04)']} style={styles.lessonCard}>
                <View style={styles.techCardBorder} />
                <View style={styles.lessonIconWrap}>{item.icon}</View>
                <Text style={styles.lessonTitle}>{item.title}</Text>
                <Text style={styles.lessonDesc}>{item.desc}</Text>
                <View style={styles.tagRow}>
                  {item.tags.map((tag) => (
                    <View key={tag.label} style={[styles.tag, { backgroundColor: tag.bg, borderColor: tag.color + '60' }]}>
                      <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </AnimatedView>
          ))}
        </View>
      </View>

      {/* GALLERY PREVIEW */}
      <View style={styles.section}>
        <AnimatedView entering={FadeInDown.duration(500)} style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
          <Text style={styles.sectionTitleLarge}>
            <Text style={{ color: Colors.primary }}>Gallery</Text>
            {' '}
            <Text style={{ color: Colors.foreground }}>Kelas</Text>
          </Text>
          <SectionDivider />
          <Text style={[styles.sectionDesc, { textAlign: 'center' }]}>
            Momen-momen seru dan kenangan berharga bersama XI RPL 2.
          </Text>
        </AnimatedView>

        <View style={styles.galleryGrid}>
          {galleryPreview.map((img, i) => (
            <AnimatedView
              key={img.id}
              entering={FadeInDown.delay(i * 60).duration(400)}
              style={[styles.galleryItem, i % 3 === 1 ? { marginTop: 12 } : {}]}
            >
              <Image source={img.src} style={styles.galleryImg} resizeMode="cover" />
            </AnimatedView>
          ))}
        </View>

        <AnimatedView entering={FadeInDown.delay(300).duration(400)} style={{ alignItems: 'center', marginTop: Spacing.lg }}>
          <TouchableOpacity onPress={() => router.push('/gallery')} activeOpacity={0.85}>
            <LinearGradient colors={['#6d28d9', '#5b21b6']} style={styles.btnPrimary}>
              <ImagesIcon size={18} color={Colors.foreground} />
              <Text style={styles.btnPrimaryText}>View More</Text>
              <ArrowRightIcon size={16} color={Colors.foreground} />
            </LinearGradient>
          </TouchableOpacity>
        </AnimatedView>
      </View>

      {/* QUICK ACCESS */}
      <View style={styles.section}>
        <AnimatedView entering={FadeInDown.duration(500)} style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
          <Text style={styles.sectionTitleLarge}>
            <Text style={{ color: Colors.primary }}>Lihat Lainnya</Text>
          </Text>
          <SectionDivider />
        </AnimatedView>

        <View style={styles.quickGrid}>
          <AnimatedView entering={FadeInDown.delay(100).duration(400)} style={styles.quickCardWrap}>
            <LinearGradient colors={['rgba(124,58,237,0.08)', 'rgba(16,185,129,0.04)']} style={styles.quickCard}>
              <View style={styles.techCardBorder} />
              <UsersIcon size={80} color={Colors.primary} />
              <Text style={styles.quickTitle}>Data Siswa & Guru</Text>
              <Text style={styles.quickDesc}>Lihat daftar murid dan guru XI RPL 2.</Text>
              <TouchableOpacity onPress={() => router.push('/students')} activeOpacity={0.85}>
                <LinearGradient colors={['#6d28d9', '#5b21b6']} style={styles.btnSmall}>
                  <Text style={styles.btnSmallText}>See the Students</Text>
                  <ArrowRightIcon size={14} color={Colors.foreground} />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </AnimatedView>

          <AnimatedView entering={FadeInDown.delay(200).duration(400)} style={styles.quickCardWrap}>
            <LinearGradient colors={['rgba(124,58,237,0.08)', 'rgba(16,185,129,0.04)']} style={styles.quickCard}>
              <View style={styles.techCardBorder} />
              <CalendarIcon size={80} color={Colors.secondary} />
              <Text style={styles.quickTitle}>Jadwal Pelajaran</Text>
              <Text style={styles.quickDesc}>Lihat jadwal pelajaran dan jadwal piket XI RPL 2.</Text>
              <TouchableOpacity onPress={() => router.push('/schedule')} activeOpacity={0.85}>
                <LinearGradient colors={['#059669', '#047857']} style={styles.btnSmall}>
                  <Text style={styles.btnSmallText}>See Schedule</Text>
                  <ArrowRightIcon size={14} color={Colors.foreground} />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </AnimatedView>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <View style={styles.footerContent}>
          <Text style={styles.footerTitle}>XI RPL 2 SMK INFOKOM</Text>
          <Text style={styles.footerSub}>Rekayasa Perangkat Lunak - Membangun Masa Depan Digital</Text>
          <Text style={styles.footerCopy}>&copy; XI RPL 2 - All rights reserved</Text>
          <Text style={styles.footerMade}>Made by BadutZY, Claude & Lovable</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function ArrowDownBounce() {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    const bounce = () => {
      translateY.value = withTiming(-8, { duration: 600 }, (finished) => {
        if (finished) {
          translateY.value = withTiming(0, { duration: 600 }, (done) => {
            if (done) runOnJS(bounce)();
          });
        }
      });
    };
    bounce();
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <AnimatedView style={style}>
      <ArrowDownIcon size={26} color={`${Colors.foreground}90`} />
    </AnimatedView>
  );
}

function ArrowDownIcon({ size, color }: { size: number; color: string }) {
  // Reuse the ArrowDown SVG from Icons - downward chevron
  const { default: Svg, Line, Polyline } = require('react-native-svg');
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Polyline points="19 12 12 19 5 12" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // HERO
  hero: {
    height: 580,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    zIndex: 2,
  },
  heroBadge: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.35)',
  },
  heroBadgeGrad: {
    padding: Spacing.md,
  },
  heroSchool: {
    fontFamily: Typography.heading,
    fontSize: 34,
    color: Colors.foreground,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroClass: {
    fontFamily: Typography.heading,
    fontSize: 42,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroDesc: {
    fontFamily: Typography.body,
    fontSize: 15,
    color: `${Colors.foreground}CC`,
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  scrollDown: {
    marginTop: Spacing.sm,
  },
  // BUTTONS
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  btnPrimaryText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 14,
    color: Colors.foreground,
  },
  btnOutline: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  btnOutlineText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 14,
    color: Colors.foreground,
  },
  btnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  btnSmallText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 13,
    color: Colors.foreground,
  },
  // SECTIONS
  section: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xxl,
  },
  sectionTitle: {
    fontFamily: Typography.heading,
    fontSize: 26,
    color: Colors.foreground,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitleLarge: {
    fontFamily: Typography.heading,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  sectionDesc: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: Spacing.lg,
  },
  divider: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  dividerLine: {
    width: 60,
    height: 3,
    borderRadius: 2,
  },
  // CARDS
  cardGrid: {
    gap: Spacing.md,
  },
  techCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  techCardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  techCardTitle: {
    fontFamily: Typography.heading,
    fontSize: 17,
    color: Colors.foreground,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  techCardDesc: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
  },
  // LESSONS
  lessonsGrid: {
    gap: Spacing.md,
  },
  lessonCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  lessonIconWrap: {
    marginBottom: Spacing.md,
  },
  lessonTitle: {
    fontFamily: Typography.heading,
    fontSize: 18,
    color: Colors.foreground,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  lessonDesc: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tag: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: Typography.body,
    fontSize: 11,
    fontWeight: '600',
  },
  // GALLERY
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
  },
  galleryItem: {
    width: (SCREEN_W - 32 - 12) / 3,
    aspectRatio: 0.85,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  galleryImg: {
    width: '100%',
    height: '100%',
  },
  // QUICK ACCESS
  quickGrid: {
    gap: Spacing.md,
  },
  quickCardWrap: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  quickCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quickTitle: {
    fontFamily: Typography.heading,
    fontSize: 18,
    color: Colors.foreground,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  quickDesc: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
  },
  // FOOTER
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    paddingTop: 0,
  },
  footerDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  footerContent: {
    alignItems: 'center',
    gap: 4,
  },
  footerTitle: {
    fontFamily: Typography.heading,
    fontSize: 18,
    color: Colors.primary,
    textAlign: 'center',
  },
  footerSub: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  footerCopy: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
  footerMade: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: `${Colors.mutedForeground}80`,
    textAlign: 'center',
  },
});