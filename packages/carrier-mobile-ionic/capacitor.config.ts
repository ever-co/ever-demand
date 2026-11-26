import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor replaces Cordova for the native builds. The appId is the old Cordova
 * `config.xml` widget id. The native projects `android/` and `ios/` are committed: run
 * `pnpm run build && npx cap sync` after every web build or plugin change.
 */
const config: CapacitorConfig = {
	appId: 'co.ever.carrier',
	appName: 'Ever Carrier',
	webDir: 'www',
	server: {
		// The API runs on plain HTTP in development (http://<host>:5500, :8443, ws://:2086); an
		// https WebView origin would block those calls as mixed content.
		androidScheme: 'http',
		cleartext: true,
	},
	plugins: {
		SplashScreen: {
			launchShowDuration: 3000,
			launchFadeOutDuration: 300,
		},
		LocalNotifications: {
			iconColor: '#2a2c39',
		},
	},
};

export default config;
