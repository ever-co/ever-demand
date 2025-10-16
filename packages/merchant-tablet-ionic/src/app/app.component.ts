import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Globalization } from '@ionic-native/globalization/ngx';
import { Device } from '@ionic-native/device/ngx';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Mixpanel } from '@ionic-native/mixpanel/ngx';
import { Intercom } from '@ionic-native/intercom/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { TranslateService } from '@ngx-translate/core';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import IPlatform from '@modules/server.common/interfaces/IPlatform';
import { IDeviceCreateObject } from '@modules/server.common/interfaces/IDevice';
import { Router } from '@angular/router';
import { Store } from '../services/store.service';
import { environment } from '../environments/environment';

@Component({
	selector: 'e-cu-root',
	templateUrl: 'app.component.html',
})
export class AppComponent {
	constructor(
		public platform: Platform,
		public statusBar: StatusBar,
		public splashScreen: SplashScreen,
		private readonly store: Store,
		private readonly router: Router,
		private readonly location: Location,
		private globalization: Globalization,
		private device: Device,
		private ga: GoogleAnalytics,
		private _network: Network,
		private mixpanel: Mixpanel,
		private intercom: Intercom,
		private screenOrientation: ScreenOrientation,
		private deviceRouter: DeviceRouter,
		private translate: TranslateService
	) {
		this.initializeApp();
	}

	rootPage: any;
	defaultLanguage = '';

	initializeApp() {
		this.platform.ready().then(() => {
			this._watchNetworkConnection();

			this.defaultLanguage = environment['DEFAULT_LANGUAGE'];

			const browserLang = this.translate.getBrowserLang();

			if (this.defaultLanguage) {
				this.translate.use(this.defaultLanguage);
			} else {
				this.translate.use(
					browserLang.match(/en-US|bg-BG|he-IL|ru-RU|es-ES|fr-FR/)
						? browserLang
						: 'en-US'
				);
			}

			this.store.language = this.translate.currentLang;

			// Plugins only working on the mobile devices
			if (this.device.platform) {
				this.startGoogleAnalytics();
				this.preferredLanguage();
				this.startMixpanel();
				this.screenOrientation.lock(
					this.screenOrientation.ORIENTATIONS.LANDSCAPE
				);
			}

			if (!this.deviceId) {
				this._registerDevice();
			}

			this.statusBar.styleBlackOpaque();

			this.splashScreen.hide();
		});
	}

	get deviceId() {
		return localStorage.getItem('_deviceId');
	}

	startGoogleAnalytics() {
		setTimeout(() => {
			this.ga
				.startTrackerWithId(environment.GOOGLE_ANALYTICS_API_KEY, 30)
				.then(() => {
					console.log('Google analytics is ready now!');
					this.ga.trackView('test');
					// Tracker is ready
					// You can now track pages or set additional information such as AppVersion or UserId
				})
				.catch((e) => console.log('Error starting GoogleAnalytics', e));
		}, 3000);
	}

	preferredLanguage() {
		console.log('Preferred Language');
		this.globalization
			.getPreferredLanguage()
			.then((res) => {
				this.store.language = res.value.substr(0, 2);
			})
			.catch((e) => console.log(e));
	}

	deviceCreateObject(): IDeviceCreateObject {
		const language = localStorage.getItem('_language') || 'en-US';
		if (!this.device.platform || this.device.platform === 'browser') {
			return {
				channelId: null,
				language: language as ILanguage,
				type: 'browser' as IPlatform,
				// have to find way how to generate it from browser
				uuid: environment.FAKE_UUID,
			};
		}
		return {
			channelId: null,
			language: language as ILanguage,
			type: this.device.platform as IPlatform,
			uuid: this.device.uuid,
		};
	}

	startMixpanel() {
		this.mixpanel.init(environment.MIXPANEL_API_KEY).then(() => {
			console.log('Mixpanel is ready now!');
			this.mixpanel.track('App Booted');
		});
	}

	async openPage(page) {
		await this.router.navigate(page.url);
	}

	get maintenanceMode() {
		return this.store.maintenanceMode;
	}

	private _watchNetworkConnection() {
		this._network.onDisconnect().subscribe(async (_) => {
			console.error('network was disconnected :-(');
			await this.router.navigate(['errors', 'connection-lost']);
		});

		this._network.onConnect().subscribe((_) => {
			console.log('network connected!');
			this.location.back();
			setTimeout(() => {
				if (this._network.type === 'wifi') {
					console.log('we got a wifi connection, woohoo!');
				}
			}, 3000);
		});
	}

	private async _registerDevice() {
		const deviceCreateObject = this.deviceCreateObject();

		const device = await this.deviceRouter.create(deviceCreateObject);

		this.store.deviceId = device.id;
		this.store.language = device.language;
		this.store.platform = device.type;
	}
}
