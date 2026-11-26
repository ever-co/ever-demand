import { InjectionToken } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Device, DevicePlugin } from '@capacitor/device';
import { Geolocation, GeolocationPlugin } from '@capacitor/geolocation';
import {
	LocalNotifications,
	LocalNotificationsPlugin,
} from '@capacitor/local-notifications';
import { Network, NetworkPlugin } from '@capacitor/network';
import { SplashScreen, SplashScreenPlugin } from '@capacitor/splash-screen';
import { StatusBar, StatusBarPlugin } from '@capacitor/status-bar';

/**
 * Capacitor plugins behind injection tokens, so services can be unit tested with fakes
 * (module mocking does not work on the pre-bundled Angular test build).
 */
export const GEOLOCATION = new InjectionToken<GeolocationPlugin>('Geolocation', {
	providedIn: 'root',
	factory: () => Geolocation,
});

export const NETWORK = new InjectionToken<NetworkPlugin>('Network', {
	providedIn: 'root',
	factory: () => Network,
});

export const LOCAL_NOTIFICATIONS = new InjectionToken<LocalNotificationsPlugin>(
	'LocalNotifications',
	{ providedIn: 'root', factory: () => LocalNotifications }
);

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

/** `true` inside the Android/iOS app, `false` in a browser. */
export const IS_NATIVE_PLATFORM = new InjectionToken<boolean>(
	'IsNativePlatform',
	{ providedIn: 'root', factory: () => Capacitor.isNativePlatform() }
);
