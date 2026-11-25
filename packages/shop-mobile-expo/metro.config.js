// Expo's Metro config detects the pnpm workspace (watchFolders + node_modules paths) by itself.
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
