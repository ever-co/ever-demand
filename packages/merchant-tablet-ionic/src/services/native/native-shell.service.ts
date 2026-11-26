import { inject, Injectable } from '@angular/core';
import { Style } from '@capacitor/status-bar';
import {
	IS_NATIVE_PLATFORM,
	SCREEN_ORIENTATION,
	SPLASH_SCREEN,
	STATUS_BAR,
} from './plugins';

/**
 * Status bar, splash screen and screen orientation through `@capacitor/status-bar`,
 * `@capacitor/splash-screen` and `@capacitor/screen-orientation` (they replace the Ionic
 * Native + Cordova plugins). All are no-ops in the browser.
 */
@Injectable({ providedIn: 'root' })
export class NativeShellService {
	private readonly isNative = inject(IS_NATIVE_PLATFORM);
	private readonly statusBar = inject(STATUS_BAR);
	private readonly splashScreen = inject(SPLASH_SCREEN);
	private readonly screenOrientation = inject(SCREEN_ORIENTATION);

	async ready(): Promise<void> {
		if (!this.isNative) {
			return;
		}
		try {
			// The merchant app is a tablet app (the old `screenOrientation.lock(LANDSCAPE)`).
			await this.screenOrientation.lock({ orientation: 'landscape' });
		} catch (error) {
			console.warn('ScreenOrientation is not available', error);
		}
		try {
			// Light text on the dark brand bar (the old `statusBar.styleBlackOpaque()`).
			await this.statusBar.setStyle({ style: Style.Dark });
		} catch (error) {
			console.warn('StatusBar is not available', error);
		}
		try {
			await this.splashScreen.hide();
		} catch (error) {
			console.warn('SplashScreen is not available', error);
		}
	}
}
