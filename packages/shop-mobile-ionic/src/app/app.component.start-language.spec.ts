import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Device } from '@ionic-native/device/ngx';
import { Globalization } from '@ionic-native/globalization';
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
import { environment } from 'environments/environment';
import { NEVER } from 'rxjs';
import { AppComponent } from './app.component';
import { Store } from './services/store.service';
import { settle } from './testing/fake-socket';
import { load, ManualLoader } from './testing/manual-loader';

// Every order of the numbers 0 to count - 1.
const ordersOf = (count: number): number[][] => {
	if (count === 0) {
		return [[]];
	}
	const orders: number[][] = [];
	for (const rest of ordersOf(count - 1)) {
		for (let i = 0; i <= rest.length; i++) {
			orders.push([...rest.slice(0, i), count - 1, ...rest.slice(i)]);
		}
	}
	return orders;
};

describe('AppComponent start language', () => {
	let cordova: boolean;
	let savedLanguage: string | null;
	let savedDir: string;
	let savedLang: string;
	let savedDefaultLanguage: string;
	let deviceId: jasmine.Spy;

	// Starts the app as main.ts does: AppComponent and the Store it
	// injects, with nothing loaded yet.
	const startApp = async () => {
		TestBed.resetTestingModule();
		const loader = new ManualLoader();

		await TestBed.configureTestingModule({
			declarations: [AppComponent],
			imports: [
				TranslateModule.forRoot({
					loader: { provide: TranslateLoader, useValue: loader },
				}),
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			providers: [
				{
					provide: Platform,
					useValue: {
						is: (name: string) => cordova && name === 'cordova',
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
				{
					provide: DeviceRouter,
					useValue: jasmine.createSpyObj('DeviceRouter', {
						create: Promise.resolve({ id: 'device-2' }),
					}),
				},
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
				{
					provide: Device,
					useValue: { platform: 'Android', uuid: 'uuid-1' },
				},
				{ provide: InviteRouter, useValue: {} },
				{ provide: UserRouter, useValue: {} },
			],
		}).compileComponents();

		const fixture = TestBed.createComponent(AppComponent);
		// Lets the device language lookup finish.
		await settle();

		return {
			fixture,
			loader,
			store: TestBed.inject(Store),
			translate: TestBed.inject(TranslateService),
		};
	};

	// Starts the app once for every order in which its language files can
	// arrive, and checks that each start ends in the expected language.
	const expectEveryLoadOrderToEndIn = async (expected: string) => {
		const first = await startApp();
		const fileCount = first.loader.requests.length;
		first.fixture.destroy();

		for (const order of ordersOf(fileCount)) {
			const { fixture, loader, store, translate } = await startApp();
			const arrived = order.map((i) => loader.requests[i].language);

			// The language page shows the start language before any file
			// arrives.
			const shownAtStart = store.language;

			order.forEach((i) => load(loader.requests[i]));
			await settle();

			const ended = {
				language: translate.currentLang,
				shown: store.language,
				text: translate.instant('LANGUAGE_NAME'),
			};
			fixture.destroy();

			const endedInExpected =
				shownAtStart === expected &&
				ended.language === expected &&
				ended.shown === expected &&
				ended.text === expected;
			if (!endedInExpected) {
				fail(
					`Files arriving in the order ${arrived.join(', ')}: ` +
						`the language page showed ${shownAtStart} at start, ` +
						`and the app ended in ${JSON.stringify(ended)}, ` +
						`not ${expected}.`
				);
				return;
			}
		}

		expect(fileCount).toBeGreaterThan(0);
	};

	const deviceLanguageIs = (language: string) =>
		spyOn(TranslateService.prototype, 'getBrowserLang').and.returnValue(
			language
		);

	beforeEach(() => {
		cordova = false;
		savedLanguage = localStorage.getItem('_language');
		localStorage.removeItem('_language');
		savedDir = document.documentElement.dir;
		savedLang = document.documentElement.lang;
		savedDefaultLanguage = environment.DEFAULT_LANGUAGE;
		environment.DEFAULT_LANGUAGE = 'en-US';

		// A known device id, so the app does not register a new device.
		deviceId = spyOnProperty(
			Store.prototype,
			'deviceId',
			'get'
		).and.returnValue('device-1');
		spyOn(console, 'warn');
	});

	afterEach(() => {
		if (savedLanguage === null) {
			localStorage.removeItem('_language');
		} else {
			localStorage.setItem('_language', savedLanguage);
		}
		document.documentElement.dir = savedDir;
		document.documentElement.lang = savedLang;
		environment.DEFAULT_LANGUAGE = savedDefaultLanguage;
	});

	describe('with a saved language', () => {
		['en-US', 'he-IL'].forEach((defaultLanguage) => {
			it(`keeps the saved fr-FR for every load order, with DEFAULT_LANGUAGE ${defaultLanguage}`, async () => {
				localStorage.setItem('_language', 'fr-FR');
				environment.DEFAULT_LANGUAGE = defaultLanguage;
				deviceLanguageIs('ru');

				await expectEveryLoadOrderToEndIn('fr-FR');
			});
		});

		it('sets the page direction and language for the saved language', async () => {
			localStorage.setItem('_language', 'fr-FR');
			document.documentElement.dir = 'rtl';

			await startApp();

			expect(document.documentElement.dir).toBe('ltr');
			expect(document.documentElement.lang).toBe('fr');
		});

		it('uses the device language when the saved language is not shipped', async () => {
			localStorage.setItem('_language', 'de-DE');
			deviceLanguageIs('es');

			await expectEveryLoadOrderToEndIn('es-ES');
		});
	});

	describe('without a saved language', () => {
		it("starts in he-IL for every load order when the device language is 'he'", async () => {
			deviceLanguageIs('he');

			await expectEveryLoadOrderToEndIn('he-IL');
		});

		it('sets the page right to left when it starts in he-IL', async () => {
			deviceLanguageIs('he');

			await startApp();

			expect(document.documentElement.dir).toBe('rtl');
			expect(document.documentElement.lang).toBe('he');
		});

		it('starts in DEFAULT_LANGUAGE for every load order when the device language is not shipped', async () => {
			environment.DEFAULT_LANGUAGE = 'es-ES';
			deviceLanguageIs('ja');

			await expectEveryLoadOrderToEndIn('es-ES');
		});

		it('starts in en-US when neither the device language nor DEFAULT_LANGUAGE is shipped', async () => {
			environment.DEFAULT_LANGUAGE = 'de-DE';
			deviceLanguageIs('ja');

			await expectEveryLoadOrderToEndIn('en-US');
		});
	});

	describe('on a phone', () => {
		beforeEach(() => {
			cordova = true;
		});

		it("maps the phone language 'he-IL' to he-IL", async () => {
			spyOn(Globalization, 'getPreferredLanguage').and.resolveTo({
				value: 'he-IL',
			});

			await expectEveryLoadOrderToEndIn('he-IL');
		});

		it('starts in DEFAULT_LANGUAGE when the phone language cannot be read', async () => {
			environment.DEFAULT_LANGUAGE = 'bg-BG';
			spyOn(Globalization, 'getPreferredLanguage').and.rejectWith({
				error: 'plugin_not_installed',
			});

			await expectEveryLoadOrderToEndIn('bg-BG');
		});

		it('saves a new device with the phone language once it is read', async () => {
			deviceId.and.returnValue(null);
			spyOnProperty(Store.prototype, 'deviceId', 'set');
			// No push plugin in the test.
			spyOn(console, 'error');
			let answer = (language: { value: string }) => {};
			spyOn(Globalization, 'getPreferredLanguage').and.returnValue(
				new Promise((resolve) => (answer = resolve))
			);

			await startApp();
			const deviceRouter = TestBed.inject(DeviceRouter);

			expect(deviceRouter.create).not.toHaveBeenCalled();

			answer({ value: 'he-IL' });
			await settle();

			expect(deviceRouter.create).toHaveBeenCalledOnceWith(
				jasmine.objectContaining({ language: 'he-IL' })
			);
		});
	});
});
