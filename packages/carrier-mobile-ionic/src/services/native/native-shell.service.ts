import { inject, Injectable } from '@angular/core';
import { Style } from '@capacitor/status-bar';
import { IS_NATIVE_PLATFORM, SPLASH_SCREEN, STATUS_BAR } from './plugins';

/**
 * Status bar and splash screen through `@capacitor/status-bar` and `@capacitor/splash-screen`
 * (they replace the Ionic Native + Cordova plugins). Both are no-ops in the browser.
 */
@Injectable({ providedIn: 'root' })
export class NativeShellService {
	private readonly isNative = inject(IS_NATIVE_PLATFORM);
	private readonly statusBar = inject(STATUS_BAR);
	private readonly splashScreen = inject(SPLASH_SCREEN);

	async ready(): Promise<void> {
		if (!this.isNative) {
			return;
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
