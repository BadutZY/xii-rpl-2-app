/**
 * gallery.tsx  —  app/(tabs)/gallery.tsx
 *
 * Fix:
 *  1. Grid masonry 2 kolom — foto selalu cover, TIDAK ada blank space
 *  2. Lightbox zoom: pinch-to-zoom + double-tap + pan saat zoomed + tombol reset
 *  3. Tidak pakai clamp() dari reanimated (tidak tersedia di v4) → Math.min/Math.max
 *  4. Worklet directives tidak dibungkus useCallback
 *  5. isZoomed dikontrol useState biasa (bukan .value saat render)
 */

import React, { useState, useCallback, useRef, memo } from 'react';
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
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useFocusEffect } from 'expo-router';
import { Colors, Typography, BorderRadius, Spacing } from '../../src/constants/theme';
import { galleryImages, GalleryImage } from '../../src/data/gallery';
import {
  ImagesIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../../src/components/Icons';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const COL_GAP = 8;
const ROW_GAP = 8;
const CELL_W = Math.floor((SCREEN_W - Spacing.md * 2 - COL_GAP) / 2);
const MAX_ZOOM = 4;

// ─── Masonry column builder ───────────────────────────────────────────────────
// Bagi gambar ke 2 kolom bergantian agar tinggi kolom seimbang
function splitColumns(imgs: GalleryImage[]) {
  const left: GalleryImage[] = [];
  const right: GalleryImage[] = [];
  imgs.forEach((img, i) => {
    if (i % 2 === 0) left.push(img);
    else right.push(img);
  });
  return { left, right };
}

const { left: LEFT_COL, right: RIGHT_COL } = splitColumns(galleryImages);

// ─── PhotoCard ────────────────────────────────────────────────────────────────
interface CardProps {
  img: GalleryImage;
  globalIdx: number;
  colIdx: number;
  onPress: (idx: number) => void;
}

const PhotoCard = memo(({ img, globalIdx, colIdx, onPress }: CardProps) => {
  // Tinggi default 4:3, akan diupdate setelah gambar load
  const [h, setH] = useState(Math.round(CELL_W * 0.75));
  const didLoad = useRef(false);

  const onLoad = (e: any) => {
    if (didLoad.current) return;
    didLoad.current = true;
    const { width, height } = e.nativeEvent.source;
    if (width > 0) setH(Math.round((height / width) * CELL_W));
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(colIdx * 60, 480)).duration(400)}
      style={{ marginBottom: ROW_GAP }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPress(globalIdx)}
        style={[styles.card, { height: h }]}
      >
        <Image
          source={img.src}
          style={styles.cardImg}
          resizeMode="cover"   // COVER — tidak ada blank space
          onLoad={onLoad}
          fadeDuration={150}
        />
      </TouchableOpacity>
    </Animated.View>
  );
});

// ─── Reset Zoom Button ────────────────────────────────────────────────────────
const ResetBtn = memo(({ onPress, show }: { onPress: () => void; show: boolean }) => {
  const anim = useAnimatedStyle(() => ({
    opacity: withTiming(show ? 1 : 0, { duration: 180 }),
    transform: [{ scale: withSpring(show ? 1 : 0.7, { damping: 18 }) }],
  }));
  return (
    <Animated.View style={[styles.resetWrap, anim]} pointerEvents={show ? 'auto' : 'none'}>
      <TouchableOpacity style={styles.resetBtn} onPress={onPress}>
        <Text style={styles.resetTxt}>↺  Reset</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ─── Lightbox ─────────────────────────────────────────────────────────────────
interface LightboxProps {
  visible: boolean;
  idx: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ visible, idx, onClose, onPrev, onNext }: LightboxProps) {
  // Modal open/close animation
  const overlayOp = useSharedValue(0);
  const boxSc = useSharedValue(0.88);

  // Opacity gambar — untuk fade transition saat ganti foto
  const imgOp = useSharedValue(1);

  // Zoom + pan shared values (diakses hanya di worklet)
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  // State React biasa untuk kontrol tombol reset — TIDAK baca .value saat render
  const [zoomed, setZoomed] = useState(false);

  // Fungsi reset zoom — dipanggil dari JS thread
  const doResetZoom = useCallback(() => {
    scale.value = withSpring(1, { damping: 20, stiffness: 220 });
    savedScale.value = 1;
    tx.value = withSpring(0, { damping: 20, stiffness: 220 });
    ty.value = withSpring(0, { damping: 20, stiffness: 220 });
    savedTx.value = 0;
    savedTy.value = 0;
    setZoomed(false);
  }, []);

  // Buka modal
  React.useEffect(() => {
    if (visible) {
      overlayOp.value = withTiming(1, { duration: 200 });
      boxSc.value = withSpring(1, { damping: 22, stiffness: 250 });
      imgOp.value = 1;
      doResetZoom();
    }
  }, [visible]);

  // Fade in saat idx berubah (setelah parent update index, gambar fade in kembali)
  React.useEffect(() => {
    if (visible) {
      imgOp.value = withTiming(1, { duration: 180 });
      doResetZoom();
    }
  }, [idx]);

  // Wrapper prev/next: fade out → panggil parent → fade in via useEffect idx
  const handlePrev = useCallback(() => {
    imgOp.value = withTiming(0, { duration: 140 }, (done) => {
      if (done) runOnJS(onPrev)();
    });
  }, [onPrev]);

  const handleNext = useCallback(() => {
    imgOp.value = withTiming(0, { duration: 140 }, (done) => {
      if (done) runOnJS(onNext)();
    });
  }, [onNext]);

  const handleClose = () => {
    imgOp.value = withTiming(0, { duration: 120 });
    overlayOp.value = withTiming(0, { duration: 150 }, (done) => {
      if (done) runOnJS(onClose)();
    });
    boxSc.value = withSpring(0.88);
  };

  // ── Pinch gesture ────────────────────────────────────────────────────────
  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      'worklet';
      const next = savedScale.value * e.scale;
      scale.value = Math.min(Math.max(next, 1), MAX_ZOOM);
    })
    .onEnd(() => {
      'worklet';
      if (scale.value < 1.08) {
        scale.value = withSpring(1, { damping: 20, stiffness: 220 });
        savedScale.value = 1;
        tx.value = withSpring(0, { damping: 20, stiffness: 220 });
        ty.value = withSpring(0, { damping: 20, stiffness: 220 });
        savedTx.value = 0;
        savedTy.value = 0;
        runOnJS(setZoomed)(false);
      } else {
        savedScale.value = scale.value;
        runOnJS(setZoomed)(true);
      }
    });

  // ── Pan gesture (aktif saat zoom > 1) ────────────────────────────────────
  const pan = Gesture.Pan()
    .minDistance(1)
    .averageTouches(true)
    .onUpdate((e) => {
      'worklet';
      if (savedScale.value <= 1) return;
      const limitX = ((scale.value - 1) * SCREEN_W * 0.9) / 2;
      const limitY = ((scale.value - 1) * SCREEN_H * 0.62) / 2;
      tx.value = Math.min(Math.max(savedTx.value + e.translationX, -limitX), limitX);
      ty.value = Math.min(Math.max(savedTy.value + e.translationY, -limitY), limitY);
    })
    .onEnd(() => {
      'worklet';
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  // ── Double tap: toggle zoom 2.5x ─────────────────────────────────────────
  const dblTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd(() => {
      'worklet';
      if (savedScale.value > 1) {
        scale.value = withSpring(1, { damping: 20, stiffness: 220 });
        savedScale.value = 1;
        tx.value = withSpring(0, { damping: 20, stiffness: 220 });
        ty.value = withSpring(0, { damping: 20, stiffness: 220 });
        savedTx.value = 0;
        savedTy.value = 0;
        runOnJS(setZoomed)(false);
      } else {
        scale.value = withSpring(2.5, { damping: 20, stiffness: 220 });
        savedScale.value = 2.5;
        runOnJS(setZoomed)(true);
      }
    });

  // Pinch + pan berjalan bersamaan; double-tap dikomposisi juga
  const gesture = Gesture.Simultaneous(
    Gesture.Simultaneous(pinch, pan),
    dblTap
  );

  // ── Animated styles ───────────────────────────────────────────────────────
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOp.value }));
  const boxStyle = useAnimatedStyle(() => ({
    opacity: overlayOp.value,
    transform: [{ scale: boxSc.value }],
  }));
  const imgStyle = useAnimatedStyle(() => ({
    opacity: imgOp.value,
    transform: [
      { scale: scale.value },
      { translateX: tx.value },
      { translateY: ty.value },
    ],
  }));

  if (!visible || idx === null) return null;
  const img = galleryImages[idx];

  return (
    <Modal transparent visible={visible} onRequestClose={handleClose} animationType="none" statusBarTranslucent>
      <StatusBar backgroundColor="transparent" translucent />
      <Animated.View style={[styles.lbOverlay, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />

        {/* Close */}
        <TouchableOpacity style={styles.lbClose} onPress={handleClose}>
          <View style={styles.lbIconBtn}><XIcon size={20} color={Colors.foreground} /></View>
        </TouchableOpacity>

        {/* Reset zoom */}
        <ResetBtn onPress={doResetZoom} show={zoomed} />

        {/* Prev */}
        <TouchableOpacity style={styles.lbPrev} onPress={handlePrev}>
          <View style={styles.lbIconBtn}><ChevronLeftIcon size={24} color={Colors.foreground} /></View>
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity style={styles.lbNext} onPress={handleNext}>
          <View style={styles.lbIconBtn}><ChevronRightIcon size={24} color={Colors.foreground} /></View>
        </TouchableOpacity>

        {/* Card */}
        <Animated.View style={[styles.lbCard, boxStyle]}>
          <GestureDetector gesture={gesture}>
            <Animated.View style={styles.lbImgWrap}>
              <Animated.Image
                key={idx}
                source={img.src}
                style={[styles.lbImg, imgStyle]}
                resizeMode="contain"
              />
            </Animated.View>
          </GestureDetector>

          <View style={styles.lbFooter}>
            <Text style={styles.lbTitle} numberOfLines={1}>{img.title?.trim() || ' '}</Text>
            <Text style={styles.lbCounter}>{idx + 1} / {galleryImages.length}</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Gallery Header ───────────────────────────────────────────────────────────
const GalleryHeader = memo(() => (
  <View style={styles.header}>
    <Animated.View entering={ZoomIn.duration(420)} style={styles.badge}>
      <LinearGradient colors={['rgba(124,58,237,0.2)', 'rgba(16,185,129,0.2)']} style={styles.badgeGrad}>
        <ImagesIcon size={32} color={Colors.secondary} />
      </LinearGradient>
    </Animated.View>
    <Animated.Text entering={FadeInDown.delay(100).duration(420)} style={styles.pageTitle}>
      Photo Gallery
    </Animated.Text>
    <Animated.Text entering={FadeInDown.delay(200).duration(420)} style={styles.pageDesc}>
      Momen-momen berharga kelas XI RPL 2
    </Animated.Text>
  </View>
));

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GalleryScreen() {
  const [selIdx, setSelIdx] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []));

  const goNext = useCallback(() => {
    setSelIdx((p) => p !== null ? (p + 1) % galleryImages.length : null);
  }, []);

  const goPrev = useCallback(() => {
    setSelIdx((p) => p !== null ? (p - 1 + galleryImages.length) % galleryImages.length : null);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <GalleryHeader />

        {/* 2-kolom layout: kiri dan kanan dalam satu baris ScrollView */}
        <View style={styles.grid}>
          {/* Kolom kiri */}
          <View style={styles.col}>
            {LEFT_COL.map((img, ci) => {
              const gi = ci * 2; // index global: 0, 2, 4, ...
              return (
                <PhotoCard
                  key={img.id}
                  img={img}
                  globalIdx={gi}
                  colIdx={ci}
                  onPress={setSelIdx}
                />
              );
            })}
          </View>

          {/* Kolom kanan */}
          <View style={styles.col}>
            {RIGHT_COL.map((img, ci) => {
              const gi = ci * 2 + 1; // index global: 1, 3, 5, ...
              return (
                <PhotoCard
                  key={img.id}
                  img={img}
                  globalIdx={gi}
                  colIdx={ci}
                  onPress={setSelIdx}
                />
              );
            })}
          </View>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>

      <Lightbox
        visible={selIdx !== null}
        idx={selIdx}
        onClose={() => setSelIdx(null)}
        onPrev={goPrev}
        onNext={goNext}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const LB_TOP = (StatusBar.currentHeight || 44) + 8;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: { alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  badge: { marginBottom: Spacing.md, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(124,58,237,0.35)' },
  badgeGrad: { padding: 14 },
  pageTitle: { fontFamily: Typography.heading, fontSize: 30, color: Colors.primary, textAlign: 'center', marginBottom: 6 },
  pageDesc: { fontFamily: Typography.body, fontSize: 14, color: Colors.mutedForeground, textAlign: 'center' },

  // Grid — 2 kolom berdampingan, masing-masing tumbuh sendiri
  grid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: COL_GAP,
  },
  col: {
    flex: 1,       // masing-masing kolom ambil setengah lebar
  },
  card: {
    width: '100%',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.muted,
  },
  cardImg: { width: '100%', height: '100%' },

  // Lightbox
  lbOverlay: { flex: 1, backgroundColor: 'rgba(4,6,20,0.95)', alignItems: 'center', justifyContent: 'center' },
  lbClose: { position: 'absolute', top: LB_TOP, right: 16, zIndex: 30 },
  lbPrev: { position: 'absolute', left: 12, top: '50%', marginTop: -22, zIndex: 30 },
  lbNext: { position: 'absolute', right: 12, top: '50%', marginTop: -22, zIndex: 30 },
  lbIconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(30,34,64,0.82)', alignItems: 'center', justifyContent: 'center' },
  resetWrap: { position: 'absolute', top: LB_TOP, left: 16, zIndex: 30 },
  resetBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, backgroundColor: 'rgba(124,58,237,0.90)' },
  resetTxt: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.foreground },
  lbCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    width: SCREEN_W * 0.9,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
  },
  lbImgWrap: {
    width: SCREEN_W * 0.9,
    height: SCREEN_H * 0.62,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.muted,
  },
  lbImg: { width: SCREEN_W * 0.9, height: SCREEN_H * 0.62 },
  lbFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 12, backgroundColor: Colors.card },
  lbTitle: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.foreground, flex: 1 },
  lbCounter: { fontFamily: Typography.body, fontSize: 12, color: Colors.mutedForeground, marginLeft: Spacing.sm },
});