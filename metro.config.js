const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ─── Resolve @react-native/assets-registry dinamis ───────────────────────────
const assetsRegistryPath = (() => {
  try {
    return path.dirname(
      require.resolve('@react-native/assets-registry/package.json', {
        paths: [__dirname],
      })
    );
  } catch (e) {
    return null;
  }
})();

if (assetsRegistryPath) {
  config.resolver.extraNodeModules = {
    '@react-native/assets-registry': assetsRegistryPath,
  };
}

// ─── Tambahkan ekstensi video & audio agar Metro bisa bundle file lokal ───────
// Tanpa ini, require('../assets/video.mp4') akan gagal resolve.
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'jfif',
  // Video
  'mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', '3gp',
  // Audio
  'mp3', 'wav', 'aac', 'm4a', 'ogg',
];

module.exports = config;