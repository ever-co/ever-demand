import { Injectable } from '@angular/core';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Network, type ConnectionStatus } from '@capacitor/network';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { callNumber } from './phone';
import { scanBarcode } from './barcode-scanner';

/**
 * The Capacitor plugins the app uses (they replaced Cordova / @ionic-native), behind one
 * injectable so pages and specs can swap them. Capacitor plugin objects are proxies that
 * cannot be spied on directly.
 */
@Injectable({
	providedIn: 'root',
})
export class NativeService {
	/** True in the Android / iOS app, false in a browser. */
	isNative(): boolean {
		return Capacitor.isNativePlatform();
	}

	/** 'android' | 'ios' | 'web' */
	platform(): string {
		return Capacitor.getPlatform();
	}

	/** Stable id of the device (was cordova-plugin-device `uuid`). */
	async deviceId(): Promise<string> {
		return (await Device.getId()).identifier;
	}

	/** Two-letter language of the device (was cordova-plugin-globalization). */
	async languageCode(): Promise<string> {
		return (await Device.getLanguageCode()).value;
	}

	async networkStatus(): Promise<ConnectionStatus> {
		return Network.getStatus();
	}

	onNetworkStatusChange(
		listener: (status: ConnectionStatus) => void
	): Promise<PluginListenerHandle> {
		return Network.addListener('networkStatusChange', listener);
	}

	/** Light text on a dark status bar (was StatusBar.styleBlackOpaque()). */
	async useDarkStatusBar(): Promise<void> {
		await StatusBar.setStyle({ style: Style.Dark });
	}

	async hideSplashScreen(): Promise<void> {
		await SplashScreen.hide();
	}

	/** Opens the dialer (was cordova CallNumber). Throws without a number. */
	callNumber(phone: string): void {
		callNumber(phone);
	}

	/** Text of the scanned barcode, null when cancelled; rejects in a browser. */
	scanBarcode(): Promise<string | null> {
		return scanBarcode();
	}
}
