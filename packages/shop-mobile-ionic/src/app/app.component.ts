import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Network } from '@ionic-native/network/ngx';
import { TranslateService } from '@ngx-translate/core';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import IPlatform from '@modules/server.common/interfaces/IPlatform';
import { Device } from '@ionic-native/device/ngx';
import { Router } from '@angular/router';
import { Store } from './services/store.service';
import { environment } from 'environments/environment';

@Component({
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
		private readonly location: Location,
		private statusBar: StatusBar,
		private splashScreen: SplashScreen,
		private network: Network,
		private device: Device
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

		_translateService.setDefaultLang('en-US');

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
			if (this.platform.is('cordova')) {
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
		return this.platform.is('cordova')
			? (this.device.platform.toLowerCase() as IPlatform)
			: 'browser';
	}

	getUUID(): string {
		return this.platform.is('cordova')
			? this.device.uuid
			: environment.FAKE_UUID;
	}

	async openPage(page) {
		await this.router.navigate(page.url);
	}

	private _watchNetworkConnection() {
		this.network.onDisconnect().subscribe(async () => {
			console.error('Network was disconnected!');
			await this.router.navigate(['errors', 'connection-lost']);
		});
		this.network.onConnect().subscribe(() => {
			console.warn('Network connected!');
			this.location.back();
			setTimeout(() => {
				if (this.network.type === 'wifi') {
					console.log('Wifi connection detected!');
				}
			}, 3000);
		});
	}

	private async _initializeApp() {
		await this.platform.ready();

		this._watchNetworkConnection();

		this.statusBar.styleBlackOpaque();
		this.splashScreen.hide();

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
			uuid: this.getUUID(),
		});

		this.store.deviceId = device.id;
	}

	// private async _watchDeviceUpdates() {
	// 	this._translateService.onLangChange.subscribe(async ({ lang }) => {
	// 		await this.deviceRouter.updateLanguage(this.store.deviceId, lang);
	// 	});
	// }
}
