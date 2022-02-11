// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the workspace root, this can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);
// 1. Watch all files within the monorepo (require watchman installed! disabled for now)
// config.watchFolders = [workspaceRoot];
// 2. Let Metro know where to resolve packages, and in what order
config.resolver.sourceExts.push('cjs');
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, 'node_modules'),
	path.resolve(workspaceRoot, 'node_modules'),
];

console.log('Expo config =====>', config);

module.exports = config;

// const { createMetroConfiguration } = require('expo-yarn-workspaces');

// const config = createMetroConfiguration(__dirname);

// console.log('Expo config =====>', config);

// module.exports = config;
