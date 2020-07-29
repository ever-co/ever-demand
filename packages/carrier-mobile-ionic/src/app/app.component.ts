import { Component, OnInit } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { Mixpanel } from '@ionic-native/mixpanel/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Globalization } from '@ionic-native/globalization/ngx';
import { Device } from '@ionic-native/device/ngx';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { Store } from '../services/store.service';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import { Platform } from '@ionic/angular';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';
import { IDeviceCreateObject } from '@modules/server.common/interfaces/IDevice';
import IPlatform from '@modules/server.common/interfaces/IPlatform';
import { Router } from '@angular/router';

@Component({
	selector: 'e-cu-root',
	templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {
	defaultLanguage = '';

	constructor(
		public platform: Platform,
		public statusBar: StatusBar,
		public splashScreen: SplashScreen,
		private ga: GoogleAnalytics,
		private mixpanel: Mixpanel,
		private network: Network,
		private globalization: Globalization,
		private device: Device,
		private _langTranslator: TranslateService,
		private store: Store,
		private router: Router,
		private deviceRouter: DeviceRouter
	) {}

	ngOnInit(): void {
		this.initializeApp();
	}

	initializeApp() {
		this.platform.ready().then(() => {
			if (!this.store.deviceId) {
				this._registerDevice();
			}

			this.networkWatch();
			this._setupLangTranslator();

			if (this.device.platform) {
				this.startGoogleAnalytics();
				this.preferredLanguage();
				this.startMixpanel();
			}
			// Okay, so the platform is ready and our plugins are available.
			// Here you can do any higher level native things you might need.
			this.statusBar.styleBlackOpaque();
			this.splashScreen.hide();
		});
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

	networkWatch() {
		const disconnectSubscription = this.network
			.onDisconnect()
			.subscribe(() => {
				this.store.noInternet = 'noInternet';
				this.router.navigateByUrl('info/no-internet', {
					skipLocationChange: false,
				});
				console.log('network was disconnected :-(');
			});
	}

	preferredLanguage() {
		console.log('Preferred Language');
		this.globalization
			.getPreferredLanguage()
			.then((res) => {
				console.log(res.value);
			})
			.catch((e) => console.log(e));
	}

	startMixpanel() {
		this.mixpanel.init(environment.MIXPANEL_API_KEY).then(() => {
			console.log('Mixpanel is ready now!');
			this.mixpanel.track('App Booted');
		});
	}

	get showInformationPage() {
		return this.store.showInformationPage;
	}

	private async _setupLangTranslator() {
		this.defaultLanguage = environment['DEFAULT_LANGUAGE'];

		console.log('this.defaultLanguage');
		console.log(this.defaultLanguage);

		const lang = (localStorage.getItem('_language') as ILanguage) || null;
		const langs = { he: 'he', ru: 'ru', bg: 'bg', en: 'en', es: 'es' };
		// This 4 lines is here because of bug => without this lines, lang translation doesn't work.
		// (The bug is unknown)
		this._langTranslator.use(langs.he);
		this._langTranslator.use(langs.ru);
		this._langTranslator.use(langs.bg);
		this._langTranslator.use(langs.en);
		this._langTranslator.use(langs.es);

		this._langTranslator.resetLang(langs.en);

		if (lang) {
			this._langTranslator.use(lang.substr(0, 2));
		} else {
			const browserLang = this.platform.is('cordova')
				? (await this.globalization.getPreferredLanguage()).value
				: this._langTranslator.getBrowserLang();
			if (this.defaultLanguage) {
				this._langTranslator.use(this.defaultLanguage);
			} else {
				if (langs[browserLang]) {
					this._langTranslator.use(langs[browserLang]);
				} else {
					this._langTranslator.use(langs.en);
				}
			}
		}
	}

	private async _registerDevice() {
		const deviceCreateObject = this.deviceCreateObject();

		const device = await this.deviceRouter.create(deviceCreateObject);

		this.store.deviceId = device.id;
		this.store.language = device.language;
		this.store.platform = device.type;
	}

	private deviceCreateObject(): IDeviceCreateObject {
		const language = localStorage.getItem('_language') || 'en-US';
		if (!this.device.platform || this.device.platform === 'browser') {
			return {
				channelId: null,
				language: language as ILanguage,
				type: 'browser' as IPlatform,
				// have to find way how to generate it from browser
				uuid: environment['FAKE_UUID'],
			};
		}
		return {
			channelId: null,
			language: language as ILanguage,
			type: this.device.platform as IPlatform,
			uuid: this.device.uuid,
		};
	}
}
