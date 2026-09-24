<div align="center">

<img src="assets/logo.png" height="140">

# XII RPL 2 - Mobile App

**Aplikasi Mobile Resmi Kelas XII RPL 2, SMK INFOKOM**

[![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=for-the-badge)]()
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-3DDC84?style=for-the-badge)]()
[![Type](https://img.shields.io/badge/Type-School%20Project-FF6B35?style=for-the-badge)]()
[![Built With](https://img.shields.io/badge/Built%20With-React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=white)]()
[![Built With](https://img.shields.io/badge/Built%20With-Expo-000020?style=for-the-badge&logo=expo&logoColor=white)]()
[![Package Manager](https://img.shields.io/badge/Package%20Manager-npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)]()

[Tentang](#tentang) . [Fitur Utama](#fitur-utama) . [Layar](#layar) . [Backend](#backend-supabase) . [Teknologi](#teknologi) . [Memulai](#memulai)

---

## Tentang

XII RPL 2 Mobile App adalah versi Android/iOS dari platform informasi digital kelas XII RPL 2 di SMK INFOKOM. Aplikasi ini dibangun dengan React Native (Expo) dan memakai backend Supabase yang sama persis dengan versi website, sehingga profil murid, jadwal pelajaran, dan data akun selalu sinkron di kedua platform.

Selain menampilkan informasi kelas seperti direktori murid, jadwal, dan galeri, aplikasi ini juga menyediakan sistem akun (login dengan username dan password) yang memungkinkan setiap murid dan wali kelas mengelola profil mereka sendiri, lengkap dengan foto, bio, tanggal lahir, dan tautan sosial media, langsung dari HP.

Proyek ini dikembangkan sebagai media informasi resmi kelas, dengan tujuan memberikan akses yang cepat, rapi, dan enak dipakai di perangkat mobile bagi murid, wali kelas, maupun pihak lain yang ingin mengenal lebih dekat kelas XII RPL 2.

---

## Memulai

Aplikasi ini dijalankan melalui Expo Go selama masa pengembangan, atau melalui berkas APK/AAB hasil build EAS untuk distribusi. Bagi yang ingin menjalankan proyek ini secara lokal, ikuti langkah pada bagian [Instalasi](#instalasi).

---

## Layar

Aplikasi ini terbagi ke dalam delapan layar utama. Lima layar pertama dapat diakses lewat tab bar bawah, sementara tiga sisanya adalah layar akun yang terhubung dari header.

| Layar | Berkas | Deskripsi |
|---|---|---|
| Beranda | `app/(tabs)/index.tsx` | Ringkasan informasi kelas, kartu akses cepat, serta gambaran mata pelajaran produktif |
| Murid dan Guru | `app/(tabs)/students.tsx` | Direktori murid dan wali kelas lengkap dengan foto, bio, dan tautan sosial media |
| Jadwal | `app/(tabs)/schedule.tsx` | Jadwal pelajaran dan jadwal piket harian, dapat difilter per hari |
| Galeri | `app/(tabs)/gallery.tsx` | Dokumentasi visual kegiatan kelas dalam mode grid dengan lightbox viewer |
| Video | `app/(tabs)/videos.tsx` | Pustaka video dari YouTube maupun berkas lokal, dengan pemutar layar penuh |
| Login | `app/login.tsx` | Masuk memakai akun (username dan password) yang sama dengan website |
| Profil | `app/profile.tsx` | Lihat dan ubah profil sendiri, serta ganti username/password |
| Admin | `app/admin.tsx` | Khusus akun admin, mengelola akun murid/wali kelas dan jadwal langsung dari HP |

---

## Fitur Utama

| Fitur | Deskripsi |
|---|---|
| Direktori Anggota Kelas | Pencarian murid maupun wali kelas berdasarkan nama, lengkap dengan modal detail profil |
| Jadwal Interaktif | Jadwal pelajaran dan piket yang dapat difilter per hari, dengan penanda hari aktif berjalan |
| Galeri dan Video | Galeri foto bergaya grid serta pustaka video dengan pencarian dan filter kategori |
| Login dan Profil Pribadi | Sistem akun dengan username dan password, serta halaman profil untuk mengubah nickname, bio, foto, dan sosial media |
| Panel Admin | Khusus akun admin, mengelola akun (buat, reset password, jadikan admin, hapus) dan jadwal kelas |
| Sinkron dengan Website | Memakai project Supabase yang sama dengan website, sehingga perubahan data langsung terlihat di kedua platform |
| Mode Tema | Dukungan tampilan terang dan gelap yang dapat diubah kapan saja |
| Ikon Kustom | Seluruh ikon memakai SVG kustom, tanpa emoji, untuk tampilan yang konsisten di semua perangkat |

---

## Backend (Supabase)

Aplikasi ini memakai project Supabase yang sama persis dengan versi website (`xii-rpl-2-database`). Tabel `profiles`, storage bucket `avatars`, serta Edge Function `admin-users` sudah tersedia di backend dan tidak perlu dibuat ulang.

Login memakai username, bukan email, sama seperti website. Aplikasi akan otomatis mengubahnya menjadi `username@xiirpl2.local` di belakang layar sebelum memanggil Supabase Auth.

Kredensial yang dibutuhkan (anon key, aman dipakai di sisi klien) diisi melalui berkas `.env` dengan dua variabel berikut.

| Variabel | Deskripsi |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL project Supabase yang dipakai aplikasi |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon key (public) dari project Supabase tersebut |

Salin `.env.example` menjadi `.env`, lalu isi kedua nilai di atas sesuai project Supabase yang digunakan.

---

## Teknologi

| Layer | Teknologi |
|---|---|
| Framework | React Native, Expo (SDK 56) |
| Bahasa | TypeScript |
| Routing | Expo Router (file-based routing) |
| Styling | React Native StyleSheet dengan design token kustom (`src/constants/theme.ts`) |
| Animasi | React Native Reanimated, React Native Gesture Handler |
| Backend dan Auth | Supabase (`@supabase/supabase-js`) |
| Ikon | React Native SVG, ikon kustom tanpa emoji |
| Font | Expo Google Fonts (Inter dan Space Grotesk) |
| Package Manager | npm |
| Build dan Distribusi | EAS Build (Android APK/AAB, iOS) |

---

## Struktur Proyek

```
xii-rpl2-mobile/
├── app/
│   ├── _layout.tsx           Root layout (font, splash, AuthProvider)
│   ├── login.tsx              Layar login
│   ├── profile.tsx             Layar profil (lihat/ubah profil sendiri)
│   ├── admin.tsx                Layar admin (kelola akun dan jadwal)
│   └── (tabs)/
│       ├── _layout.tsx            Tab bar bawah dan header akun
│       ├── index.tsx               Layar beranda
│       ├── students.tsx             Layar murid dan guru
│       ├── schedule.tsx              Layar jadwal
│       ├── gallery.tsx                Layar galeri
│       └── videos.tsx                  Layar video
├── src/
│   ├── components/
│   │   ├── Icons.tsx                     Kumpulan ikon SVG (tanpa emoji)
│   │   ├── ConfirmModal.tsx               Modal konfirmasi kustom (logout, dan lainnya)
│   │   ├── StudentModal.tsx                Modal detail murid
│   │   ├── TeacherModal.tsx                 Modal detail guru
│   │   └── ScheduleModal.tsx                 Modal detail jadwal
│   ├── constants/
│   │   └── theme.ts                            Design token (warna, tipografi, spacing)
│   ├── context/
│   │   ├── ThemeContext.tsx                      Pengelola mode terang/gelap
│   │   └── AuthContext.tsx                        Sesi login, profil, status admin
│   ├── lib/
│   │   ├── supabaseClient.ts                        Klien Supabase
│   │   ├── profilesApi.ts                            Gabungan data statis dan profil Supabase
│   │   ├── adminAccountsApi.ts                        Pemanggil Edge Function admin-users
│   │   ├── accountSecurity.ts                          Ganti password akun sendiri
│   │   ├── avatarUpload.ts                              Unggah foto ke Supabase Storage
│   │   └── socials.tsx                                   Data dan ikon sosial media
│   ├── types/
│   │   └── profile.ts                                      Tipe data profil
│   └── data/
│       ├── students.ts                                       Data dasar murid
│       ├── teachers.ts                                        Data dasar guru
│       ├── schedule.ts                                         Data jadwal
│       ├── gallery.ts                                           Data galeri
│       └── videos.ts                                             Data video
├── assets/
│   ├── gallery/               Foto dokumentasi kegiatan kelas
│   └── photos/                 Foto profil murid
├── app.json               Konfigurasi Expo
├── eas.json                Konfigurasi build EAS
├── babel.config.js          Konfigurasi Babel
├── metro.config.js            Konfigurasi Metro bundler
├── tsconfig.json                Konfigurasi TypeScript
└── package.json                    Daftar dependensi dan skrip proyek
```

---

## Instalasi

Prasyarat: [Node.js](https://nodejs.org/) versi 18 ke atas, npm sebagai package manager, serta aplikasi Expo Go di HP (Android/iOS) untuk pengembangan tanpa build native.

1. Klon repositori ini.

   ```bash
   git clone <url-repositori-ini>
   cd xii-rpl2-mobile
   ```

2. Pasang seluruh dependensi.

   ```bash
   npm install
   ```

   Jika muncul peringatan versi paket tidak cocok dengan Expo SDK yang terpasang, jalankan `npx expo install --fix` supaya versinya otomatis disesuaikan.

3. Salin berkas environment.

   ```bash
   cp .env.example .env
   ```

   Lalu isi `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY` sesuai project Supabase yang digunakan.

4. Jalankan server pengembangan.

   ```bash
   npx expo start
   ```

   Lalu pindai QR code yang muncul dengan aplikasi Expo Go (Android) atau kamera bawaan/Expo Go (iOS).

<div align="center">

### Skrip yang Tersedia

| Perintah | Deskripsi |
|---|---|
| `npm run start` | Menjalankan server pengembangan Expo (setara `expo start`) |
| `npm run android` | Membangun dan menjalankan aplikasi pada emulator/perangkat Android |
| `npm run ios` | Membangun dan menjalankan aplikasi pada simulator/perangkat iOS |
| `npm run web` | Menjalankan aplikasi dalam mode web (untuk pratinjau cepat) |

---

## Disclaimer

XII RPL 2 Mobile App merupakan proyek yang dikembangkan untuk keperluan internal dan edukasi kelas XII RPL 2, SMK INFOKOM. Seluruh data murid, wali kelas, dan dokumentasi yang ditampilkan digunakan atas dasar persetujuan pihak kelas dan hanya ditujukan untuk kepentingan non-komersial di lingkungan kelas.

---

*Dibangun oleh dan untuk XII RPL 2 - SMK INFOKOM.*

[Kembali ke Atas](#xii-rpl-2---mobile-app)

</div>