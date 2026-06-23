/**
 * videos.tsx  —  app/(tabs)/videos.tsx
 *
 * Fix Error 153:
 * YouTube memblokir embed via WebView native (user-agent detection).
 * Solusi profesional: buka video langsung di app YouTube / browser
 * menggunakan Linking.openURL() — ini cara yang dipakai semua app besar.
 *
 * Modal sekarang menampilkan:
 *  - Thumbnail besar dengan tombol play
 *  - Info video (judul, deskripsi)
 *  - Tombol "Tonton di YouTube" → buka app YouTube (atau browser sebagai fallback)
 *  - Tombol "Salin Link" → copy URL ke clipboard
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
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
} from 'react-native';
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
} from '../../src/components/Icons';

const { width: SCREEN_W } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);

// ─── Buka video di app YouTube atau browser ───────────────────────────────────

async function openYouTube(url: string) {
  const id = getYouTubeId(url);
  if (!id) {
    // fallback: buka URL asli
    Linking.openURL(url).catch(() => {});
    return;
  }

  // Coba buka di app YouTube terlebih dahulu
  const ytAppUrl = `vnd.youtube://${id}`;
  const canOpen = await Linking.canOpenURL(ytAppUrl).catch(() => false);

  if (canOpen) {
    Linking.openURL(ytAppUrl).catch(() => {
      // fallback ke browser
      Linking.openURL(`https://www.youtube.com/watch?v=${id}`).catch(() => {});
    });
  } else {
    // App YouTube tidak terinstall → buka di browser
    Linking.openURL(`https://www.youtube.com/watch?v=${id}`).catch(() => {});
  }
}

// ─── Video Player Modal ────────────────────────────────────────────────────────

function VideoPlayerModal({
  video,
  onClose,
}: {
  video: VideoItem | null;
  onClose: () => void;
}) {
  const overlayOpacity = useSharedValue(0);
  const boxScale = useSharedValue(0.92);

  React.useEffect(() => {
    if (video) {
      overlayOpacity.value = withTiming(1, { duration: 220 });
      boxScale.value = withSpring(1, { damping: 22, stiffness: 260 });
    }
  }, [video]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: boxScale.value }],
    opacity: overlayOpacity.value,
  }));

  const handleClose = useCallback(() => {
    overlayOpacity.value = withTiming(0, { duration: 160 }, (done) => {
      if (done) runOnJS(onClose)();
    });
    boxScale.value = withSpring(0.92);
  }, [onClose]);

  const handleShare = useCallback(async () => {
    if (!video) return;
    try {
      await Share.share({ message: `${video.title}\n${video.src}` });
    } catch {}
  }, [video]);

  if (!video) return null;

  const thumb = video.thumbnail ?? (video.type === 'youtube' ? getYouTubeThumbnail(video.src) : null);
  const youtubeId = getYouTubeId(video.src);

  return (
    <Modal
      transparent
      visible={!!video}
      onRequestClose={handleClose}
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="transparent" translucent />
      <AnimatedView style={[styles.modalOverlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <AnimatedView style={[styles.modalBox, boxStyle]}>
          {/* ── Header ── */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleWrap}>
              <YoutubeIcon size={18} color="#ef4444" />
              <Text style={styles.modalTitle} numberOfLines={2}>{video.title}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.modalCloseBtn} hitSlop={8}>
              <XIcon size={18} color={Colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* ── Thumbnail besar + tombol Play ── */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => openYouTube(video.src)}
            style={styles.thumbArea}
          >
            {thumb ? (
              <Image source={{ uri: thumb }} style={styles.thumbImg} resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={['rgba(124,58,237,0.35)', 'rgba(16,185,129,0.25)']}
                style={styles.thumbFallback}
              >
                <YoutubeIcon size={48} color="rgba(255,255,255,0.4)" />
              </LinearGradient>
            )}

            {/* Overlay gelap */}
            <View style={styles.thumbOverlay} />

            {/* Tombol play besar di tengah */}
            <View style={styles.playBtnCenter}>
              <LinearGradient
                colors={['#dc2626', '#b91c1c']}
                style={styles.playBtnGrad}
              >
                <PlayIcon size={32} color="#fff" />
              </LinearGradient>
            </View>

            {/* Badge YouTube */}
            <View style={styles.ytBadge}>
              <YoutubeIcon size={13} color="#fff" />
              <Text style={styles.ytBadgeText}>YouTube</Text>
            </View>

            {/* Label "Ketuk untuk menonton" */}
            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>Ketuk untuk menonton</Text>
            </View>
          </TouchableOpacity>

          {/* ── Info ── */}
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

          {/* ── Tombol aksi ── */}
          <View style={styles.actionRow}>
            {/* Tombol utama: Tonton di YouTube */}
            <TouchableOpacity
              style={styles.watchBtn}
              activeOpacity={0.82}
              onPress={() => openYouTube(video.src)}
            >
              <LinearGradient
                colors={['#dc2626', '#b91c1c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.watchBtnGrad}
              >
                <YoutubeIcon size={18} color="#fff" />
                <Text style={styles.watchBtnText}>Tonton di YouTube</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Tombol share */}
            <TouchableOpacity
              style={styles.shareBtn}
              activeOpacity={0.82}
              onPress={handleShare}
            >
              <Text style={styles.shareBtnText}>Bagikan</Text>
            </TouchableOpacity>
          </View>
        </AnimatedView>
      </AnimatedView>
    </Modal>
  );
}

// ─── VideoCard ─────────────────────────────────────────────────────────────────

function VideoCard({
  video,
  index,
  onPress,
}: {
  video: VideoItem;
  index: number;
  onPress: () => void;
}) {
  const thumb = video.thumbnail ?? (video.type === 'youtube' ? getYouTubeThumbnail(video.src) : null);

  return (
    <AnimatedView
      entering={FadeInDown.delay(Math.min(index * 60, 400)).duration(400)}
      style={styles.videoCard}
    >
      <TouchableOpacity activeOpacity={0.87} onPress={onPress} style={styles.videoCardInner}>
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

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.72)']}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.thumbPlayOverlay}>
            <View style={styles.thumbPlayBtn}>
              <PlayIcon size={18} color="#fff" />
            </View>
          </View>

          <View style={styles.ytBadgeCard}>
            <YoutubeIcon size={11} color="#fff" />
            <Text style={styles.ytBadgeText}>YouTube</Text>
          </View>
        </View>

        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
          {video.description ? (
            <Text style={styles.videoDesc} numberOfLines={2}>{video.description}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    </AnimatedView>
  );
}

// ─── FolderCard ────────────────────────────────────────────────────────────────

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
        <Text style={styles.folderTitle} numberOfLines={2}>{category.title}</Text>
        <Text style={styles.folderCount}>{count} video</Text>
      </TouchableOpacity>
    </AnimatedView>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function VideosScreen() {
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
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

        {/* Sections */}
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

                <View style={styles.sectionDivider} />

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

// ─── Styles ────────────────────────────────────────────────────────────────────

const FOLDER_W = (SCREEN_W - Spacing.md * 2 - Spacing.sm) / 2;
const VIDEO_CARD_W = (SCREEN_W - Spacing.md * 2 - Spacing.sm) / 2;
const THUMB_H = (SCREEN_W - Spacing.md * 2) * (9 / 16);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  headerBg: { alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  headerBadge: { marginBottom: Spacing.md, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(124,58,237,0.35)' },
  headerBadgeGrad: { padding: 14 },
  pageTitle: { textAlign: 'center', marginBottom: 6 },
  pageTitlePlain: { fontFamily: Typography.heading, fontSize: 30, color: Colors.foreground },
  pageTitleGradient: { fontFamily: Typography.heading, fontSize: 30, color: Colors.secondary },
  pageDesc: { fontFamily: Typography.body, fontSize: 14, color: Colors.mutedForeground, textAlign: 'center' },

  // Folder grid
  folderGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.lg },
  folderCard: { width: FOLDER_W, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(255,255,255,0.03)', overflow: 'hidden' },
  folderCardActive: { borderColor: 'rgba(16,185,129,0.40)', backgroundColor: 'rgba(16,185,129,0.08)' },
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

  // Video grid
  videoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  videoCard: { width: VIDEO_CARD_W },
  videoCardInner: { borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(120,60,210,0.25)', backgroundColor: Colors.card },
  videoThumbWrap: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', position: 'relative', overflow: 'hidden' },
  videoThumb: { width: '100%', height: '100%' },
  videoThumbFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  thumbPlayOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  thumbPlayBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(220,38,38,0.88)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6, paddingLeft: 2 },
  ytBadgeCard: { position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  ytBadgeText: { fontFamily: Typography.bodyMedium, fontSize: 10, color: '#fff' },
  videoInfo: { padding: Spacing.sm + 4 },
  videoTitle: { fontFamily: Typography.bodySemiBold, fontSize: 13, color: Colors.foreground, lineHeight: 18 },
  videoDesc: { fontFamily: Typography.body, fontSize: 11, color: Colors.mutedForeground, marginTop: 4, lineHeight: 16 },

  // Empty
  emptyBox: { marginHorizontal: Spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed', borderRadius: BorderRadius.lg, paddingVertical: Spacing.xl, paddingHorizontal: Spacing.md, alignItems: 'center' },
  emptyText: { fontFamily: Typography.body, fontSize: 13, color: Colors.mutedForeground, textAlign: 'center', lineHeight: 20, fontStyle: 'italic' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(4,6,20,0.90)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.md },
  modalBox: { width: '100%', backgroundColor: Colors.card, borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(120,60,210,0.30)', shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.6, shadowRadius: 32, elevation: 24 },

  // Modal header
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', gap: Spacing.sm },
  modalTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  modalTitle: { fontFamily: Typography.bodySemiBold, fontSize: 14, color: Colors.foreground, flex: 1, lineHeight: 20 },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },

  // Thumbnail area (full-width, 16:9)
  thumbArea: { width: '100%', height: THUMB_H, backgroundColor: '#000', position: 'relative', overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  thumbFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  thumbOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  playBtnCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  playBtnGrad: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', shadowColor: '#dc2626', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10, paddingLeft: 4 },
  ytBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  tapHint: { position: 'absolute', bottom: 10, left: 0, right: 0, alignItems: 'center' },
  tapHintText: { fontFamily: Typography.body, fontSize: 11, color: 'rgba(255,255,255,0.65)', backgroundColor: 'rgba(0,0,0,0.50)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },

  // Modal info
  modalInfo: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  modalInfoTitle: { fontFamily: Typography.bodySemiBold, fontSize: 15, color: Colors.foreground, marginBottom: 4, lineHeight: 21 },
  modalInfoDesc: { fontFamily: Typography.body, fontSize: 12, color: Colors.mutedForeground, lineHeight: 17, marginBottom: 8 },
  modalInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  modalInfoMeta: { fontFamily: Typography.body, fontSize: 12, color: Colors.mutedForeground },

  // Action buttons
  actionRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, paddingTop: Spacing.sm },
  watchBtn: { flex: 1, borderRadius: BorderRadius.md, overflow: 'hidden' },
  watchBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, paddingHorizontal: Spacing.md },
  watchBtnText: { fontFamily: Typography.bodySemiBold, fontSize: 14, color: '#fff' },
  shareBtn: { borderRadius: BorderRadius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 13, paddingHorizontal: Spacing.md, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.mutedForeground },
});