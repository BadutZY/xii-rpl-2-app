// src/data/videos.ts
//
// ══════════════════════════════════════════════════════════════
//  CARA MENAMBAH KATEGORI BARU
// ══════════════════════════════════════════════════════════════
//  Tambahkan entry baru di array `videoCategories`:
//    { id: 'mycat', title: 'Nama Kategori', description: '...' }
//
// ══════════════════════════════════════════════════════════════
//  CARA MENAMBAH VIDEO YOUTUBE
// ══════════════════════════════════════════════════════════════
//  {
//    id: 'v-x',
//    title: 'Judul Video',
//    categoryId: 'mycat',
//    type: 'youtube',
//    src: 'https://www.youtube.com/watch?v=xxxx',
//    // thumbnail: dikosongkan → otomatis ambil dari YouTube
//  }
//
// ══════════════════════════════════════════════════════════════
//  CARA MENAMBAH VIDEO LOKAL (file .mp4 di dalam project)
// ══════════════════════════════════════════════════════════════
//  STEP 1 — Taruh file video di folder assets, contoh:
//            assets/videos/namavideo.mp4
//
//  STEP 2 — Pastikan metro.config.js sudah include 'mp4'
//            di assetExts (sudah dilakukan di file metro.config.js ini).
//
//  STEP 3 — Tambahkan entry di array videos:
//  {
//    id: 'local-1',
//    title: 'Nama Video',
//    categoryId: 'mycat',
//    type: 'local',
//    src: require('../../assets/videos/namavideo.mp4'),
//    thumbnail: require('../../assets/videos/thumb.jpg'),  // opsional
//    orientation: 'landscape',  // ← 'landscape' atau 'portrait'
//                               //    (default: 'landscape')
//  }
//
//  PENTING: src untuk video lokal menggunakan require() yang
//  return number, bukan string. Type VideoItem sudah support keduanya.
//
// ══════════════════════════════════════════════════════════════
//  ORIENTASI VIDEO LOKAL
// ══════════════════════════════════════════════════════════════
//  Field `orientation` hanya berlaku untuk video dengan type: 'local'.
//  Nilai yang bisa diisi:
//    'landscape' → saat tombol fullscreen ditekan, layar akan rotate ke
//                  landscape (horizontal). Cocok untuk video yang direkam
//                  secara horizontal (16:9).
//    'portrait'  → saat tombol fullscreen ditekan, layar tetap portrait
//                  (vertikal) dan video akan mengisi penuh layar.
//                  Cocok untuk video yang direkam secara vertikal (9:16).
//  Jika tidak diisi, default-nya adalah 'landscape'.
//
// ══════════════════════════════════════════════════════════════

export type VideoType = 'youtube' | 'local' | 'instagram';

/**
 * Orientasi layar saat video lokal diputar fullscreen.
 * - 'landscape' → layar rotate horizontal (cocok untuk video 16:9)
 * - 'portrait'  → layar tetap vertikal (cocok untuk video 9:16)
 */
export type VideoOrientation = 'landscape' | 'portrait';

export interface VideoCategory {
  id: string;
  title: string;
  description?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  type: VideoType;
  /**
   * - YouTube / URL online  → string  (URL lengkap)
   * - File lokal (require) → number  (hasil require() di React Native)
   */
  src: string | number;
  /**
   * - YouTube  → biarkan undefined, akan otomatis ambil thumbnail dari YouTube
   * - Lokal    → bisa require() gambar atau URL string
   */
  thumbnail?: string | number;
  /**
   * Hanya untuk type: 'local'.
   * Menentukan orientasi layar saat tombol fullscreen ditekan.
   * - 'landscape' → layar rotate ke horizontal (default)
   * - 'portrait'  → layar tetap vertikal, video mengisi penuh layar
   */
  orientation?: VideoOrientation;
}

// ─── Kategori ─────────────────────────────────────────────────────────────────
export const videoCategories: VideoCategory[] = [
  {
    id: 'vlogindo',
    title: 'Vlog Bahasa Indonesia',
    description: 'Momen seru dan kegiatan harian XI RPL 2.',
  },
  {
    id: 'jepang',
    title: 'Video Bahasa Jepang',
    description: 'Video pembelajaran bahasa Jepang.',
  },
  {
    id: 'drama',
    title: 'Drama Pentas Seni',
    description: 'Pentas Seni Drama yang menampilkan bakat akting siswa-siswi XI RPL 2.',
  },
  {
    id: 'kera',
    title: 'Kebun Raya',
    description: 'siswa-siswi XI RPL 2 berkunjung ke Kebun Raya.',
  },
];

export const videos: VideoItem[] = [
  // ── Vlog Bahasa Indonesia ──────────────────────────────────────────────────
  {
    id: 'v-1',
    title: 'Kelompok 1',
    categoryId: 'vlogindo',
    type: 'youtube',
    src: 'https://youtu.com/watch?v=z-wGOQMxqmc',
  },
  {
    id: 'v-2',
    title: 'Kelompok 2',
    categoryId: 'vlogindo',
    type: 'youtube',
    src: 'https://www.youtube.com/watch?v=2ABgIFB7_tA',
  },
  {
    id: 'v-3',
    title: 'Kelompok 3',
    categoryId: 'vlogindo',
    type: 'youtube',
    src: 'https://www.youtube.com/watch?v=SJlYNahXIfI',
  },
  {
    id: 'v-4',
    title: 'Kelompok 5',
    categoryId: 'vlogindo',
    type: 'youtube',
    src: 'https://www.youtube.com/watch?v=f01bKvdiePE',
  },

  // ── Drama Pentas Seni ──────────────────────────────────────────────────────
  {
    id: 'v-5',
    title: 'Drama PART 1',
    categoryId: 'drama',
    type: 'youtube',
    src: 'https://www.youtube.com/watch?v=bH9v2lqKumw&t=15594s',
  },
  {
    id: 'v-6',
    title: 'Drama PART 2',
    categoryId: 'drama',
    type: 'youtube',
    src: 'https://www.youtube.com/watch?v=cezR1sPCERg&t=2174s',
  },

  // ── Video Bahasa Jepang ────────────────────────────────────────────────────
  {
    id: 'v-7',
    title: 'Kelompok 1',
    categoryId: 'jepang',
    type: 'youtube',
    src: 'https://youtu.be/fp9ycPwzjFY?si=A3eEKsgsITCxQgPu',
  },
  {
    id: 'v-8',
    title: 'Kelompok 2',
    categoryId: 'jepang',
    type: 'youtube',
    src: 'https://youtu.be/v4onA30Ixqk?si=i6BJuYbN3efTWKEd',
  },
  {
    id: 'v-9',
    title: 'Kelompok 3',
    categoryId: 'jepang',
    type: 'youtube',
    src: 'https://youtu.be/3UdbY74afDk?si=TYu4kzgj3Ly2DBXB',
  },
  {
    id: 'v-10',
    title: 'Kelompok 4',
    categoryId: 'jepang',
    type: 'youtube',
    src: 'https://www.youtube.com/watch?v=j8dHIV4n9HU',
  },
  {
    id: 'v-11',
    title: 'Kelompok 5',
    categoryId: 'jepang',
    type: 'youtube',
    src: 'https://youtu.be/4_B6n8rwhio?si=N1EpycqWAr6jbIRW',
  },
  {
    id: 'v-12',
    title: 'Kelompok 6',
    categoryId: 'jepang',
    type: 'youtube',
    src: 'https://youtu.be/Hwuk7O4xgUQ?si=dt4fc3yfGASpo5vQ',
  },

  // ── Video LOKAL ────────────────────────────────────────────────────────────
  {
    id: 'local-1',
    title: 'Kebun Raya',
    categoryId: 'kera',
    type: 'local',
    src: require('../../assets/gallery/kera/keravid1.mp4'),
    thumbnail: require('../../assets/gallery/kera/kera2.jpeg'),
    orientation: 'portrait', // ← ganti ke 'portrait' jika video vertikal
  },

  {
    id: 'local-2',
    title: 'Kebun Raya',
    categoryId: 'kera',
    type: 'local',
    src: require('../../assets/gallery/kera/keravid2.mp4'),
    thumbnail: require('../../assets/gallery/kera/kera2.jpeg'),
    orientation: 'portrait', // ← ganti ke 'portrait' jika video vertikal
  },

  {
    id: 'local-3',
    title: 'Kebun Raya',
    categoryId: 'kera',
    type: 'local',
    src: require('../../assets/gallery/kera/keravid3.mp4'),
    thumbnail: require('../../assets/gallery/kera/kera6.jpeg'),
    orientation: 'portrait', // ← ganti ke 'portrait' jika video vertikal
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const getYouTubeId = (url: string | number): string | null => {
  if (typeof url !== 'string') return null;
  if (!url) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.slice(1).split('/')[0] || null;
    }
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const parts = u.pathname.split('/').filter(Boolean);
    const idx   = parts.findIndex((p) => ['embed', 'shorts', 'v'].includes(p));
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
  } catch {}
  return null;
};

export const getYouTubeThumbnail = (url: string | number): string | null => {
  const id = getYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
};