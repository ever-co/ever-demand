import {
	ChangeDetectionStrategy,
	Component,
} from '@angular/core';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular/lazy';
import { TranslateService } from '@ngx-translate/core';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import IPlatform from '@modules/server.common/interfaces/IPlatform';
import { Router } from '@angular/router';
import { Store } from './services/store.service';
import { NativeService } from './services/native/native.service';
import { environment } from 'environments/environment';

@Component({
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
	selector: 'e-cu-root',
	templateUrl: 'app.component.html',
})
export class AppComponent {
	constructor(
		public readonly platform: Platform,
		private readonly store: Store,
		private readonly router: Router,
		private readonly deviceRouter: DeviceRouter,
		private readonly _translateService: TranslateService,
		private readonly location: Location,
		private readonly native: NativeService
	) {
		this._initializeApp();

		_translateService.addLangs([
			'en-US',
			'bg-BG',
			'he-IL',
			'ru-RU',
			'es-ES',
			'fr-FR',
		]);

		// The texts for keys a language file lacks. Store picks the
		// language the app starts in (Store._initLanguage).
		_translateService.setFallbackLang('en-US');
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
			if (this.native.isNative()) {
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
		return this.native.isNative()
			? (this.native.platform() as IPlatform)
			: 'browser';
	}

	async getUUID(): Promise<string> {
		return this.native.isNative()
			? await this.native.deviceId()
			: environment.FAKE_UUID;
	}

	async openPage(page) {
		await this.router.navigate(page.url);
	}

	private async _watchNetworkConnection() {
		// The Capacitor plugin also works in a browser (online / offline
		// events), like the Cordova one did on a device.
		let connected = (await this.native.networkStatus()).connected;

		await this.native.onNetworkStatusChange(async (status) => {
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

		if (this.native.isNative()) {
			// Was StatusBar.styleBlackOpaque(): light text on a dark bar.
			await this.native.useDarkStatusBar();
			await this.native.hideSplashScreen();
		}

		if (!this.store.deviceId) {
			await this._registerDeviceDevMode();
		}
	}

	private async _registerDeviceDevMode() {
		// On a phone with no saved language, Store reads the phone language
		// after the device is ready. Wait for it, so the device is not saved
		// with no language.
		await this.store.startLanguage;

		const device = await this.deviceRouter.create({
			channelId: await this.getChannelId(),
			language: this.getLanguage(),
			type: this.getPlatform(),
			uuid: await this.getUUID(),
		});

		this.store.deviceId = device.id;
	}
}
