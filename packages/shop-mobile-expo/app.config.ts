import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Expo app config. Runtime settings are read from EXPO_PUBLIC_* env vars by `src/config/env.ts`
 * (Expo inlines them at bundle time); see `.env.template` for the full list and defaults.
 * Only values that native builds need at config time are read here.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: 'Ever Shop',
	slug: 'ever-demand-shop-mobile-expo',
	owner: 'everco',
	description: 'Ever Demand customer shop app (Expo)',
	version: '0.6.0',
	orientation: 'portrait',
	scheme: 'evershop',
	userInterfaceStyle: 'dark',
	primaryColor: '#2a2c39',
	backgroundColor: '#2a2c39',
	icon: './src/assets/img/appIcons/icon.png',
	assetBundlePatterns: ['**/*'],
	ios: {
		bundleIdentifier: 'co.ever.shop.expo',
		buildNumber: '0.6.0',
		supportsTablet: true,
		infoPlist: {
			NSLocationWhenInUseUsageDescription:
				'Your location is used to find the products and stores near you.',
			NSCameraUsageDescription: 'The camera scans a store QR code.',
		},
		config: {
			googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || undefined,
		},
	},
	android: {
		package: 'co.ever.shop.expo',
		versionCode: 6,
		adaptiveIcon: {
			foregroundImage: './src/assets/img/appIcons/adaptive-icon.png',
			backgroundColor: '#2a2c39',
		},
		permissions: [
			'ACCESS_COARSE_LOCATION',
			'ACCESS_FINE_LOCATION',
			'CAMERA',
		],
		config: {
			googleMaps: {
				apiKey: process.env.GOOGLE_MAPS_API_KEY || undefined,
			},
		},
	},
	web: {
		favicon: './src/assets/img/appIcons/favicon.png',
		bundler: 'metro',
		output: 'single',
		name: 'Ever Mobile Shop App',
		themeColor: '#2a2c39',
		backgroundColor: '#2a2c39',
	},
	plugins: [
		[
			'expo-splash-screen',
			{
				image: './src/assets/img/appIcons/splash.png',
				resizeMode: 'cover',
				backgroundColor: '#2a2c39',
			},
		],
		[
			'expo-location',
			{
				locationWhenInUsePermission:
					'Your location is used to find the products and stores near you.',
			},
		],
		[
			'expo-camera',
			{
				cameraPermission: 'The camera scans a store QR code.',
				recordAudioAndroid: false,
			},
		],
		[
			'@stripe/stripe-react-native',
			{
				merchantIdentifier: process.env.STRIPE_MERCHANT_IDENTIFIER || '',
				enableGooglePay: false,
			},
		],
		'expo-localization',
	],
	extra: {
		eas: {},
	},
});
