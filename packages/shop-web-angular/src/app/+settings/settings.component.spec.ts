import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { SettingsComponent } from './settings.component';
import { SettingsModule } from './settings.module';

describe('SettingsComponent', () => {
	const root = document.documentElement;
	let initialDir: string;
	let initialLang: string;

	beforeEach(async () => {
		initialDir = root.dir;
		initialLang = root.lang;

		await TestBed.configureTestingModule({
			imports: [SettingsModule, TranslateModule.forRoot()],
			providers: [provideRouter([])],
		}).compileComponents();
	});

	afterEach(() => {
		root.dir = initialDir;
		root.lang = initialLang;
	});

	it('selects the language in use', () => {
		const translate = TestBed.inject(TranslateService);
		translate.use('bg-BG');

		const settings = TestBed.createComponent(SettingsComponent)
			.componentInstance;

		expect(settings.selectedLang).toBe('bg-BG');
	});

	it('offers every shop language when none is set yet', () => {
		const settings = TestBed.createComponent(SettingsComponent)
			.componentInstance;
		const translate = TestBed.inject(TranslateService);

		expect(translate.getLangs()).toEqual([
			'en-US',
			'es-ES',
			'bg-BG',
			'he-IL',
			'ru-RU',
			'fr-FR',
		]);
		expect(settings.selectedLang).toBe(translate.getCurrentLang());
	});

	it('switches to Hebrew right to left, and back left to right', () => {
		const settings = TestBed.createComponent(SettingsComponent)
			.componentInstance;
		const translate = TestBed.inject(TranslateService);

		settings.switchLanguage('he-IL');
		expect(translate.getCurrentLang()).toBe('he-IL');
		expect(root.dir).toBe('rtl');
		expect(root.lang).toBe('he');

		settings.switchLanguage('es-ES');
		expect(translate.getCurrentLang()).toBe('es-ES');
		expect(root.dir).toBe('ltr');
		expect(root.lang).toBe('es');
	});
});
