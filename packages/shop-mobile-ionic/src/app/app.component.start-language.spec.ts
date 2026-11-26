import { createSpyObj } from 'app/testing/spies';
import { vi, type Mock } from 'vitest';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import {
	TranslateDirective,
	TranslateLoader,
	TranslatePipe,
	TranslateService,
} from '@ngx-translate/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { NativeService } from './services/native/native.service';
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

// The real Store.deviceId accessor: some specs spy its getter and its setter, and
// restoring both spies does not reliably put the original descriptor back.
const deviceIdDescriptor = Object.getOwnPropertyDescriptor(
	Store.prototype,
	'deviceId'
)!;

describe('AppComponent start language', () => {
	let cordova: boolean;
	let savedLanguage: string | null;
	let savedDir: string;
	let savedLang: string;
	let savedDefaultLanguage: string;
	let deviceId: Mock;
	// The phone language the Capacitor Device plugin answers (a two-letter code).
	let languageCode: Mock;

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
				TranslatePipe,
				TranslateDirective,
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
					provide: NativeService,
					useValue: {
						isNative: () => cordova,
						platform: () => 'android',
						deviceId: () => Promise.resolve('uuid-1'),
						languageCode,
						networkStatus: () =>
							Promise.resolve({ connected: true, connectionType: 'wifi' }),
						onNetworkStatusChange: () =>
							Promise.resolve({ remove: () => Promise.resolve() }),
						useDarkStatusBar: () => Promise.resolve(),
						hideSplashScreen: () => Promise.resolve(),
					},
				},
				{
					provide: Router,
					useValue: createSpyObj('Router', ['navigate']),
				},
				{
					provide: DeviceRouter,
					useValue: createSpyObj('DeviceRouter', {
						create: Promise.resolve({ id: 'device-2' }),
					}),
				},
				{
					provide: Location,
					useValue: createSpyObj('Location', ['back']),
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
				language: translate.getCurrentLang(),
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
				expect.fail(
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
		vi.spyOn(TranslateService.prototype, 'getBrowserLang').mockReturnValue(
			language
		);

	beforeEach(() => {
		cordova = false;
		languageCode = vi.fn().mockResolvedValue('en');
		savedLanguage = localStorage.getItem('_language');
		localStorage.removeItem('_language');
		savedDir = document.documentElement.dir;
		savedLang = document.documentElement.lang;
		savedDefaultLanguage = environment.DEFAULT_LANGUAGE;
		environment.DEFAULT_LANGUAGE = 'en-US';

		// A known device id, so the app does not register a new device.
		deviceId = vi.spyOn(
			Store.prototype,
			'deviceId',
			'get'
		).mockReturnValue('device-1');
		vi.spyOn(console, 'warn');
	});

	afterEach(() => {
		// Jasmine restored spies after each spec; Vitest does not.
		vi.restoreAllMocks();
		Object.defineProperty(Store.prototype, 'deviceId', deviceIdDescriptor);
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

		it("maps the phone language 'he' to he-IL", async () => {
			languageCode.mockResolvedValue('he');

			await expectEveryLoadOrderToEndIn('he-IL');
		});

		it('starts in DEFAULT_LANGUAGE when the phone language cannot be read', async () => {
			environment.DEFAULT_LANGUAGE = 'bg-BG';
			languageCode.mockRejectedValue(new Error('not implemented'));

			await expectEveryLoadOrderToEndIn('bg-BG');
		});

		it('saves a new device with the phone language once it is read', async () => {
			deviceId.mockReturnValue(null);
			vi.spyOn(Store.prototype, 'deviceId', 'set');
			// No push plugin in the test.
			vi.spyOn(console, 'error');
			let answer = (language: string) => {};
			languageCode.mockReturnValue(
				new Promise<string>((resolve) => (answer = resolve))
			);

			await startApp();
			const deviceRouter = TestBed.inject(DeviceRouter);

			expect(deviceRouter.create).not.toHaveBeenCalled();

			answer('he');
			await settle();

			expect(deviceRouter.create).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({ language: 'he-IL' })
			);
		});
	});
});
