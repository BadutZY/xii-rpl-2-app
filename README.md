# XI RPL 2 - Mobile App

React Native app (Expo) untuk kelas XI RPL 2 SMK INFOKOM.

## Fitur

- Home - Hero section, About, Lessons, Gallery Preview, Quick Access
- Murid & Guru - Daftar siswa dengan search + modal detail, wali kelas
- Jadwal - Jadwal pelajaran & piket, filter per hari, modal detail
- Gallery - Polaroid grid dengan lightbox viewer

## Cara Menjalankan

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Expo Go app di HP (Android/iOS) — untuk development tanpa build native

### Install dependencies

```bash
npm install
```

### Jalankan development server

```bash
npx expo start
```

Lalu scan QR code dengan:
- **Android**: Expo Go app
- **iOS**: Kamera bawaan atau Expo Go app

## Struktur Project

```
xi-rpl2-mobile/
├── app/
│   ├── _layout.tsx          # Root layout (fonts, splash)
│   └── (tabs)/
│       ├── _layout.tsx      # Bottom tab bar
│       ├── index.tsx        # Home screen
│       ├── students.tsx     # Murid & Guru screen
│       ├── schedule.tsx     # Jadwal screen
│       └── gallery.tsx      # Gallery screen
├── src/
│   ├── components/
│   │   ├── Icons.tsx        # SVG icons (no emoji)
│   │   ├── StudentModal.tsx
│   │   ├── TeacherModal.tsx
│   │   └── ScheduleModal.tsx
│   ├── constants/
│   │   └── theme.ts         # Design tokens (colors, typography, spacing)
│   └── data/
│       ├── students.ts
│       ├── teachers.ts
│       ├── schedule.ts
│       └── gallery.ts
└── assets/
    ├── gallery/             # Foto gallery kelas
    └── photos/              # Foto profil siswa
```

## Tech Stack

- **Expo** ~51 dengan Expo Router v3 (file-based routing)
- **React Native Reanimated** v3 — animasi spring & timing
- **React Native Gesture Handler** — gesture support
- **Expo Linear Gradient** — gradient backgrounds & buttons
- **expo-google-fonts** — Inter + Space Grotesk (sama dengan web)
- **react-native-svg** — semua icon dalam SVG (tidak ada emoji)
