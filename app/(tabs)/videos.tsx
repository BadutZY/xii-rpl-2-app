/**
 * videos.tsx — app/(tabs)/videos.tsx
 *
 * Local video player menggunakan react-native-webview (sudah terinstall).
 * Tidak butuh expo-av / expo-video sama sekali.
 *
 * HOW TO ADD LOCAL VIDEOS di src/data/videos.ts:
 *   {
 *     id: 'local-1',
 *     title: 'Video Kelas',
 *     categoryId: 'vlogindo',
 *     type: 'local',
 *     src: 'https://cdn.example.com/video.mp4',
 *     thumbnail: require('../../assets/videos/thumb.jpg'),
 *     orientation: 'landscape', // 'landscape' atau 'portrait'
 *   }
 *
 * ORIENTASI FULLSCREEN (hanya untuk video lokal):
 *   - 'landscape' → layar rotate ke horizontal saat fullscreen (default)
 *   - 'portrait'  → layar tetap vertikal saat fullscreen
 *
 * YouTube: langsung buka di YouTube app / browser (sama seperti sebelumnya).
 */

import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
  memo,
} from 'react';
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
  Linking,
  Share,
  Pressable,
  Platform,
} from 'react-native';

/**
 * Resolve a video src (string URL or require() number) to a string URL
 * usable inside WebView's HTML5 <video src="...">.
 *
 * - string  → returned as-is (URL or data URI)
 * - number  → Metro bundled asset; resolved via Image.resolveAssetSource()
 *             which returns the local file:// or http://localhost URI
 *             that the packager serves during development.
 */
function resolveVideoSrc(src: string | number): string {
  if (typeof src === 'string') return src;
  try {
    // Image.resolveAssetSource works for any static asset (images, video, audio)
    const resolved = Image.resolveAssetSource(src);
    return resolved?.uri ?? '';
  } catch {
    return '';
  }
}
import Animated, {
  FadeInDown,
  ZoomIn,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, BorderRadius, Spacing, type ThemeColors } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import {
  videos,
  videoCategories,
  getYouTubeThumbnail,
  getYouTubeId,
  type VideoItem,
  type VideoCategory,
  type VideoOrientation,
} from '../../src/data/videos';
import {
  VideoIcon,
  FolderIcon,
  FolderOpenIcon,
  YoutubeIcon,
  PlayIcon,
  XIcon,
  EyeIcon,
  EyeOffIcon,
  FilmIcon,
  MaximizeIcon,
  MinimizeIcon,
} from '../../src/components/Icons';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── helpers ──────────────────────────────────────────────────────────────────
async function openYouTube(url: string) {
  const id  = getYouTubeId(url);
  if (!id) { Linking.openURL(url).catch(() => {}); return; }
  const app = `vnd.youtube://${id}`;
  const can = await Linking.canOpenURL(app).catch(() => false);
  Linking.openURL(can ? app : `https://www.youtube.com/watch?v=${id}`).catch(() => {});
}

// ─── Pulsing play button ──────────────────────────────────────────────────────
function PulsingPlay({ size = 64, onPress }: { size?: number; onPress: () => void }) {
  const ring   = useSharedValue(1);
  const ringOp = useSharedValue(0.5);

  useEffect(() => {
    ring.value = withRepeat(
      withSequence(
        withTiming(1.7, { duration: 1400, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 0 }),
      ), -1, false,
    );
    ringOp.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1400, easing: Easing.out(Easing.ease) }),
        withTiming(0.5, { duration: 0 }),
      ), -1, false,
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    width: size, height: size, borderRadius: size / 2,
    borderWidth: 2, borderColor: '#ef4444',
    transform: [{ scale: ring.value }],
    opacity: ringOp.value,
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={ringStyle} />
      <LinearGradient
        colors={['#ef4444', '#b91c1c']}
        style={{
          width: size, height: size, borderRadius: size / 2,
          alignItems: 'center', justifyContent: 'center', paddingLeft: 3,
        }}
      >
        <PlayIcon size={size * 0.38} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Local Video Player Modal (WebView HTML5) ─────────────────────────────────
function LocalVideoModal({
  video,
  onClose,
}: {
  video: VideoItem | null;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [isFS,  setIsFS]  = useState(false);
  const overlayOp = useSharedValue(0);
  const boxTy     = useSharedValue(60);

  // Deteksi safe area (notch, status bar, navigation bar)
  const insets = useSafeAreaInsets();

  // Ambil orientasi dari data video, default ke 'landscape'
  const videoOrientation: VideoOrientation = video?.orientation ?? 'landscape';

  useEffect(() => {
    if (video) {
      overlayOp.value = withTiming(1, { duration: 240 });
      boxTy.value     = withSpring(0, { damping: 24, stiffness: 260 });
      setIsFS(false);
    }
  }, [video]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOp.value }));
  const boxStyle     = useAnimatedStyle(() => ({
    transform: [{ translateY: boxTy.value }],
    opacity: overlayOp.value,
  }));

  const handleClose = useCallback(async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    overlayOp.value = withTiming(0, { duration: 180 }, (done) => {
      if (done) runOnJS(onClose)();
    });
    boxTy.value = withTiming(40, { duration: 180 });
    setIsFS(false);
  }, [onClose]);

  const toggleFS = async () => {
    if (!isFS) {
      if (videoOrientation === 'portrait') {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP,
        ).catch(() => {});
      } else {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE,
        ).catch(() => {});
      }
      setIsFS(true);
    } else {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      ).catch(() => {});
      setIsFS(false);
    }
  };

  if (!video) return null;

  const videoSrc = resolveVideoSrc(video.src);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    video {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #000;
      display: block;
    }
    video::-webkit-media-controls { display: flex !important; }
    video::-webkit-media-controls-panel { background: linear-gradient(transparent, rgba(0,0,0,0.85)); }
    video::-webkit-media-controls-play-button { filter: brightness(2); }
    video::-webkit-media-controls-timeline { accent-color: #242220; }
    video::-webkit-media-controls-volume-slider { accent-color: #b8712f; }
  </style>
</head>
<body>
  <video
    src="${videoSrc}"
    controls
    autoplay
    playsinline
    preload="metadata"
  ></video>
</body>
</html>
`;

  const dim = Dimensions.get('window');

  // ── Dimensi video (mode normal / non-fullscreen) ──────────────────────────
  // Hanya dipakai saat !isFS. Saat fullscreen, video memakai flex: 1.
  const previewW = dim.width;
  const previewH = dim.width * (9 / 16);

  // ── Safe area untuk header saat fullscreen ────────────────────────────────
  // React Native melaporkan insets relatif terhadap orientasi layar SAAT INI,
  // sehingga kita cukup pakai insets.top / insets.bottom / insets.left / insets.right
  // tanpa perlu konversi manual.
  //
  // Landscape: insets.left  = lebar notch/punch-hole di sisi kiri
  //            insets.right = lebar area navigasi di sisi kanan (beberapa device)
  //            insets.top / insets.bottom = biasanya kecil/0 dalam landscape
  //
  // Portrait:  insets.top    = status bar + notch
  //            insets.bottom = navigation bar (home indicator)
  //            insets.left / insets.right = biasanya 0

  // Padding aman untuk container fullscreen
  const fsSafePadding = isFS
    ? {
        paddingTop:    insets.top    > 0 ? insets.top    : 0,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 0,
        paddingLeft:   insets.left   > 0 ? insets.left   : 0,
        paddingRight:  insets.right  > 0 ? insets.right  : 0,
      }
    : {};

  return (
    <Modal
      transparent
      visible={!!video}
      onRequestClose={handleClose}
      animationType="none"
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
    >
      {/*
        StatusBar disembunyikan saat fullscreen agar tidak mengganggu tampilan,
        tapi insets.top tetap bernilai positif (lebar area notch/kamera) sehingga
        kita masih bisa menghindari area tersebut.
      */}
      <StatusBar hidden={isFS} backgroundColor="transparent" translucent />

      <Animated.View style={[isFS ? styles.modalOverlayFS : styles.modalOverlay, overlayStyle]}>
        {!isFS && <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />}

        <Animated.View style={[isFS ? styles.modalBoxFS : styles.modalBox, fsSafePadding, boxStyle]}>
          {/* Gradient glow (hanya mode normal) */}
          {!isFS && (
            <LinearGradient
              colors={['rgba(36,34,32,0.18)', 'rgba(184,113,47,0.10)', 'transparent']}
              style={styles.modalTopGrad}
            />
          )}

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <View style={[styles.modalHeader, isFS && styles.modalHeaderFS]}>
            <View style={styles.modalTitleWrap}>
              <View style={styles.filmIconBadge}>
                <FilmIcon size={15} color={colors.primary} />
              </View>
              <Text style={[styles.modalTitle, isFS && { flex: 1 }]} numberOfLines={1}>
                {video.title}
              </Text>
            </View>
            <View style={styles.headerActions}>
              {/* Badge orientasi hanya ditampilkan saat BUKAN fullscreen */}
              {!isFS && (
                <View style={[
                  styles.orientationBadge,
                  videoOrientation === 'portrait' && styles.orientationBadgePortrait,
                ]}>
                  <Text style={styles.orientationBadgeText}>
                    {videoOrientation === 'portrait' ? '↕ Portrait' : '↔ Landscape'}
                  </Text>
                </View>
              )}
              <TouchableOpacity onPress={toggleFS} style={styles.iconActionBtn} hitSlop={8}>
                {isFS
                  ? <MinimizeIcon size={18} color={colors.foreground} />
                  : <MaximizeIcon size={18} color={colors.foreground} />}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClose} style={styles.modalCloseBtn} hitSlop={8}>
                <XIcon size={17} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Area Video ─────────────────────────────────────────────────── */}
          {/*
            Mode normal  → ukuran tetap (previewW × previewH).
            Mode fullscreen → flex: 1 agar mengisi ruang tersisa setelah
            header dan safe area padding diterapkan pada container.
            Dengan cara ini video TIDAK pernah menyentuh notch, status bar,
            maupun navigation bar, di landscape maupun portrait.
          */}
          <View style={isFS ? styles.videoAreaFS : { width: previewW, height: previewH, backgroundColor: '#000' }}>
            <WebView
              source={{ html }}
              style={isFS ? styles.webviewFS : { width: previewW, height: previewH, backgroundColor: '#000' }}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback
              allowsFullscreenVideo={false}
              javaScriptEnabled
              scrollEnabled={false}
              bounces={false}
              overScrollMode="never"
              onShouldStartLoadWithRequest={() => true}
            />
          </View>

          {/* Info (hanya mode normal) */}
          {!isFS && (
            <View style={styles.modalInfo}>
              <Text style={styles.modalInfoTitle}>{video.title}</Text>
              {video.description ? (
                <Text style={styles.modalInfoDesc}>{video.description}</Text>
              ) : null}
              <View style={styles.modalInfoRow}>
                <View style={styles.modalInfoDotLocal} />
                <Text style={styles.modalInfoMeta}>XII RPL 2 · SMK INFOKOM · Video Lokal</Text>
              </View>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── YouTube Player Modal ─────────────────────────────────────────────────────
function YouTubeModal({
  video,
  onClose,
}: {
  video: VideoItem | null;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const overlayOp = useSharedValue(0);
  const boxTy     = useSharedValue(60);

  useEffect(() => {
    if (video) {
      overlayOp.value = withTiming(1, { duration: 240 });
      boxTy.value     = withSpring(0, { damping: 24, stiffness: 260 });
    }
  }, [video]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOp.value }));
  const boxStyle     = useAnimatedStyle(() => ({
    transform: [{ translateY: boxTy.value }],
    opacity: overlayOp.value,
  }));

  const handleClose = useCallback(() => {
    overlayOp.value = withTiming(0, { duration: 180 }, (done) => {
      if (done) runOnJS(onClose)();
    });
    boxTy.value = withTiming(40, { duration: 180 });
  }, [onClose]);

  const handleShare = useCallback(async () => {
    if (!video) return;
    try {
      const srcStr = typeof video.src === 'string' ? video.src : '';
      await Share.share({ message: `${video.title}\n${srcStr}` });
    } catch {}
  }, [video]);

  if (!video) return null;

  const thumb  = video.thumbnail
    ?? (video.type === 'youtube' && typeof video.src === 'string' ? getYouTubeThumbnail(video.src) : null);
  const THUMB_H = SCREEN_W * (9 / 16);

  return (
    <Modal
      transparent
      visible={!!video}
      onRequestClose={handleClose}
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="transparent" translucent />
      <Animated.View style={[styles.modalOverlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        {/* Outer: slide-up — NO entering */}
        <Animated.View style={[styles.modalBox, boxStyle]}>
          <LinearGradient
            colors={['rgba(239,68,68,0.18)', 'rgba(36,34,32,0.10)', 'transparent']}
            style={styles.modalTopGrad}
          />

          <View style={styles.modalHeader}>
            <View style={styles.modalTitleWrap}>
              <View style={styles.ytIconBadge}>
                <YoutubeIcon size={16} color="#ef4444" />
              </View>
              <Text style={styles.modalTitle} numberOfLines={2}>{video.title}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.modalCloseBtn} hitSlop={8}>
              <XIcon size={17} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Thumbnail */}
          <View style={[styles.thumbArea, { height: THUMB_H }]}>
            {thumb
              ? <Image
                  source={typeof thumb === 'string' ? { uri: thumb } : (thumb as any)}
                  style={styles.thumbImg}
                  resizeMode="cover"
                />
              : <LinearGradient
                  colors={['rgba(36,34,32,0.35)', 'rgba(184,113,47,0.25)']}
                  style={styles.thumbFallback}
                >
                  <YoutubeIcon size={48} color="rgba(255,255,255,0.3)" />
                </LinearGradient>}
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.playBtnCenter}>
              <PulsingPlay size={72} onPress={() => typeof video.src === 'string' && openYouTube(video.src)} />
            </View>
            <View style={styles.ytBadge}>
              <YoutubeIcon size={12} color="#fff" />
              <Text style={styles.ytBadgeText}>YouTube</Text>
            </View>
            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>Ketuk untuk menonton di YouTube</Text>
            </View>
          </View>

          <View style={styles.modalInfo}>
            <Text style={styles.modalInfoTitle}>{video.title}</Text>
            {video.description ? <Text style={styles.modalInfoDesc}>{video.description}</Text> : null}
            <View style={styles.modalInfoRow}>
              <View style={styles.modalInfoDotYt} />
              <Text style={styles.modalInfoMeta}>XII RPL 2 · SMK INFOKOM</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.watchBtnWrap}
              activeOpacity={0.85}
              onPress={() => typeof video.src === 'string' && openYouTube(video.src)}
            >
              <LinearGradient
                colors={['#ef4444', '#b91c1c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.watchBtnGrad}
              >
                <YoutubeIcon size={18} color="#fff" />
                <Text style={styles.watchBtnText}>Tonton di YouTube</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} activeOpacity={0.82} onPress={handleShare}>
              <Text style={styles.shareBtnText}>Bagikan</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── VideoCard — FIX: entering on outer, transform on inner ──────────────────
function VideoCard({
  video,
  index,
  onPress,
}: {
  video: VideoItem;
  index: number;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const thumb      = video.thumbnail
    ?? (video.type === 'youtube' && typeof video.src === 'string' ? getYouTubeThumbnail(video.src) : null);
  const pressScale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressScale.value }] }));

  return (
    // Outer: entering only — NO transform
    <Animated.View entering={FadeInDown.delay(Math.min(index * 70, 450)).duration(420)}>
      {/* Inner: transform only — NO entering */}
      <Animated.View style={scaleStyle}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onPress}
          onPressIn={() => { pressScale.value = withSpring(0.95, { damping: 18, stiffness: 300 }); }}
          onPressOut={() => { pressScale.value = withSpring(1, { damping: 18, stiffness: 300 }); }}
          style={styles.videoCardInner}
        >
          <View style={styles.videoThumbWrap}>
            {thumb
              ? <Image
                  source={typeof thumb === 'string' ? { uri: thumb } : (thumb as any)}
                  style={styles.videoThumb}
                  resizeMode="cover"
                />
              : <LinearGradient
                  colors={['rgba(36,34,32,0.3)', 'rgba(184,113,47,0.2)']}
                  style={styles.videoThumbFallback}
                >
                  {video.type === 'local'
                    ? <FilmIcon size={36} color="rgba(255,255,255,0.4)" />
                    : <YoutubeIcon size={36} color="rgba(255,255,255,0.4)" />}
                </LinearGradient>}
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={StyleSheet.absoluteFill} />
            <View style={styles.thumbPlayOverlay}>
              <LinearGradient
                colors={video.type === 'local'
                  ? ['rgba(36,34,32,0.9)', 'rgba(184,113,47,0.9)']
                  : ['rgba(239,68,68,0.9)', 'rgba(185,28,28,0.9)']}
                style={styles.thumbPlayBtn}
              >
                <PlayIcon size={16} color="#fff" />
              </LinearGradient>
            </View>
            <View style={[styles.typeBadge, video.type === 'local' && styles.typeBadgeLocal]}>
              {video.type === 'local'
                ? <FilmIcon size={10} color="#fff" />
                : <YoutubeIcon size={10} color="#fff" />}
              <Text style={styles.typeBadgeText}>
                {video.type === 'local' ? 'Lokal' : 'YouTube'}
              </Text>
            </View>
            {/* Badge orientasi kecil di sudut kanan bawah thumbnail (hanya video lokal) */}
            {video.type === 'local' && (
              <View style={[
                styles.orientationThumbBadge,
                video.orientation === 'portrait' && styles.orientationThumbBadgePortrait,
              ]}>
                <Text style={styles.orientationThumbBadgeText}>
                  {video.orientation === 'portrait' ? '↕' : '↔'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
            {video.description
              ? <Text style={styles.videoDesc} numberOfLines={2}>{video.description}</Text>
              : null}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

// ─── FolderCard — FIX: entering on outer, transform on inner ─────────────────
function FolderCard({
  category,
  count,
  isShown,
  index,
  onToggle,
}: {
  category: VideoCategory;
  count: number;
  isShown: boolean;
  index: number;
  onToggle: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const pressScale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressScale.value }] }));

  return (
    // Outer: entering only — NO transform
    <Animated.View
      entering={FadeInDown.delay(index * 70).duration(420)}
      style={{ width: FOLDER_W }}
    >
      {/* Inner: transform only — NO entering */}
      <Animated.View style={scaleStyle}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onToggle}
          onPressIn={() => { pressScale.value = withSpring(0.95, { damping: 18, stiffness: 300 }); }}
          onPressOut={() => { pressScale.value = withSpring(1, { damping: 18, stiffness: 300 }); }}
          style={[styles.folderCard, isShown && styles.folderCardActive]}
        >
          {isShown && (
            <LinearGradient
              colors={['rgba(184,113,47,0.12)', 'rgba(36,34,32,0.06)']}
              style={StyleSheet.absoluteFill}
            />
          )}
          <View style={styles.folderTopRow}>
            <View style={[styles.folderIconWrap, isShown && styles.folderIconWrapActive]}>
              {isShown
                ? <FolderOpenIcon size={22} color={colors.secondary} />
                : <FolderIcon     size={22} color={colors.mutedForeground} />}
            </View>
            <View style={[styles.folderBadge, isShown && styles.folderBadgeActive]}>
              {isShown
                ? <EyeOffIcon size={10} color={colors.secondary} />
                : <EyeIcon    size={10} color={colors.mutedForeground} />}
              <Text style={[styles.folderBadgeText, isShown && styles.folderBadgeTextActive]}>
                {isShown ? 'Tutup' : 'Buka'}
              </Text>
            </View>
          </View>
          <Text style={[styles.folderTitle, isShown && { color: colors.foreground }]} numberOfLines={2}>
            {category.title}
          </Text>
          <View style={styles.folderCountRow}>
            <View style={[styles.folderCountDot, { backgroundColor: isShown ? colors.secondary : colors.mutedForeground }]} />
            <Text style={[styles.folderCount, isShown && { color: colors.secondary }]}>{count} video</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function VideosScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [shownIds,    setShownIds]    = useState<Set<string>>(new Set());
  const [ytVideo,     setYtVideo]     = useState<VideoItem | null>(null);
  const [localVideo,  setLocalVideo]  = useState<VideoItem | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  const grouped = useMemo(
    () => videoCategories.map((cat) => ({
      category: cat,
      items: videos.filter((v) => v.categoryId === cat.id),
    })),
    [],
  );

  const toggleFolder = (id: string) => {
    setShownIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const shownGroups = grouped.filter(({ category }) => shownIds.has(category.id));
  const totalVideos = videos.length;

  const handleVideoPress = (v: VideoItem) => {
    if (v.type === 'local') setLocalVideo(v);
    else setYtVideo(v);
  };

  const closeYt    = useCallback(() => setYtVideo(null), []);
  const closeLocal = useCallback(async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    setLocalVideo(null);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>

        {/* Header — FIX: ZoomIn on outer, no transform */}
        <View style={styles.headerBg}>
          <Animated.View entering={ZoomIn.duration(450).springify()} style={styles.headerBadge}>
            <LinearGradient
              colors={['rgba(239,68,68,0.2)', 'rgba(36,34,32,0.2)']}
              style={styles.headerBadgeGrad}
            >
              <VideoIcon size={34} color="#ef4444" />
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(450)}>
            <Text style={styles.pageTitle}>
              <Text style={styles.pageTitlePlain}>Koleksi </Text>
              <Text style={styles.pageTitleAccent}>Video</Text>
            </Text>
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(200).duration(450)} style={styles.pageDesc}>
            Pilih folder di bawah untuk menampilkan isinya.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(280).duration(400)} style={styles.headerStats}>
            <LinearGradient
              colors={['rgba(239,68,68,0.1)', 'rgba(36,34,32,0.08)']}
              style={styles.headerStatsInner}
            >
              <Text style={styles.headerStatNum}>{totalVideos}</Text>
              <Text style={styles.headerStatLbl}>Total Video</Text>
            </LinearGradient>
            <View style={styles.headerStatDivider} />
            <LinearGradient
              colors={['rgba(36,34,32,0.1)', 'rgba(184,113,47,0.08)']}
              style={styles.headerStatsInner}
            >
              <Text style={[styles.headerStatNum, { color: colors.primary }]}>
                {videoCategories.length}
              </Text>
              <Text style={styles.headerStatLbl}>Kategori</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Folder Grid */}
        <View style={styles.folderGrid}>
          {grouped.map(({ category, items }, i) => (
            <FolderCard
              key={category.id}
              category={category}
              count={items.length}
              isShown={shownIds.has(category.id)}
              index={i}
              onToggle={() => toggleFolder(category.id)}
            />
          ))}
        </View>

        {/* Sections */}
        {shownGroups.length === 0 ? (
          <Animated.View entering={FadeIn.duration(400)} style={styles.emptyBox}>
            <View style={styles.emptyIconWrap}>
              <FolderIcon size={40} color={colors.mutedForeground} />
            </View>
            <Text style={styles.emptyTitle}>Belum ada folder yang dibuka</Text>
            <Text style={styles.emptyText}>
              Klik salah satu folder di atas untuk melihat isinya.
            </Text>
          </Animated.View>
        ) : (
          <View style={styles.sectionsWrap}>
            {shownGroups.map(({ category, items }) => (
              <Animated.View
                key={category.id}
                entering={FadeInDown.duration(380)}
                style={styles.section}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <View style={styles.sectionIconWrap}>
                      <FolderOpenIcon size={20} color={colors.secondary} />
                    </View>
                    <View style={styles.sectionHeaderTexts}>
                      <Text style={styles.sectionTitle}>{category.title}</Text>
                      {category.description
                        ? <Text style={styles.sectionDesc} numberOfLines={1}>
                            {category.description}
                          </Text>
                        : null}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleFolder(category.id)}
                    style={styles.hideBtn}
                    activeOpacity={0.75}
                  >
                    <EyeOffIcon size={12} color={colors.mutedForeground} />
                    <Text style={styles.hideBtnText}>Tutup</Text>
                  </TouchableOpacity>
                </View>

                <LinearGradient
                  colors={['rgba(184,113,47,0.2)', 'rgba(36,34,32,0.1)', 'transparent']}
                  style={styles.sectionDivider}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />

                {items.length === 0 ? (
                  <Text style={styles.emptyText}>Belum ada video di folder ini.</Text>
                ) : (
                  <View style={styles.videoGrid}>
                    {items.map((v, i) => (
                      <View key={v.id} style={{ width: VIDEO_CARD_W }}>
                        <VideoCard
                          video={v}
                          index={i}
                          onPress={() => handleVideoPress(v)}
                        />
                      </View>
                    ))}
                  </View>
                )}
              </Animated.View>
            ))}
          </View>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>

      <YouTubeModal   video={ytVideo}    onClose={closeYt}    />
      <LocalVideoModal video={localVideo} onClose={closeLocal} />
    </View>
  );
}

// ─── Constants & Styles ───────────────────────────────────────────────────────
const FOLDER_W     = (SCREEN_W - Spacing.md * 2 - Spacing.sm) / 2;
const VIDEO_CARD_W = (SCREEN_W - Spacing.md * 2 - Spacing.sm) / 2;

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  headerBg: { alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  headerBadge: { marginBottom: Spacing.md, borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)' },
  headerBadgeGrad: { padding: 16 },
  pageTitle: { textAlign: 'center', marginBottom: 6 },
  pageTitlePlain: { fontFamily: Typography.heading, fontSize: 32, color: colors.foreground },
  pageTitleAccent: { fontFamily: Typography.heading, fontSize: 32, color: '#ef4444', textShadowColor: 'rgba(239,68,68,0.4)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 12 },
  pageDesc: { fontFamily: Typography.body, fontSize: 14, color: colors.mutedForeground, textAlign: 'center', marginBottom: Spacing.md },
  headerStats: { flexDirection: 'row', borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.cardBorder, width: '100%' },
  headerStatsInner: { flex: 1, padding: Spacing.md, alignItems: 'center' },
  headerStatNum: { fontFamily: Typography.heading, fontSize: 22, color: '#ef4444' },
  headerStatLbl: { fontFamily: Typography.body, fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  headerStatDivider: { width: 1, backgroundColor: colors.border, marginVertical: Spacing.sm },

  // Folder grid
  folderGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.lg },
  folderCard: { width: '100%', borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(255,255,255,0.03)', overflow: 'hidden', padding: Spacing.md },
  folderCardActive: { borderColor: 'rgba(184,113,47,0.45)' },
  folderTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  folderIconWrap: { width: 44, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  folderIconWrapActive: { backgroundColor: 'rgba(184,113,47,0.18)' },
  folderBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: BorderRadius.full, paddingHorizontal: 7, paddingVertical: 4 },
  folderBadgeActive: { backgroundColor: 'rgba(184,113,47,0.15)' },
  folderBadgeText: { fontFamily: Typography.bodyMedium, fontSize: 9, color: colors.mutedForeground },
  folderBadgeTextActive: { color: colors.secondary },
  folderTitle: { fontFamily: Typography.bodySemiBold, fontSize: 13, color: colors.mutedForeground, marginBottom: 6, lineHeight: 18 },
  folderCountRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  folderCountDot: { width: 6, height: 6, borderRadius: 3 },
  folderCount: { fontFamily: Typography.body, fontSize: 11, color: colors.mutedForeground },

  // Sections
  sectionsWrap: { paddingHorizontal: Spacing.md, gap: Spacing.xl },
  section: { gap: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  sectionIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(184,113,47,0.12)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sectionHeaderTexts: { flex: 1 },
  sectionTitle: { fontFamily: Typography.heading, fontSize: 18, color: colors.secondary },
  sectionDesc: { fontFamily: Typography.body, fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  sectionDivider: { height: 2, borderRadius: 1, marginBottom: 4 },
  hideBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: BorderRadius.sm, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.03)', marginTop: 2 },
  hideBtnText: { fontFamily: Typography.bodyMedium, fontSize: 11, color: colors.mutedForeground },

  // Video grid
  videoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  videoCardInner: { borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(120,60,210,0.25)', backgroundColor: colors.card },
  videoThumbWrap: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', position: 'relative', overflow: 'hidden' },
  videoThumb: { width: '100%', height: '100%' },
  videoThumbFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  thumbPlayOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  thumbPlayBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', paddingLeft: 2 },
  typeBadge: { position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(239,68,68,0.75)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  typeBadgeLocal: { backgroundColor: 'rgba(36,34,32,0.75)' },
  typeBadgeText: { fontFamily: Typography.bodyMedium, fontSize: 9, color: '#fff' },

  // Badge orientasi kecil di thumbnail (hanya video lokal)
  orientationThumbBadge: {
    position: 'absolute', bottom: 6, right: 6,
    backgroundColor: 'rgba(36,34,32,0.80)',
    borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2,
  },
  orientationThumbBadgePortrait: { backgroundColor: 'rgba(184,113,47,0.80)' },
  orientationThumbBadgeText: { fontFamily: Typography.bodyMedium, fontSize: 9, color: '#fff' },

  videoInfo: { padding: Spacing.sm + 2 },
  videoTitle: { fontFamily: Typography.bodySemiBold, fontSize: 12, color: colors.foreground, lineHeight: 17, marginBottom: 4 },
  videoDesc: { fontFamily: Typography.body, fontSize: 11, color: colors.mutedForeground, lineHeight: 16 },

  // Empty
  emptyBox: { marginHorizontal: Spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed', borderRadius: BorderRadius.xl, paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.md, alignItems: 'center', gap: Spacing.sm },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  emptyTitle: { fontFamily: Typography.heading, fontSize: 15, color: colors.foreground, textAlign: 'center' },
  emptyText: { fontFamily: Typography.body, fontSize: 13, color: colors.mutedForeground, textAlign: 'center', lineHeight: 20 },

  // Modal shared
  modalOverlay: { flex: 1, backgroundColor: 'rgba(2,4,18,0.92)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.md },
  modalOverlayFS: { flex: 1, backgroundColor: '#000' },
  modalBox: { width: '100%', backgroundColor: colors.card, borderRadius: BorderRadius.xl + 4, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(36,34,32,0.25)' },
  modalBoxFS: { flex: 1, width: '100%', backgroundColor: '#000', overflow: 'hidden' },

  // Area video saat fullscreen: mengisi sisa ruang setelah header dan safe-area padding
  videoAreaFS: { flex: 1, backgroundColor: '#000' },
  webviewFS:   { flex: 1, backgroundColor: '#000' },
  modalTopGrad: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, zIndex: 0 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)', gap: Spacing.sm, zIndex: 1 },
  modalHeaderFS: { backgroundColor: 'rgba(0,0,0,0.6)', borderBottomColor: 'rgba(255,255,255,0.1)' },
  modalTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  ytIconBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(239,68,68,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  filmIconBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(36,34,32,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  modalTitle: { fontFamily: Typography.bodySemiBold, fontSize: 14, color: colors.foreground, flex: 1, lineHeight: 20 },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconActionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },

  // Badge orientasi di header modal
  orientationBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(36,34,32,0.18)',
    borderWidth: 1, borderColor: 'rgba(36,34,32,0.35)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  orientationBadgePortrait: {
    backgroundColor: 'rgba(184,113,47,0.18)',
    borderColor: 'rgba(184,113,47,0.35)',
  },
  orientationBadgeText: {
    fontFamily: Typography.bodyMedium, fontSize: 10,
    color: colors.mutedForeground,
  },

  modalInfo: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  modalInfoTitle: { fontFamily: Typography.bodySemiBold, fontSize: 15, color: colors.foreground, marginBottom: 4, lineHeight: 22 },
  modalInfoDesc: { fontFamily: Typography.body, fontSize: 12, color: colors.mutedForeground, lineHeight: 18, marginBottom: 8 },
  modalInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  modalInfoDotYt: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444' },
  modalInfoDotLocal: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  modalInfoMeta: { fontFamily: Typography.body, fontSize: 12, color: colors.mutedForeground },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, paddingTop: Spacing.sm },
  watchBtnWrap: { flex: 1, borderRadius: BorderRadius.md, overflow: 'hidden' },
  watchBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, paddingHorizontal: Spacing.md },
  watchBtnText: { fontFamily: Typography.bodySemiBold, fontSize: 14, color: '#fff' },
  shareBtn: { borderRadius: BorderRadius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 13, paddingHorizontal: Spacing.md, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { fontFamily: Typography.bodyMedium, fontSize: 13, color: colors.mutedForeground },

  // YouTube thumb area
  thumbArea: { width: '100%', backgroundColor: '#000', position: 'relative', overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  thumbFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  playBtnCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  ytBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  ytBadgeText: { fontFamily: Typography.bodyMedium, fontSize: 11, color: '#fff' },
  tapHint: { position: 'absolute', bottom: 10, left: 0, right: 0, alignItems: 'center' },
  tapHintText: { fontFamily: Typography.body, fontSize: 11, color: 'rgba(255,255,255,0.65)', backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
});