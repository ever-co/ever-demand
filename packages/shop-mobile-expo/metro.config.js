/**
 * ? Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const defaultSourceExts =
	require('metro-config/src/defaults/defaults').sourceExts;
module.exports = {
	transformer: {
		getTransformOptions: async () => ({
			transform: {
				experimentalImportSupport: false,
				inlineRequires: true,
			},
		}),
	},
	resolver: {
		// ? Add cjs files extention support
		sourceExts: process.env.RN_SRC_EXT
			? [
					...process.env.RN_SRC_EXT.split(',').concat(
						defaultSourceExts,
					),
					'cjs',
			  ]
			: [...defaultSourceExts, 'cjs'],
	},
};
