const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Resolve @react-native/assets-registry secara dinamis
// Aman untuk npm, yarn, pnpm, dan EAS Build server
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

module.exports = config;
