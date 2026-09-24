import React, { useState, useCallback, useRef, memo, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { Typography, BorderRadius, Spacing, type ThemeColors } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { galleryByGrade, GalleryImage, GalleryGrade } from '../../src/data/gallery';
import {
  ImagesIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../../src/components/Icons';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const GRID_GAP = 10;
const NUM_COLS = 2;
const TILE_W = (SCREEN_W - Spacing.md * 2 - GRID_GAP * (NUM_COLS - 1)) / NUM_COLS;

const GRADE_TABS: GalleryGrade[] = ['XI', 'XII'];
// Tab yang terbuka pertama kali saat halaman gallery dibuka.
const DEFAULT_GRADE: GalleryGrade = 'XII';

// Plain, simple photo tile — square, image fills 100% of the tile, no frame/tilt.
interface TileProps { img: GalleryImage; index: number; onPress: (idx: number) => void; }

const PhotoTile = memo(({ img, index, onPress }: TileProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const pressScale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressScale.value }] }));

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 40, 480)).duration(380)}
      style={[styles.tileWrap, scaleStyle]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress(index)}
        onPressIn={() => { pressScale.value = withSpring(0.96, { damping: 20, stiffness: 300 }); }}
        onPressOut={() => { pressScale.value = withSpring(1, { damping: 20, stiffness: 300 }); }}
        style={styles.tile}
      >
        <Image source={img.src} style={styles.tileImg} resizeMode="cover" />
      </TouchableOpacity>
    </Animated.View>
  );
});

// Lightbox
interface LightboxProps { visible: boolean; idx: number | null; images: GalleryImage[]; onClose: () => void; onPrev: () => void; onNext: () => void; }

function Lightbox({ visible, idx, images, onClose, onPrev, onNext }: LightboxProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const overlayOp = useSharedValue(0);
  const boxSc = useSharedValue(0.9);
  const imgOp = useSharedValue(1);
  const imgTx = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      overlayOp.value = withTiming(1, { duration: 200 });
      boxSc.value = withSpring(1, { damping: 22, stiffness: 250 });
      imgOp.value = 1; imgTx.value = 0;
    }
  }, [visible]);

  useEffect(() => { if (visible) { imgOp.value = withTiming(1, { duration: 160 }); imgTx.value = 0; } }, [idx]);

  const handlePrev = useCallback(() => {
    imgTx.value = withTiming(50, { duration: 110 });
    imgOp.value = withTiming(0, { duration: 130 }, (done) => { if (done) runOnJS(onPrev)(); });
  }, [onPrev]);

  const handleNext = useCallback(() => {
    imgTx.value = withTiming(-50, { duration: 110 });
    imgOp.value = withTiming(0, { duration: 130 }, (done) => { if (done) runOnJS(onNext)(); });
  }, [onNext]);

  const handleClose = () => {
    imgOp.value = withTiming(0, { duration: 100 });
    overlayOp.value = withTiming(0, { duration: 180 }, (done) => { if (done) runOnJS(onClose)(); });
    boxSc.value = withSpring(0.9);
  };

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOp.value }));
  const boxStyle = useAnimatedStyle(() => ({ opacity: overlayOp.value, transform: [{ scale: boxSc.value }] }));
  const imgStyle = useAnimatedStyle(() => ({ opacity: imgOp.value, transform: [{ translateX: imgTx.value }] }));

  if (!visible || idx === null) return null;
  const img = images[idx];
  if (!img) return null;

  return (
    <Modal transparent visible={visible} onRequestClose={handleClose} animationType="none" statusBarTranslucent>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      <Animated.View style={[styles.lbOverlay, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
        <TouchableOpacity style={styles.lbClose} onPress={handleClose}>
          <View style={styles.lbIconBtn}><XIcon size={18} color="#f5f3ee" /></View>
        </TouchableOpacity>
        <View style={styles.lbCounterWrap}>
          <View style={styles.lbCounterInner}>
            <ImagesIcon size={11} color="#f5f3ee" />
            <Text style={styles.lbCounterText}>{(idx ?? 0) + 1} / {images.length}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.lbPrev} onPress={handlePrev}>
          <View style={styles.lbIconBtn}><ChevronLeftIcon size={22} color="#f5f3ee" /></View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.lbNext} onPress={handleNext}>
          <View style={styles.lbIconBtn}><ChevronRightIcon size={22} color="#f5f3ee" /></View>
        </TouchableOpacity>

        <Animated.View style={[styles.lbCard, boxStyle]}>
          <View style={styles.lbImgWrap}>
            <Animated.Image key={idx} source={img.src} style={[styles.lbImg, imgStyle]} resizeMode="contain" />
          </View>
          <View style={styles.lbFooter}>
            <Text style={styles.lbTitle} numberOfLines={1}>{(img.title || '').trim() || 'XII RPL 2'}</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const GalleryHeader = memo(({ count }: { count: number }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.header}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.eyebrow}>
        <ImagesIcon size={11} color={colors.mutedForeground} />
        <Text style={styles.eyebrowText}>Dokumentasi</Text>
      </Animated.View>
      <Animated.Text entering={FadeInDown.delay(80).duration(400)} style={styles.pageTitle}>
        Galeri <Text style={styles.pageTitleItalic}>kegiatan</Text>.
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(150).duration(400)} style={styles.pageDesc}>
        Momen-momen berharga kelas XI & XII RPL 2, tersusun dalam grid rapi.
      </Animated.Text>
      <Animated.View entering={FadeInDown.delay(220).duration(400)} style={styles.countBadge}>
        <Text style={styles.countBadgeText}>{count} Foto</Text>
      </Animated.View>
    </View>
  );
});

interface GradeTabsProps { active: GalleryGrade; onChange: (g: GalleryGrade) => void; }

const GradeTabs = memo(({ active, onChange }: GradeTabsProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Animated.View entering={FadeInDown.delay(260).duration(400)} style={styles.tabsWrap}>
      {GRADE_TABS.map((grade) => {
        const isActive = grade === active;
        return (
          <TouchableOpacity
            key={grade}
            activeOpacity={0.85}
            onPress={() => onChange(grade)}
            style={[styles.tabBtn, isActive && styles.tabBtnActive]}
          >
            <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
              Kelas {grade}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
});

export default function GalleryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [activeGrade, setActiveGrade] = useState<GalleryGrade>(DEFAULT_GRADE);
  const [selIdx, setSelIdx] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const activeImages = galleryByGrade[activeGrade];

  useFocusEffect(useCallback(() => { scrollRef.current?.scrollTo({ y: 0, animated: false }); }, []));

  const handleChangeGrade = useCallback((grade: GalleryGrade) => {
    setActiveGrade(grade);
    setSelIdx(null);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const goNext = useCallback(() => setSelIdx((p) => (p !== null ? (p + 1) % activeImages.length : null)), [activeImages.length]);
  const goPrev = useCallback(() => setSelIdx((p) => (p !== null ? (p - 1 + activeImages.length) % activeImages.length : null)), [activeImages.length]);

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <GalleryHeader count={activeImages.length} />
        <GradeTabs active={activeGrade} onChange={handleChangeGrade} />

        {activeImages.length === 0 ? (
          <View style={styles.emptyWrap}>
            <ImagesIcon size={22} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>Belum ada foto untuk kelas {activeGrade}.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {activeImages.map((img, i) => (
              <PhotoTile key={`${activeGrade}-${img.id}`} img={img} index={i} onPress={setSelIdx} />
            ))}
          </View>
        )}
        <View style={{ height: 48 }} />
      </ScrollView>

      <Lightbox visible={selIdx !== null} idx={selIdx} images={activeImages} onClose={() => setSelIdx(null)} onPrev={goPrev} onNext={goNext} />
    </View>
  );
}

const LB_TOP = (StatusBar.currentHeight || 44) + 8;

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  eyebrow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 5,
  },
  eyebrowText: { fontFamily: Typography.headingMedium, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.mutedForeground },

  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  pageTitle: { fontFamily: Typography.heading, fontSize: 28, color: colors.foreground, marginTop: Spacing.sm },
  pageTitleItalic: { fontFamily: Typography.body, fontStyle: 'italic', color: colors.mutedForeground },
  pageDesc: { fontFamily: Typography.body, fontSize: 14, lineHeight: 20, color: colors.mutedForeground, marginTop: Spacing.sm },
  countBadge: {
    alignSelf: 'flex-start', marginTop: Spacing.md,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 5,
  },
  countBadgeText: { fontFamily: Typography.bodyMedium, fontSize: 11.5, color: colors.mutedForeground },

  // Grade tabs (Kelas XI / Kelas XII)
  tabsWrap: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabBtnText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 13,
    color: colors.mutedForeground,
  },
  tabBtnTextActive: {
    color: colors.primaryForeground,
  },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 64,
    paddingHorizontal: Spacing.md,
  },
  emptyText: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: 'center',
  },

  // Plain 2-column grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: GRID_GAP,
  },
  tileWrap: { width: TILE_W },
  tile: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface2,
  },
  tileImg: { width: '100%', height: '100%' },

  // Lightbox — intentionally kept dark regardless of theme
  lbOverlay: { flex: 1, backgroundColor: 'rgba(20,18,16,0.96)', alignItems: 'center', justifyContent: 'center' },
  lbClose: { position: 'absolute', top: LB_TOP, right: 16, zIndex: 30 },
  lbCounterWrap: { position: 'absolute', top: LB_TOP + 2, alignSelf: 'center', zIndex: 30 },
  lbCounterInner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.full, backgroundColor: 'rgba(245,243,238,0.15)' },
  lbCounterText: { fontFamily: Typography.bodyMedium, fontSize: 12, color: '#f5f3ee' },
  lbPrev: { position: 'absolute', left: 10, top: '50%', marginTop: -24, zIndex: 30 },
  lbNext: { position: 'absolute', right: 10, top: '50%', marginTop: -24, zIndex: 30 },
  lbIconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,243,238,0.12)', borderWidth: 1, borderColor: 'rgba(245,243,238,0.18)' },
  lbCard: { backgroundColor: '#1a1917', borderRadius: BorderRadius.xl, overflow: 'hidden', width: SCREEN_W * 0.92 },
  lbImgWrap: { width: SCREEN_W * 0.92, height: SCREEN_H * 0.58, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#242220' },
  lbImg: { width: SCREEN_W * 0.92, height: SCREEN_H * 0.58 },
  lbFooter: { paddingHorizontal: Spacing.md, paddingVertical: 14 },
  lbTitle: { fontFamily: Typography.bodyMedium, fontSize: 13, color: '#f5f3ee' },
});