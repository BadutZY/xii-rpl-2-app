import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
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
  Platform,
  BackHandler,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Animated, {
  FadeInDown,
  ZoomIn,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Colors, Typography, BorderRadius, Spacing } from '../../src/constants/theme';
import {
  videos,
  videoCategories,
  getYouTubeThumbnail,
  getYouTubeId,
  type VideoItem,
  type VideoCategory,
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
  MaximizeIcon,
  MinimizeIcon,
} from '../../src/components/Icons';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const AnimatedView = Animated.createAnimatedComponent(View);

// ─── YouTube HTML Player ──────────────────────────────────────────────────────
// Membangun halaman HTML lengkap dengan YouTube IFrame API
// sehingga pemutar benar-benar seperti YouTube (kontrol penuh, progress, dll.)

function buildYouTubeHTML(videoId: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    #player { width: 100%; height: 100%; }
    iframe { width: 100% !important; height: 100% !important; }
  </style>
</head>
<body>
  <div id="player"></div>
  <script>
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player;
    function onYouTubeIframeAPIReady() {
      player = new YT.Player('player', {
        videoId: '${videoId}',
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          fs: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
          hl: 'id',
        },
        events: {
          onReady: function(e) {
            e.target.playVideo();
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
          },
          onStateChange: function(e) {
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'stateChange',
              state: e.data
            }));
          },
          onError: function(e) {
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              code: e.data
            }));
          }
        }
      });
    }

    // Fullscreen change listener → beri tahu RN
    document.addEventListener('fullscreenchange', function() {
      var isFs = !!document.fullscreenElement;
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'fullscreen',
        value: isFs
      }));
    });
    document.addEventListener('webkitfullscreenchange', function() {
      var isFs = !!document.webkitFullscreenElement;
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'fullscreen',
        value: isFs
      }));
    });
  </script>
</body>
</html>
`;
}

// ─── VideoPlayerModal ─────────────────────────────────────────────────────────

function VideoPlayerModal({
  video,
  onClose,
}: {
  video: VideoItem | null;
  onClose: () => void;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [webviewLoading, setWebviewLoading] = useState(true);
  const webviewRef = useRef<any>(null);
  const overlayOpacity = useSharedValue(0);
  const boxScale = useSharedValue(0.92);

  // Animasi masuk
  useEffect(() => {
    if (video) {
      setWebviewLoading(true);
      setIsFullscreen(false);
      overlayOpacity.value = withTiming(1, { duration: 220 });
      boxScale.value = withSpring(1, { damping: 22, stiffness: 260 });
    }
  }, [video]);

  // Intercept back button saat fullscreen
  useEffect(() => {
    if (!video) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isFullscreen) {
        exitFullscreen();
        return true;
      }
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [video, isFullscreen]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: boxScale.value }],
    opacity: overlayOpacity.value,
  }));

  const handleClose = useCallback(() => {
    // Kembali ke portrait dulu sebelum tutup
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    overlayOpacity.value = withTiming(0, { duration: 160 }, (done) => {
      if (done) runOnJS(onClose)();
    });
    boxScale.value = withSpring(0.92);
  }, [onClose]);

  const enterFullscreen = async () => {
    setIsFullscreen(true);
    await ScreenOrientation.unlockAsync();
    // Arahkan ke landscape
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    ).catch(() => {});
  };

  const exitFullscreen = async () => {
    setIsFullscreen(false);
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    ).catch(() => {});
  };

  const toggleFullscreen = () => {
    if (isFullscreen) exitFullscreen();
    else enterFullscreen();
  };

  // Terima pesan dari YouTube IFrame API di WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ready') setWebviewLoading(false);
      if (data.type === 'fullscreen') {
        // Web fullscreen → sync ke native orientation
        if (data.value) enterFullscreen();
        else exitFullscreen();
      }
    } catch {}
  };

  if (!video) return null;

  const youtubeId = getYouTubeId(video.src);
  if (!youtubeId) return null;

  const html = buildYouTubeHTML(youtubeId);

  // Dimensi player: fullscreen = seluruh layar, normal = 16:9 di dalam modal
  const playerWidth = isFullscreen ? SCREEN_H : SCREEN_W - Spacing.md * 2;
  const playerHeight = isFullscreen ? SCREEN_W : (SCREEN_W - Spacing.md * 2) * (9 / 16);

  return (
    <Modal
      transparent
      visible={!!video}
      onRequestClose={handleClose}
      animationType="none"
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
    >
      <StatusBar hidden={isFullscreen} backgroundColor="transparent" translucent />

      {/* ── FULLSCREEN MODE ── */}
      {isFullscreen ? (
        <View style={styles.fsContainer}>
          <WebView
            ref={webviewRef}
            source={{ html }}
            style={{ width: playerWidth, height: playerHeight }}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            onMessage={handleWebViewMessage}
            onLoadEnd={() => setWebviewLoading(false)}
            scrollEnabled={false}
            bounces={false}
            overScrollMode="never"
            allowsInlineMediaPlayback
          />
          {/* Loading di fullscreen */}
          {webviewLoading && (
            <View style={styles.fsLoadingOverlay}>
              <ActivityIndicator size="large" color="#ef4444" />
            </View>
          )}
          {/* Tombol exit fullscreen */}
          <TouchableOpacity style={styles.fsExitBtn} onPress={exitFullscreen}>
            <View style={styles.fsExitBtnInner}>
              <MinimizeIcon size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          {/* Tombol close */}
          <TouchableOpacity style={styles.fsCloseBtn} onPress={handleClose}>
            <View style={styles.fsCloseBtnInner}>
              <XIcon size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        /* ── NORMAL MODAL MODE ── */
        <AnimatedView style={[styles.modalOverlay, overlayStyle]}>
          {/* Backdrop tap untuk tutup */}
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

          <AnimatedView style={[styles.modalBox, boxStyle]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleWrap}>
                <YoutubeIcon size={18} color="#ef4444" />
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {video.title}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.modalCloseBtn} hitSlop={8}>
                <XIcon size={18} color={Colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* YouTube WebView Player */}
            <View style={styles.playerWrapper}>
              <WebView
                ref={webviewRef}
                source={{ html }}
                style={styles.webview}
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
                domStorageEnabled
                onMessage={handleWebViewMessage}
                onLoadEnd={() => setWebviewLoading(false)}
                scrollEnabled={false}
                bounces={false}
                overScrollMode="never"
                allowsInlineMediaPlayback
              />

              {/* Loading overlay di atas player */}
              {webviewLoading && (
                <View style={styles.playerLoadingOverlay}>
                  <ActivityIndicator size="large" color="#ef4444" />
                  <Text style={styles.playerLoadingText}>Memuat video…</Text>
                </View>
              )}

              {/* Tombol fullscreen custom (pojok kanan bawah) */}
              <TouchableOpacity
                style={styles.fullscreenBtn}
                onPress={toggleFullscreen}
                hitSlop={12}
              >
                <View style={styles.fullscreenBtnInner}>
                  <MaximizeIcon size={14} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Info bawah */}
            <View style={styles.modalInfo}>
              <Text style={styles.modalInfoTitle}>{video.title}</Text>
              {video.description ? (
                <Text style={styles.modalInfoDesc}>{video.description}</Text>
              ) : null}
              <View style={styles.modalInfoRow}>
                <YoutubeIcon size={13} color="#ef4444" />
                <Text style={styles.modalInfoMeta}>YouTube · XI RPL 2</Text>
              </View>
            </View>
          </AnimatedView>
        </AnimatedView>
      )}
    </Modal>
  );
}

// ─── VideoCard ────────────────────────────────────────────────────────────────

function VideoCard({
  video,
  index,
  onPress,
}: {
  video: VideoItem;
  index: number;
  onPress: () => void;
}) {
  const thumb =
    video.thumbnail ?? (video.type === 'youtube' ? getYouTubeThumbnail(video.src) : null);

  return (
    <AnimatedView
      entering={FadeInDown.delay(Math.min(index * 60, 400)).duration(400)}
      style={styles.videoCard}
    >
      <TouchableOpacity activeOpacity={0.87} onPress={onPress} style={styles.videoCardInner}>
        {/* Thumbnail */}
        <View style={styles.videoThumbWrap}>
          {thumb ? (
            <Image source={{ uri: thumb }} style={styles.videoThumb} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={['rgba(124,58,237,0.3)', 'rgba(16,185,129,0.2)']}
              style={styles.videoThumbFallback}
            >
              <YoutubeIcon size={36} color="rgba(255,255,255,0.45)" />
            </LinearGradient>
          )}

          {/* Gradient overlay bawah */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.72)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Play button */}
          <View style={styles.thumbPlayOverlay}>
            <View style={styles.thumbPlayBtn}>
              <PlayIcon size={18} color="#fff" />
            </View>
          </View>

          {/* YouTube badge */}
          <View style={styles.ytBadge}>
            <YoutubeIcon size={11} color="#fff" />
            <Text style={styles.ytBadgeText}>YouTube</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {video.title}
          </Text>
          {video.description ? (
            <Text style={styles.videoDesc} numberOfLines={2}>
              {video.description}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    </AnimatedView>
  );
}

// ─── FolderCard ───────────────────────────────────────────────────────────────

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
  return (
    <AnimatedView
      entering={FadeInDown.delay(index * 60).duration(400)}
      style={[styles.folderCard, isShown && styles.folderCardActive]}
    >
      <TouchableOpacity activeOpacity={0.82} onPress={onToggle} style={styles.folderCardInner}>
        <View style={styles.folderTopRow}>
          <View style={[styles.folderIconWrap, isShown && styles.folderIconWrapActive]}>
            {isShown ? (
              <FolderOpenIcon size={22} color={Colors.secondary} />
            ) : (
              <FolderIcon size={22} color={Colors.mutedForeground} />
            )}
          </View>
          <View style={[styles.folderBadge, isShown && styles.folderBadgeActive]}>
            {isShown ? (
              <EyeOffIcon size={10} color={Colors.secondary} />
            ) : (
              <EyeIcon size={10} color={Colors.mutedForeground} />
            )}
            <Text style={[styles.folderBadgeText, isShown && styles.folderBadgeTextActive]}>
              {isShown ? 'Hide' : 'Show'}
            </Text>
          </View>
        </View>
        <Text style={styles.folderTitle} numberOfLines={2}>
          {category.title}
        </Text>
        <Text style={styles.folderCount}>{count} video</Text>
      </TouchableOpacity>
    </AnimatedView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function VideosScreen() {
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Kunci ke portrait saat layar ini aktif, bebaskan saat keluar
  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      return () => {
        // Jangan unlock kalau player masih terbuka
        if (!activeVideo) {
          ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
        }
      };
    }, [activeVideo])
  );

  const grouped = useMemo(
    () =>
      videoCategories.map((cat) => ({
        category: cat,
        items: videos.filter((v) => v.categoryId === cat.id),
      })),
    []
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

  const handleClose = useCallback(() => {
    setActiveVideo(null);
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
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
              <VideoIcon size={32} color={Colors.secondary} />
            </LinearGradient>
          </AnimatedView>

          <AnimatedView entering={FadeInDown.delay(100).duration(450)}>
            <Text style={styles.pageTitle}>
              <Text style={styles.pageTitlePlain}>Koleksi </Text>
              <Text style={styles.pageTitleGradient}>Video</Text>
            </Text>
          </AnimatedView>

          <AnimatedView entering={FadeInDown.delay(200).duration(450)}>
            <Text style={styles.pageDesc}>
              Pilih folder di bawah untuk menampilkan isinya.
            </Text>
          </AnimatedView>
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

        {/* Shown category sections */}
        {shownGroups.length === 0 ? (
          <AnimatedView entering={FadeIn.duration(350)} style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Tidak ada folder yang ditampilkan.{'\n'}Klik salah satu folder di atas untuk melihat isinya.
            </Text>
          </AnimatedView>
        ) : (
          <View style={styles.sectionsWrap}>
            {shownGroups.map(({ category, items }) => (
              <AnimatedView
                key={category.id}
                entering={FadeInDown.duration(350)}
                style={styles.section}
              >
                {/* Section header */}
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <FolderOpenIcon size={22} color={Colors.secondary} />
                    <View style={styles.sectionHeaderTexts}>
                      <Text style={styles.sectionTitle}>{category.title}</Text>
                      {category.description ? (
                        <Text style={styles.sectionDesc} numberOfLines={1}>
                          {category.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleFolder(category.id)}
                    style={styles.hideBtn}
                    activeOpacity={0.75}
                  >
                    <EyeOffIcon size={12} color={Colors.mutedForeground} />
                    <Text style={styles.hideBtnText}>Sembunyikan</Text>
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.sectionDivider} />

                {/* Video grid */}
                {items.length === 0 ? (
                  <Text style={styles.emptyText}>Belum ada video di folder ini.</Text>
                ) : (
                  <View style={styles.videoGrid}>
                    {items.map((v, i) => (
                      <VideoCard
                        key={v.id}
                        video={v}
                        index={i}
                        onPress={() => setActiveVideo(v)}
                      />
                    ))}
                  </View>
                )}
              </AnimatedView>
            ))}
          </View>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>

      <VideoPlayerModal video={activeVideo} onClose={handleClose} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const FOLDER_W = (SCREEN_W - Spacing.md * 2 - Spacing.sm) / 2;
const VIDEO_CARD_W = (SCREEN_W - Spacing.md * 2 - Spacing.sm) / 2;
const PLAYER_W = SCREEN_W - Spacing.md * 2;
const PLAYER_H = PLAYER_W * (9 / 16);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
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
  headerBadgeGrad: { padding: 14 },
  pageTitle: { textAlign: 'center', marginBottom: 6 },
  pageTitlePlain: { fontFamily: Typography.heading, fontSize: 30, color: Colors.foreground },
  pageTitleGradient: { fontFamily: Typography.heading, fontSize: 30, color: Colors.secondary },
  pageDesc: { fontFamily: Typography.body, fontSize: 14, color: Colors.mutedForeground, textAlign: 'center' },

  // Folder Grid
  folderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  folderCard: {
    width: FOLDER_W,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  folderCardActive: {
    borderColor: 'rgba(16,185,129,0.40)',
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  folderCardInner: { padding: Spacing.md },
  folderTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  folderIconWrap: { width: 40, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  folderIconWrapActive: { backgroundColor: 'rgba(16,185,129,0.18)' },
  folderBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: BorderRadius.full, paddingHorizontal: 7, paddingVertical: 3 },
  folderBadgeActive: { backgroundColor: 'rgba(16,185,129,0.15)' },
  folderBadgeText: { fontFamily: Typography.bodyMedium, fontSize: 10, color: Colors.mutedForeground },
  folderBadgeTextActive: { color: Colors.secondary },
  folderTitle: { fontFamily: Typography.bodySemiBold, fontSize: 13, color: Colors.foreground, marginBottom: 3 },
  folderCount: { fontFamily: Typography.body, fontSize: 11, color: Colors.mutedForeground },

  // Sections
  sectionsWrap: { paddingHorizontal: Spacing.md, gap: Spacing.xl },
  section: { gap: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  sectionHeaderTexts: { flex: 1 },
  sectionTitle: { fontFamily: Typography.heading, fontSize: 18, color: Colors.secondary },
  sectionDesc: { fontFamily: Typography.body, fontSize: 11, color: Colors.mutedForeground, marginTop: 2 },
  sectionDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 4 },
  hideBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: BorderRadius.sm, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.03)', marginTop: 2 },
  hideBtnText: { fontFamily: Typography.bodyMedium, fontSize: 11, color: Colors.mutedForeground },

  // Video Grid
  videoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  videoCard: { width: VIDEO_CARD_W },
  videoCardInner: { borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(120,60,210,0.25)', backgroundColor: Colors.card },
  videoThumbWrap: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', position: 'relative', overflow: 'hidden' },
  videoThumb: { width: '100%', height: '100%' },
  videoThumbFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  thumbPlayOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  thumbPlayBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(220,38,38,0.88)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6, paddingLeft: 2 },
  ytBadge: { position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  ytBadgeText: { fontFamily: Typography.bodyMedium, fontSize: 10, color: '#fff' },
  videoInfo: { padding: Spacing.sm + 4 },
  videoTitle: { fontFamily: Typography.bodySemiBold, fontSize: 13, color: Colors.foreground, lineHeight: 18 },
  videoDesc: { fontFamily: Typography.body, fontSize: 11, color: Colors.mutedForeground, marginTop: 4, lineHeight: 16 },

  // Empty
  emptyBox: { marginHorizontal: Spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed', borderRadius: BorderRadius.lg, paddingVertical: Spacing.xl, paddingHorizontal: Spacing.md, alignItems: 'center' },
  emptyText: { fontFamily: Typography.body, fontSize: 13, color: Colors.mutedForeground, textAlign: 'center', lineHeight: 20, fontStyle: 'italic' },

  // Modal overlay
  modalOverlay: { flex: 1, backgroundColor: 'rgba(4,6,20,0.90)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.md },
  modalBox: { width: '100%', backgroundColor: Colors.card, borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(120,60,210,0.30)', shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.6, shadowRadius: 32, elevation: 24 },

  // Modal header
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', gap: Spacing.sm },
  modalTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  modalTitle: { fontFamily: Typography.bodySemiBold, fontSize: 14, color: Colors.foreground, flex: 1, lineHeight: 20 },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },

  // WebView player
  playerWrapper: { width: '100%', height: PLAYER_H, backgroundColor: '#000', position: 'relative' },
  webview: { flex: 1, backgroundColor: '#000' },
  playerLoadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', gap: 10 },
  playerLoadingText: { fontFamily: Typography.body, fontSize: 13, color: 'rgba(255,255,255,0.5)' },

  // Fullscreen toggle button (pojok kanan bawah player)
  fullscreenBtn: { position: 'absolute', bottom: 8, right: 8, zIndex: 10 },
  fullscreenBtnInner: { width: 30, height: 30, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' },

  // Modal info
  modalInfo: { padding: Spacing.md },
  modalInfoTitle: { fontFamily: Typography.bodySemiBold, fontSize: 15, color: Colors.foreground, marginBottom: 4, lineHeight: 21 },
  modalInfoDesc: { fontFamily: Typography.body, fontSize: 12, color: Colors.mutedForeground, lineHeight: 17, marginBottom: 8 },
  modalInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  modalInfoMeta: { fontFamily: Typography.body, fontSize: 12, color: Colors.mutedForeground },

  // Fullscreen container
  fsContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  fsLoadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  fsExitBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 16, right: 60, zIndex: 20 },
  fsExitBtnInner: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(30,34,64,0.85)', alignItems: 'center', justifyContent: 'center' },
  fsCloseBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 16, right: 16, zIndex: 20 },
  fsCloseBtnInner: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(180,30,30,0.85)', alignItems: 'center', justifyContent: 'center' },
});