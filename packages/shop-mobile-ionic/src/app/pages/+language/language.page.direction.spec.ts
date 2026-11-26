import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import {
	TranslateLoader,
	TranslateModule,
	TranslateService,
} from '@ngx-translate/core';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import { Store } from '../../services/store.service';
import { settle } from '../../testing/fake-socket';
import { load, ManualLoader } from '../../testing/manual-loader';
import { LanguagePage } from './language.page';

// The app switches to a picked language only once its file arrives, so
// the page direction and language must not wait for the Store language.
describe('LanguagePage direction while the picked language file loads', () => {
	let savedLanguage: string | null;
	let savedDir: string;
	let savedLang: string;
	let loader: ManualLoader;
	let translate: TranslateService;

	// Starts the app in a saved language, with its file loaded, as the
	// customer sees it before opening the language page.
	const startIn = async (language: ILanguage) => {
		localStorage.setItem('_language', language);
		loader = new ManualLoader();

		await TestBed.configureTestingModule({
			declarations: [LanguagePage],
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
						is: () => false,
						isRTL: false,
						ready: () => Promise.resolve('ready'),
					},
				},
				{
					provide: DeviceRouter,
					useValue: jasmine.createSpyObj('DeviceRouter', {
						updateLanguage: Promise.resolve({ id: 'device-1' }),
					}),
				},
				{
					provide: Location,
					useValue: jasmine.createSpyObj('Location', ['back']),
				},
				{ provide: InviteRouter, useValue: {} },
				{ provide: UserRouter, useValue: {} },
			],
		}).compileComponents();

		const store = TestBed.inject(Store);
		translate = TestBed.inject(TranslateService);
		await store.startLanguage;
		loader.requests.forEach(load);
		await settle();

		expect(translate.currentLang).toBe(language);
	};

	// The customer picks a language whose file has not arrived yet.
	const pick = (language: ILanguage) => {
		TestBed.createComponent(LanguagePage).componentInstance.language =
			language;

		expect(translate.currentLang).not.toBe(language);
	};

	// The picked language file arrives.
	const loadPickedFile = async (language: ILanguage) => {
		loader.requests
			.filter((request) => request.language === language)
			.forEach(load);
		await settle();

		expect(translate.currentLang).toBe(language);
	};

	beforeEach(() => {
		savedLanguage = localStorage.getItem('_language');
		savedDir = document.documentElement.dir;
		savedLang = document.documentElement.lang;

		spyOnProperty(Store.prototype, 'deviceId', 'get').and.returnValue(
			'device-1'
		);
	});

	afterEach(() => {
		if (savedLanguage === null) {
			localStorage.removeItem('_language');
		} else {
			localStorage.setItem('_language', savedLanguage);
		}
		document.documentElement.dir = savedDir;
		document.documentElement.lang = savedLang;
	});

	// A language with the page direction and language it must give.
	interface Page {
		language: ILanguage;
		dir: 'ltr' | 'rtl';
		lang: string;
	}

	const english: Page = { language: 'en-US', dir: 'ltr', lang: 'en' };
	const hebrew: Page = { language: 'he-IL', dir: 'rtl', lang: 'he' };
	const french: Page = { language: 'fr-FR', dir: 'ltr', lang: 'fr' };

	const expectPageIn = (page: Page) => {
		expect(document.documentElement.dir).toBe(page.dir);
		expect(document.documentElement.lang).toBe(page.lang);
	};

	[
		{ start: english, picked: hebrew },
		{ start: hebrew, picked: french },
		{ start: english, picked: french },
	].forEach(({ start, picked }) => {
		it(`sets the page ${picked.dir} in ${picked.lang} when ${picked.language} is picked after ${start.language}, before its file loads`, async () => {
			await startIn(start.language);
			expectPageIn(start);

			pick(picked.language);
			expectPageIn(picked);

			await loadPickedFile(picked.language);
			expectPageIn(picked);
		});
	});
});
