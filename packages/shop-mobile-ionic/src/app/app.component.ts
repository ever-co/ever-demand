import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular/lazy';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Network } from '@capacitor/network';
import { Device } from '@capacitor/device';
import { TranslateService } from '@ngx-translate/core';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import IPlatform from '@modules/server.common/interfaces/IPlatform';
import { Router } from '@angular/router';
import { Store } from './services/store.service';
import { environment } from 'environments/environment';

@Component({
	standalone: false,
	selector: 'e-cu-root',
	templateUrl: 'app.component.html',
})
export class AppComponent {
	defaultLanguage = '';

	constructor(
		public readonly platform: Platform,
		private readonly store: Store,
		private readonly router: Router,
		private readonly deviceRouter: DeviceRouter,
		private readonly _translateService: TranslateService,
		private readonly location: Location
	) {
		this._initializeApp();

		this.defaultLanguage = environment['DEFAULT_LANGUAGE'];

		_translateService.addLangs([
			'en-US',
			'bg-BG',
			'he-IL',
			'ru-RU',
			'es-ES',
			'fr-FR',
		]);

		_translateService.setFallbackLang('en-US');

		const browserLang = _translateService.getBrowserLang();

		if (this.defaultLanguage) {
			_translateService.use(this.defaultLanguage);
		} else {
			_translateService.use(
				browserLang.match(/en-US|bg-BG|he-HE|ru-RU|es-ES|fr-FR/)
					? browserLang
					: 'en-US'
			);
		}
	}

	async getChannelId(): Promise<string | null> {
		const urbanAirshipPlugin = (window as any).UrbanAirshipPlugin;

		if (urbanAirshipPlugin !== undefined) {
			return new Promise<string>((resolve) =>
				urbanAirshipPlugin.getChannelID((channelID) =>
					resolve(channelID)
				)
			);
		} else {
			if (Capacitor.isNativePlatform()) {
				console.error(
					"DeviceService can't getChannelId() because UrbanAirship plugin isn't installed!"
				);
			}
			return null;
		}
	}

	getLanguage(): ILanguage {
		return this.store.language;
	}

	getPlatform(): IPlatform {
		// 'android' | 'ios' on a device, 'web' in a browser
		return Capacitor.isNativePlatform()
			? (Capacitor.getPlatform() as IPlatform)
			: 'browser';
	}

	async getUUID(): Promise<string> {
		return Capacitor.isNativePlatform()
			? (await Device.getId()).identifier
			: environment.FAKE_UUID;
	}

	async openPage(page) {
		await this.router.navigate(page.url);
	}

	private async _watchNetworkConnection() {
		// The Capacitor plugin also works in a browser (online / offline
		// events), like the Cordova one did on a device.
		let connected = (await Network.getStatus()).connected;

		await Network.addListener('networkStatusChange', async (status) => {
			if (status.connected === connected) {
				return;
			}
			connected = status.connected;

			if (!status.connected) {
				console.error('Network was disconnected!');
				await this.router.navigate(['errors', 'connection-lost']);
			} else {
				console.warn('Network connected!');
				this.location.back();
				setTimeout(() => {
					if (status.connectionType === 'wifi') {
						console.log('Wifi connection detected!');
					}
				}, 3000);
			}
		});
	}

	private async _initializeApp() {
		await this.platform.ready();

		await this._watchNetworkConnection();

		if (Capacitor.isNativePlatform()) {
			// Was StatusBar.styleBlackOpaque(): light text on a dark bar.
			await StatusBar.setStyle({ style: Style.Dark });
			await SplashScreen.hide();
		}

		if (!this.store.deviceId) {
			await this._registerDeviceDevMode();
		}

		// await this._watchDeviceUpdates();
	}

	private async _registerDeviceDevMode() {
		const device = await this.deviceRouter.create({
			channelId: await this.getChannelId(),
			language: this.getLanguage(),
			type: this.getPlatform(),
			uuid: await this.getUUID(),
		});

		this.store.deviceId = device.id;
	}

	// private async _watchDeviceUpdates() {
	// 	this._translateService.onLangChange.subscribe(async ({ lang }) => {
	// 		await this.deviceRouter.updateLanguage(this.store.deviceId, lang);
	// 	});
	// }
}
