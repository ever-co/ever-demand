import { InjectionToken } from '@angular/core';
import {
	BarcodeScanner,
	BarcodeScannerPlugin,
} from '@capacitor-mlkit/barcode-scanning';
import { AppLauncher, AppLauncherPlugin } from '@capacitor/app-launcher';
import { Camera, CameraPlugin } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Device, DevicePlugin } from '@capacitor/device';
import { Network, NetworkPlugin } from '@capacitor/network';
import {
	ScreenOrientation,
	ScreenOrientationPlugin,
} from '@capacitor/screen-orientation';
import { SplashScreen, SplashScreenPlugin } from '@capacitor/splash-screen';
import { StatusBar, StatusBarPlugin } from '@capacitor/status-bar';

/**
 * Capacitor plugins behind injection tokens, so services can be unit tested with fakes
 * (module mocking does not work on the pre-bundled Angular test build).
 */
export const NETWORK = new InjectionToken<NetworkPlugin>('Network', {
	providedIn: 'root',
	factory: () => Network,
});

export const DEVICE = new InjectionToken<DevicePlugin>('Device', {
	providedIn: 'root',
	factory: () => Device,
});

export const STATUS_BAR = new InjectionToken<StatusBarPlugin>('StatusBar', {
	providedIn: 'root',
	factory: () => StatusBar,
});

export const SPLASH_SCREEN = new InjectionToken<SplashScreenPlugin>(
	'SplashScreen',
	{ providedIn: 'root', factory: () => SplashScreen }
);

export const SCREEN_ORIENTATION = new InjectionToken<ScreenOrientationPlugin>(
	'ScreenOrientation',
	{ providedIn: 'root', factory: () => ScreenOrientation }
);

export const CAMERA = new InjectionToken<CameraPlugin>('Camera', {
	providedIn: 'root',
	factory: () => Camera,
});

export const BARCODE_SCANNER = new InjectionToken<BarcodeScannerPlugin>(
	'BarcodeScanner',
	{ providedIn: 'root', factory: () => BarcodeScanner }
);

export const APP_LAUNCHER = new InjectionToken<AppLauncherPlugin>(
	'AppLauncher',
	{ providedIn: 'root', factory: () => AppLauncher }
);

/** `true` inside the Android/iOS app, `false` in a browser. */
export const IS_NATIVE_PLATFORM = new InjectionToken<boolean>(
	'IsNativePlatform',
	{ providedIn: 'root', factory: () => Capacitor.isNativePlatform() }
);

/** Opens `tel:` / `mailto:` links in the browser (replaced in unit tests). */
export const OPEN_EXTERNAL_URL = new InjectionToken<(url: string) => void>(
	'OpenExternalUrl',
	{
		providedIn: 'root',
		factory: () => (url: string) => {
			window.location.href = url;
		},
	}
);
