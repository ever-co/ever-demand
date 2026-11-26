import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Device } from '@ionic-native/device/ngx';
import { Network } from '@ionic-native/network/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {
	TranslateLoader,
	TranslateModule,
	TranslateService,
} from '@ngx-translate/core';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import { NEVER } from 'rxjs';
import { AppComponent } from './app.component';
import { LanguagePage } from './pages/+language/language.page';
import { settle } from './testing/fake-socket';
import { ManualLoader } from './testing/manual-loader';

// On first start the app registers a new device. The customer can open
// the menu and pick a language before the server answers.
describe('AppComponent device language on first start', () => {
	// What the specs change in the browser, put back after each spec.
	const keys = ['_deviceId', '_language'];
	let savedValues: (string | null)[];
	let savedDir: string;
	let savedLang: string;

	let deviceRouter: jasmine.SpyObj<DeviceRouter>;
	// Answers create, which waits until the spec calls this.
	let answerCreate: (device: { id: string }) => void = () => {};

	// Starts the app as main.ts does, with no device id yet. No language
	// file arrives, as on a slow network. beforeCreate runs before the
	// app sends create.
	const startApp = async (beforeCreate: () => void = () => {}) => {
		deviceRouter = jasmine.createSpyObj('DeviceRouter', {
			create: new Promise((resolve) => (answerCreate = resolve)),
			updateLanguage: Promise.resolve({ id: 'device-1' }),
		});

		await TestBed.configureTestingModule({
			declarations: [AppComponent, LanguagePage],
			imports: [
				TranslateModule.forRoot({
					loader: {
						provide: TranslateLoader,
						useValue: new ManualLoader(),
					},
				}),
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			providers: [
				{
					provide: Platform,
					useValue: {
						is: () => false,
						isRTL: false,
						ready: () => Promise.resolve('ready'),
					},
				},
				{
					provide: StatusBar,
					useValue: jasmine.createSpyObj('StatusBar', [
						'styleBlackOpaque',
					]),
				},
				{
					provide: SplashScreen,
					useValue: jasmine.createSpyObj('SplashScreen', ['hide']),
				},
				{
					provide: Router,
					useValue: jasmine.createSpyObj('Router', ['navigate']),
				},
				{ provide: DeviceRouter, useValue: deviceRouter },
				{
					provide: Location,
					useValue: jasmine.createSpyObj('Location', ['back']),
				},
				{
					provide: Network,
					useValue: jasmine.createSpyObj('Network', {
						onDisconnect: NEVER,
						onConnect: NEVER,
					}),
				},
				{ provide: Device, useValue: {} },
				{ provide: InviteRouter, useValue: {} },
				{ provide: UserRouter, useValue: {} },
			],
		}).compileComponents();

		TestBed.createComponent(AppComponent);
		beforeCreate();
		await settle();
	};

	// The customer picks a language on the language page, which the side
	// menu opens.
	const pick = (language: ILanguage) => {
		TestBed.createComponent(LanguagePage).componentInstance.language =
			language;
	};

	beforeEach(() => {
		savedValues = keys.map((key) => localStorage.getItem(key));
		keys.forEach((key) => localStorage.removeItem(key));
		savedDir = document.documentElement.dir;
		savedLang = document.documentElement.lang;

		spyOn(TranslateService.prototype, 'getBrowserLang').and.returnValue(
			'en'
		);
	});

	afterEach(() => {
		keys.forEach((key, i) => {
			if (savedValues[i] === null) {
				localStorage.removeItem(key);
			} else {
				localStorage.setItem(key, savedValues[i]);
			}
		});
		document.documentElement.dir = savedDir;
		document.documentElement.lang = savedLang;
	});

	it('saves a language picked while create is pending on the new device', async () => {
		await startApp();
		expect(deviceRouter.create).toHaveBeenCalledOnceWith(
			jasmine.objectContaining({ language: 'en-US' })
		);

		pick('he-IL');
		await settle();
		expect(deviceRouter.updateLanguage).not.toHaveBeenCalled();

		answerCreate({ id: 'device-1' });
		await settle();

		expect(deviceRouter.updateLanguage).toHaveBeenCalledOnceWith(
			'device-1',
			'he-IL'
		);
	});

	it('saves a language picked before create, while its file still loads, on the new device', async () => {
		await startApp(() => pick('he-IL'));
		// The he-IL file has not arrived, so the app still shows en-US.
		expect(deviceRouter.create).toHaveBeenCalledOnceWith(
			jasmine.objectContaining({ language: 'en-US' })
		);

		answerCreate({ id: 'device-1' });
		await settle();

		expect(deviceRouter.updateLanguage).toHaveBeenCalledOnceWith(
			'device-1',
			'he-IL'
		);
	});

	it('does not update the language when the customer picks none', async () => {
		await startApp();

		answerCreate({ id: 'device-1' });
		await settle();

		expect(deviceRouter.create).toHaveBeenCalledOnceWith(
			jasmine.objectContaining({ language: 'en-US' })
		);
		expect(localStorage.getItem('_deviceId')).toBe('device-1');
		expect(deviceRouter.updateLanguage).not.toHaveBeenCalled();
	});

	it('does not update the language when create sent the saved language', async () => {
		localStorage.setItem('_language', 'fr-FR');

		await startApp();
		answerCreate({ id: 'device-1' });
		await settle();

		expect(deviceRouter.create).toHaveBeenCalledOnceWith(
			jasmine.objectContaining({ language: 'fr-FR' })
		);
		expect(deviceRouter.updateLanguage).not.toHaveBeenCalled();
	});

	it('keeps the new device and logs when the server rejects the language', async () => {
		const rejection = new Error('Device does not exist');
		spyOn(console, 'error');

		await startApp();
		deviceRouter.updateLanguage.and.rejectWith(rejection);
		pick('he-IL');
		answerCreate({ id: 'device-1' });
		await settle();

		expect(deviceRouter.updateLanguage).toHaveBeenCalledOnceWith(
			'device-1',
			'he-IL'
		);
		expect(console.error).toHaveBeenCalledWith(
			jasmine.any(String),
			rejection
		);
		expect(localStorage.getItem('_deviceId')).toBe('device-1');
	});
});
