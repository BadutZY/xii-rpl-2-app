import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  FadeInDown,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useFocusEffect } from 'expo-router';
import { Colors, Typography, BorderRadius, Spacing } from '../../src/constants/theme';
import { galleryImages } from '../../src/data/gallery';
import { ImagesIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from '../../src/components/Icons';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const NUM_COLS = 2;
const GAP = 8;
const CELL_W = (SCREEN_W - Spacing.md * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS;

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedImage = Animated.createAnimatedComponent(Image);

function PhotoCard({
  img,
  index,
  onPress,
}: {
  img: (typeof galleryImages)[0];
  index: number;
  onPress: () => void;
}) {
  const [imgHeight, setImgHeight] = React.useState<number>(CELL_W);

  return (
    <AnimatedView
      entering={FadeInDown.delay(Math.min(index * 50, 500)).duration(420)}
      style={{ width: CELL_W }}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.photoItem, { height: imgHeight }]}
      >
        <Image
          source={img.src}
          style={styles.photoImg}
          resizeMode="contain"
          onLoad={(e) => {
            const { width, height } = e.nativeEvent.source;
            setImgHeight(Math.round((height / width) * CELL_W));
          }}
        />
      </TouchableOpacity>
    </AnimatedView>
  );
}

function Lightbox({
  visible,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  visible: boolean;
  index: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const overlayOpacity = useSharedValue(0);
  const boxScale = useSharedValue(0.85);
  const imgOpacity = useSharedValue(1);

  React.useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 200 });
      boxScale.value = withSpring(1, { damping: 22, stiffness: 250 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: boxScale.value }],
    opacity: overlayOpacity.value,
  }));
  const imgStyle = useAnimatedStyle(() => ({ opacity: imgOpacity.value }));

  const handleClose = useCallback(() => {
    overlayOpacity.value = withTiming(0, { duration: 150 }, (done) => {
      if (done) runOnJS(onClose)();
    });
    boxScale.value = withSpring(0.85);
  }, [onClose]);

  const handlePrev = () => {
    imgOpacity.value = withTiming(0, { duration: 100 }, () => {
      runOnJS(onPrev)();
      imgOpacity.value = withTiming(1, { duration: 150 });
    });
  };

  const handleNext = () => {
    imgOpacity.value = withTiming(0, { duration: 100 }, () => {
      runOnJS(onNext)();
      imgOpacity.value = withTiming(1, { duration: 150 });
    });
  };

  if (!visible || index === null) return null;

  const img = galleryImages[index];

  return (
    <Modal transparent visible={visible} onRequestClose={handleClose} animationType="none" statusBarTranslucent>
      <StatusBar backgroundColor="transparent" translucent />
      <AnimatedView style={[styles.lightboxOverlay, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />

        {/* Close */}
        <TouchableOpacity style={styles.lightboxClose} onPress={handleClose}>
          <View style={styles.lightboxIconBtn}>
            <XIcon size={20} color={Colors.foreground} />
          </View>
        </TouchableOpacity>

        {/* Prev */}
        <TouchableOpacity style={styles.lightboxPrev} onPress={handlePrev}>
          <View style={styles.lightboxIconBtn}>
            <ChevronLeftIcon size={24} color={Colors.foreground} />
          </View>
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity style={styles.lightboxNext} onPress={handleNext}>
          <View style={styles.lightboxIconBtn}>
            <ChevronRightIcon size={24} color={Colors.foreground} />
          </View>
        </TouchableOpacity>

        {/* Content */}
        <AnimatedView style={[styles.lightboxBox, boxStyle]}>
          <AnimatedImage
            key={index}
            source={img.src}
            style={[styles.lightboxImg, imgStyle]}
            resizeMode="contain"
          />
          <View style={styles.lightboxFooter}>
            <Text style={styles.lightboxTitle}>{img.title?.trim() || ' '}</Text>
            <Text style={styles.lightboxCounter}>{index + 1} / {galleryImages.length}</Text>
          </View>
        </AnimatedView>
      </AnimatedView>
    </Modal>
  );
}

export default function GalleryScreen() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const goNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev + 1) % galleryImages.length : null
    );
  }, []);

  const goPrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : null
    );
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerBg}>
          <AnimatedView entering={ZoomIn.duration(450)} style={styles.headerBadge}>
            <LinearGradient
              colors={['rgba(124,58,237,0.2)', 'rgba(16,185,129,0.2)']}
              style={styles.headerBadgeGrad}
            >
              <ImagesIcon size={32} color={Colors.secondary} />
            </LinearGradient>
          </AnimatedView>

          <AnimatedView entering={FadeInDown.delay(100).duration(450)}>
            <Text style={styles.pageTitle}>Photo Gallery</Text>
          </AnimatedView>

          <AnimatedView entering={FadeInDown.delay(200).duration(450)}>
            <Text style={styles.pageDesc}>Momen-momen berharga kelas XI RPL 2</Text>
          </AnimatedView>
        </View>

        {/* Photo Grid */}
        <View style={styles.photoGrid}>
          {galleryImages.map((img, i) => (
            <PhotoCard
              key={img.id}
              img={img}
              index={i}
              onPress={() => setSelectedIndex(i)}
            />
          ))}
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>

      <Lightbox
        visible={selectedIndex !== null}
        index={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onPrev={goPrev}
        onNext={goNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBg: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerBadge: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.35)',
  },
  headerBadgeGrad: {
    padding: 14,
  },
  pageTitle: {
    fontFamily: Typography.heading,
    fontSize: 30,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  pageDesc: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
  // Photo Grid
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: GAP,
    justifyContent: 'space-between',
    paddingBottom: Spacing.lg,
  },
  photoItem: {
    width: '100%',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.muted,
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  // Lightbox
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4,6,20,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxClose: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 44) + 8,
    right: 16,
    zIndex: 20,
  },
  lightboxPrev: {
    position: 'absolute',
    left: 12,
    top: '50%',
    zIndex: 20,
    marginTop: -24,
  },
  lightboxNext: {
    position: 'absolute',
    right: 12,
    top: '50%',
    zIndex: 20,
    marginTop: -24,
  },
  lightboxIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30,34,64,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxBox: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    maxWidth: SCREEN_W * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
  },
  lightboxImg: {
    width: SCREEN_W * 0.88,
    height: SCREEN_H * 0.6,
  },
  lightboxFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.card,
  },
  lightboxTitle: {
    fontFamily: Typography.bodyMedium,
    fontSize: 13,
    color: Colors.foreground,
    flex: 1,
  },
  lightboxCounter: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.mutedForeground,
    marginLeft: Spacing.sm,
  },
});