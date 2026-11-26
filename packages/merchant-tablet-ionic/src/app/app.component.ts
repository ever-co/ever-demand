import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular/lazy';
import { TranslateService } from '@ngx-translate/core';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import IPlatform from '@modules/server.common/interfaces/IPlatform';
import { IDeviceCreateObject } from '@modules/server.common/interfaces/IDevice';
import { Store } from '../services/store.service';
import { environment } from '../environments/environment';
import { AnalyticsService } from '../services/native/analytics.service';
import { DeviceInfoService } from '../services/native/device-info.service';
import { NativeShellService } from '../services/native/native-shell.service';
import { NetworkStatusService } from '../services/native/network-status.service';

@Component({
	selector: 'e-cu-root',
	templateUrl: 'app.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class AppComponent {
	constructor(
		public platform: Platform,
		private readonly store: Store,
		private readonly router: Router,
		private readonly location: Location,
		private readonly nativeShell: NativeShellService,
		private readonly deviceInfo: DeviceInfoService,
		private readonly analytics: AnalyticsService,
		private readonly network: NetworkStatusService,
		private readonly deviceRouter: DeviceRouter,
		private readonly translate: TranslateService
	) {
		this.initializeApp();
	}

	rootPage: any;
	defaultLanguage = '';

	initializeApp() {
		this.platform.ready().then(async () => {
			this._watchNetworkConnection();

			this.defaultLanguage = environment.DEFAULT_LANGUAGE;

			const browserLang = this.translate.getBrowserLang() || '';

			if (this.defaultLanguage) {
				this.translate.use(this.defaultLanguage);
			} else {
				this.translate.use(
					browserLang.match(/en-US|bg-BG|he-IL|ru-RU|es-ES|fr-FR/)
						? browserLang
						: 'en-US'
				);
			}

			this.store.language = this.translate.getCurrentLang();

			// Plugins that only work in the native app
			if (this.deviceInfo.isNative) {
				this.analytics.start();
				this.preferredLanguage();
			}

			if (!this.deviceId) {
				this._registerDevice();
			}

			await this.nativeShell.ready();
		});
	}

	get deviceId() {
		return localStorage.getItem('_deviceId');
	}

	async preferredLanguage() {
		const language = await this.deviceInfo.getPreferredLanguage();
		if (language) {
			this.store.language = language.substring(0, 2);
		}
	}

	async deviceCreateObject(): Promise<IDeviceCreateObject> {
		const language = localStorage.getItem('_language') || 'en-US';
		if (!this.deviceInfo.isNative) {
			return {
				channelId: null,
				language: language as ILanguage,
				type: 'browser' as IPlatform,
				// have to find way how to generate it from browser
				uuid: environment.FAKE_UUID,
			};
		}
		const details = await this.deviceInfo.getDetails();
		return {
			channelId: null,
			language: language as ILanguage,
			type: details.platform as IPlatform,
			uuid: details.uuid,
		};
	}

	async openPage(page) {
		await this.router.navigate(page.url);
	}

	get maintenanceMode() {
		return this.store.maintenanceMode;
	}

	private _watchNetworkConnection() {
		this.network.onDisconnect().subscribe(async () => {
			console.error('network was disconnected :-(');
			await this.router.navigate(['errors', 'connection-lost']);
		});

		this.network.onConnect().subscribe(() => {
			console.log('network connected!');
			this.location.back();
		});
	}

	private async _registerDevice() {
		const deviceCreateObject = await this.deviceCreateObject();

		const device = await this.deviceRouter.create(deviceCreateObject);

		this.store.deviceId = device.id;
		this.store.language = device.language;
		this.store.platform = device.type;
	}
}
