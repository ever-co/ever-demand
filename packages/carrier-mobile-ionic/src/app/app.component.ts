import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import { IDeviceCreateObject } from '@modules/server.common/interfaces/IDevice';
import IPlatform from '@modules/server.common/interfaces/IPlatform';
import { environment } from '../environments/environment';
import { Store } from '../services/store.service';
import { AnalyticsService } from '../services/native/analytics.service';
import { DeviceInfoService } from '../services/native/device-info.service';
import { NativeShellService } from '../services/native/native-shell.service';
import { NetworkStatusService } from '../services/native/network-status.service';

export const SUPPORTED_LANGUAGES = {
	he: 'he',
	ru: 'ru',
	bg: 'bg',
	en: 'en',
	es: 'es',
	fr: 'fr',
};

@Component({
	selector: 'e-cu-root',
	templateUrl: 'app.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class AppComponent implements OnInit {
	defaultLanguage = '';

	constructor(
		public platform: Platform,
		private readonly nativeShell: NativeShellService,
		private readonly analytics: AnalyticsService,
		private readonly network: NetworkStatusService,
		private readonly deviceInfo: DeviceInfoService,
		private readonly _langTranslator: TranslateService,
		private readonly store: Store,
		private readonly router: Router,
		private readonly deviceRouter: DeviceRouter,
	) {}

	ngOnInit(): void {
		this.initializeApp();
	}

	initializeApp() {
		this.platform.ready().then(async () => {
			if (!this.store.deviceId) {
				this._registerDevice();
			}

			this.networkWatch();
			this._setupLangTranslator();

			if (this.deviceInfo.isNative) {
				this.analytics.start();
				this.preferredLanguage();
			}
			// The platform is ready and the plugins are available.
			await this.nativeShell.ready();
		});
	}

	networkWatch() {
		this.network.onDisconnect().subscribe(() => {
			this.store.noInternet = 'noInternet';
			this.router.navigateByUrl('info/no-internet', {
				skipLocationChange: false,
			});
			console.log('network was disconnected :-(');
		});
	}

	async preferredLanguage() {
		console.log(
			'Preferred Language',
			await this.deviceInfo.getPreferredLanguage(),
		);
	}

	get showInformationPage() {
		return this.store.showInformationPage;
	}

	private async _setupLangTranslator() {
		this.defaultLanguage = environment.DEFAULT_LANGUAGE;

		const lang = (localStorage.getItem('_language') as ILanguage) || null;
		const langs = SUPPORTED_LANGUAGES;

		this._langTranslator.resetLang(langs.en);

		if (lang) {
			this._langTranslator.use(lang.substring(0, 2));
		} else {
			const browserLang = this.deviceInfo.isNative
				? await this.deviceInfo.getPreferredLanguage()
				: this._langTranslator.getBrowserLang();
			if (this.defaultLanguage) {
				this._langTranslator.use(this.defaultLanguage);
			} else if (langs[browserLang]) {
				this._langTranslator.use(langs[browserLang]);
			} else {
				this._langTranslator.use(langs.en);
			}
		}
	}

	private async _registerDevice() {
		const deviceCreateObject = await this.deviceCreateObject();

		const device = await this.deviceRouter.create(deviceCreateObject);

		this.store.deviceId = device.id;
		this.store.language = device.language;
		this.store.platform = device.type;
	}

	private async deviceCreateObject(): Promise<IDeviceCreateObject> {
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
}
