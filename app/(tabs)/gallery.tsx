/**
 * gallery.tsx — app/(tabs)/gallery.tsx
 *
 * Fixes:
 *  - Reanimated "transform overwritten by layout animation" warning fixed by
 *    keeping entering animations on wrapper Views and transform styles on
 *    separate inner Animated.Views (never both on the same component).
 *  - Pinch-to-zoom removed entirely.
 *  - All emojis replaced with SVG icons.
 */

import React, { useState, useCallback, useRef, memo, useEffect } from 'react';
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
  withRepeat,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { Colors, Typography, BorderRadius, Spacing } from '../../src/constants/theme';
import { galleryImages, GalleryImage } from '../../src/data/gallery';
import {
  ImagesIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AwardIcon,
} from '../../src/components/Icons';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const COL_GAP = 8;
const ROW_GAP = 8;
const CELL_W = Math.floor((SCREEN_W - Spacing.md * 2 - COL_GAP) / 2);

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

// Shimmer placeholder
function ShimmerBox({ width, height }: { width: number; height: number }) {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 }),
      ),
      -1,
      false,
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[{ width, height, backgroundColor: Colors.muted, borderRadius: BorderRadius.md }, style]}
    />
  );
}

// PhotoCard — FIX: entering on outer wrapper, transform on inner Animated.View
interface CardProps {
  img: GalleryImage;
  globalIdx: number;
  colIdx: number;
  onPress: (idx: number) => void;
}

const PhotoCard = memo(({ img, globalIdx, colIdx, onPress }: CardProps) => {
  const [h, setH] = useState(Math.round(CELL_W * 0.75));
  const [loaded, setLoaded] = useState(false);
  const didLoad = useRef(false);
  const pressScale = useSharedValue(1);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const onLoad = (e: any) => {
    if (didLoad.current) return;
    didLoad.current = true;
    const { width, height } = e.nativeEvent.source;
    if (width > 0) setH(Math.round((height / width) * CELL_W));
    setLoaded(true);
  };

  return (
    // Outer: entering only — NO transform
    <Animated.View
      entering={FadeInDown.delay(Math.min(colIdx * 70, 560)).duration(450).springify()}
      style={{ marginBottom: ROW_GAP }}
    >
      {/* Inner: transform only — NO entering */}
      <Animated.View style={scaleStyle}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onPress(globalIdx)}
          onPressIn={() => { pressScale.value = withSpring(0.96, { damping: 20, stiffness: 300 }); }}
          onPressOut={() => { pressScale.value = withSpring(1, { damping: 20, stiffness: 300 }); }}
          style={[styles.card, { height: h }]}
        >
          {!loaded && <ShimmerBox width={CELL_W} height={h} />}
          <Image
            source={img.src}
            style={[styles.cardImg, !loaded && { opacity: 0 }]}
            resizeMode="cover"
            onLoad={onLoad}
            fadeDuration={200}
          />
          <LinearGradient
            colors={['transparent', 'rgba(10,14,40,0.5)']}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
});

// Lightbox — no zoom, simple slide transition
interface LightboxProps {
  visible: boolean;
  idx: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ visible, idx, onClose, onPrev, onNext }: LightboxProps) {
  const overlayOp = useSharedValue(0);
  const boxSc     = useSharedValue(0.88);
  const imgOp     = useSharedValue(1);
  const imgTx     = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      overlayOp.value = withTiming(1, { duration: 220 });
      boxSc.value     = withSpring(1, { damping: 22, stiffness: 250 });
      imgOp.value     = 1;
      imgTx.value     = 0;
    }
  }, [visible]);

  React.useEffect(() => {
    if (visible) {
      imgOp.value = withTiming(1, { duration: 180 });
      imgTx.value = 0;
    }
  }, [idx]);

  const handlePrev = useCallback(() => {
    imgTx.value = withTiming(60, { duration: 120 });
    imgOp.value = withTiming(0, { duration: 140 }, (done) => {
      if (done) runOnJS(onPrev)();
    });
  }, [onPrev]);

  const handleNext = useCallback(() => {
    imgTx.value = withTiming(-60, { duration: 120 });
    imgOp.value = withTiming(0, { duration: 140 }, (done) => {
      if (done) runOnJS(onNext)();
    });
  }, [onNext]);

  const handleClose = () => {
    imgOp.value     = withTiming(0, { duration: 120 });
    overlayOp.value = withTiming(0, { duration: 200 }, (done) => {
      if (done) runOnJS(onClose)();
    });
    boxSc.value = withSpring(0.88);
  };

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOp.value }));
  const boxStyle     = useAnimatedStyle(() => ({
    opacity: overlayOp.value,
    transform: [{ scale: boxSc.value }],
  }));
  const imgStyle = useAnimatedStyle(() => ({
    opacity: imgOp.value,
    transform: [{ translateX: imgTx.value }],
  }));

  if (!visible || idx === null) return null;
  const img = galleryImages[idx];

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={handleClose}
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="transparent" translucent />
      <Animated.View style={[styles.lbOverlay, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />

        {/* Close */}
        <TouchableOpacity style={styles.lbClose} onPress={handleClose}>
          <View style={styles.lbIconBtn}>
            <XIcon size={20} color={Colors.foreground} />
          </View>
        </TouchableOpacity>

        {/* Counter pill */}
        <View style={styles.lbCounterWrap}>
          <LinearGradient
            colors={['rgba(124,58,237,0.85)', 'rgba(16,185,129,0.85)']}
            style={styles.lbCounterGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <ImagesIcon size={12} color="#fff" />
            <Text style={styles.lbCounterText}>{(idx ?? 0) + 1} / {galleryImages.length}</Text>
          </LinearGradient>
        </View>

        {/* Prev */}
        <TouchableOpacity style={styles.lbPrev} onPress={handlePrev}>
          <LinearGradient colors={['rgba(30,34,64,0.85)', 'rgba(30,34,64,0.6)']} style={styles.lbIconBtn}>
            <ChevronLeftIcon size={24} color={Colors.foreground} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity style={styles.lbNext} onPress={handleNext}>
          <LinearGradient colors={['rgba(30,34,64,0.85)', 'rgba(30,34,64,0.6)']} style={styles.lbIconBtn}>
            <ChevronRightIcon size={24} color={Colors.foreground} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Card — boxStyle carries scale transform, no entering */}
        <Animated.View style={[styles.lbCard, boxStyle]}>
          <View style={styles.lbImgWrap}>
            {/* imgStyle carries translate+opacity — no entering */}
            <Animated.Image
              key={idx}
              source={img.src}
              style={[styles.lbImg, imgStyle]}
              resizeMode="contain"
            />
          </View>

          <LinearGradient
            colors={['rgba(30,34,64,0.95)', 'rgba(10,14,40,0.98)']}
            style={styles.lbFooter}
          >
            <Text style={styles.lbTitle} numberOfLines={1}>
              {img.title?.trim() || 'XI RPL 2'}
            </Text>
            <View style={styles.lbHint}>
              <ChevronLeftIcon size={10} color={Colors.mutedForeground} />
              <Text style={styles.lbHintText}>Geser</Text>
              <ChevronRightIcon size={10} color={Colors.mutedForeground} />
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// Gallery Header — FIX: ZoomIn entering on outer, pulse on inner
const GalleryHeader = memo(() => {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1200 }),
        withTiming(1,    { duration: 1200 }),
      ),
      -1,
      false,
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View style={styles.header}>
      {/* Outer: ZoomIn entering — no transform */}
      <Animated.View entering={ZoomIn.duration(450).springify()} style={styles.badgeOuter}>
        {/* Inner: pulse scale — no entering */}
        <Animated.View style={pulseStyle}>
          <LinearGradient
            colors={['rgba(124,58,237,0.25)', 'rgba(16,185,129,0.25)']}
            style={styles.badgeGrad}
          >
            <ImagesIcon size={34} color={Colors.secondary} />
          </LinearGradient>
        </Animated.View>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(100).duration(450)} style={styles.pageTitle}>
        Photo Gallery
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(200).duration(450)} style={styles.pageDesc}>
        Momen-momen berharga kelas XI RPL 2
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(280).duration(400)} style={styles.countBadge}>
        <LinearGradient
          colors={['rgba(124,58,237,0.15)', 'rgba(16,185,129,0.1)']}
          style={styles.countBadgeInner}
        >
          <Text style={styles.countBadgeText}>{galleryImages.length} Foto</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
});

export default function GalleryScreen() {
  const [selIdx, setSelIdx] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  const goNext = useCallback(() => {
    setSelIdx((p) => (p !== null ? (p + 1) % galleryImages.length : null));
  }, []);
  const goPrev = useCallback(() => {
    setSelIdx((p) => (p !== null ? (p - 1 + galleryImages.length) % galleryImages.length : null));
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <GalleryHeader />
        <View style={styles.grid}>
          <View style={styles.col}>
            {LEFT_COL.map((img, ci) => (
              <PhotoCard key={img.id} img={img} globalIdx={ci * 2} colIdx={ci} onPress={setSelIdx} />
            ))}
          </View>
          <View style={styles.col}>
            {RIGHT_COL.map((img, ci) => (
              <PhotoCard key={img.id} img={img} globalIdx={ci * 2 + 1} colIdx={ci} onPress={setSelIdx} />
            ))}
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

const LB_TOP = (StatusBar.currentHeight || 44) + 8;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  badgeOuter: { marginBottom: Spacing.md, borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(124,58,237,0.4)' },
  badgeGrad: { padding: 16 },
  pageTitle: { fontFamily: Typography.heading, fontSize: 32, color: Colors.primary, textAlign: 'center', marginBottom: 6, textShadowColor: 'rgba(124,58,237,0.4)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 14 },
  pageDesc: { fontFamily: Typography.body, fontSize: 14, color: Colors.mutedForeground, textAlign: 'center', marginBottom: Spacing.sm },
  countBadge: { borderRadius: BorderRadius.full, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  countBadgeInner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 5 },
  countBadgeText: { fontFamily: Typography.bodyMedium, fontSize: 12, color: Colors.mutedForeground },
  grid: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: COL_GAP },
  col: { flex: 1 },
  card: { width: '100%', borderRadius: BorderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder, backgroundColor: Colors.muted },
  cardImg: { width: '100%', height: '100%' },
  // Lightbox
  lbOverlay: { flex: 1, backgroundColor: 'rgba(2,4,16,0.96)', alignItems: 'center', justifyContent: 'center' },
  lbClose: { position: 'absolute', top: LB_TOP, right: 16, zIndex: 30 },
  lbCounterWrap: { position: 'absolute', top: LB_TOP + 2, alignSelf: 'center', zIndex: 30 },
  lbCounterGrad: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.full },
  lbCounterText: { fontFamily: Typography.bodyMedium, fontSize: 12, color: Colors.foreground },
  lbPrev: { position: 'absolute', left: 10, top: '50%', marginTop: -24, zIndex: 30 },
  lbNext: { position: 'absolute', right: 10, top: '50%', marginTop: -24, zIndex: 30 },
  lbIconBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  lbCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.xl, overflow: 'hidden', width: SCREEN_W * 0.92, elevation: 24, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.4, shadowRadius: 32, borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)' },
  lbImgWrap: { width: SCREEN_W * 0.92, height: SCREEN_H * 0.60, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.muted },
  lbImg: { width: SCREEN_W * 0.92, height: SCREEN_H * 0.60 },
  lbFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14 },
  lbTitle: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.foreground, flex: 1 },
  lbHint: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: BorderRadius.full, paddingHorizontal: 10, paddingVertical: 4 },
  lbHintText: { fontFamily: Typography.body, fontSize: 10, color: Colors.mutedForeground },
});