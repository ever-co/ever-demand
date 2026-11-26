import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor replaces Cordova for the native builds. The appId is the old Cordova
 * `config.xml` widget id. Native projects are not committed; create them with
 * `pnpm run build && npx cap add android` (or `ios`), then `npx cap sync`.
 */
const config: CapacitorConfig = {
	appId: 'co.ever.carrier',
	appName: 'Ever Carrier',
	webDir: 'www',
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
