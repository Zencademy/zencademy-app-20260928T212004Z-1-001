const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Increase memory limit for Metro bundler
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add memory optimization
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// No RNFirebase-specific resolver tweaks needed for Expo Go

module.exports = config;


