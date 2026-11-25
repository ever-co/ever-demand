import type { CapacitorConfig } from '@capacitor/cli';

// The native projects are generated, not committed: run `npx cap add android` (or `ios`)
// after `pnpm run build:prod`, then `npx cap sync`. See docs/latest-stack/shop-mobile-ionic.md.
const config: CapacitorConfig = {
	// Same id as the Cordova app (config.xml widget id), so store updates keep working.
	appId: 'co.ever.customer',
	appName: 'Ever Shop',
	webDir: 'www',
	server: {
		// The API runs on plain HTTP in development (http://<host>:5500, :8443, ws://:2086).
		androidScheme: 'http',
		cleartext: true,
	},
	plugins: {
		SplashScreen: {
			// config.xml: SplashScreenDelay 3000, FadeSplashScreenDuration 300.
			launchShowDuration: 3000,
			launchFadeOutDuration: 300,
			launchAutoHide: false,
			backgroundColor: '#2a2c39',
		},
	},
};

export default config;
