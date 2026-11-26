import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { AppComponent } from './app.component';
import { AppState } from './app.service';
import { Store } from './services/store';

describe(`App`, () => {
	let comp: AppComponent;
	let fixture: ComponentFixture<AppComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot()],
			declarations: [AppComponent],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [AppState, { provide: Store, useValue: {} }],
		}).compileComponents();

		fixture = TestBed.createComponent(AppComponent);
		comp = fixture.componentInstance;
		fixture.detectChanges();
	});

	it(`should be readly initialized`, () => {
		expect(fixture).toBeDefined();
		expect(comp).toBeDefined();
	});

	it('should log ngOnInit', () => {
		const log = vi.spyOn(console, 'log').mockImplementation(() => {});
		expect(log).not.toHaveBeenCalled();

		comp.ngOnInit();
		expect(log).toHaveBeenCalled();
		log.mockRestore();
	});

	it('hides the toolbar while there is no routed page', () => {
		expect(comp.isToolbarDisabled).toBe(true);
	});
});

describe('App on the first visit', () => {
	const root = document.documentElement;
	let initialDir: string;
	let initialLang: string;

	beforeEach(async () => {
		initialDir = root.dir;
		initialLang = root.lang;

		await TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot()],
			declarations: [AppComponent],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [AppState, { provide: Store, useValue: {} }],
		}).compileComponents();
	});

	afterEach(() => {
		root.dir = initialDir;
		root.lang = initialLang;
	});

	it('shows the shop in he-IL, right to left, for a Hebrew browser', () => {
		const translate = TestBed.inject(TranslateService);
		vi.spyOn(translate, 'getBrowserCultureLang').mockReturnValue('he-IL');
		vi.spyOn(translate, 'getBrowserLang').mockReturnValue('he');

		TestBed.createComponent(AppComponent);

		expect(translate.getCurrentLang()).toBe('he-IL');
		expect(translate.getFallbackLang()).toBe('en-US');
		expect(root.dir).toBe('rtl');
		expect(root.lang).toBe('he');
		expect(translate.getLangs()).toContain('fr-FR');
	});

	it('shows the shop in fr-FR, left to right, for a Canadian French browser', () => {
		const translate = TestBed.inject(TranslateService);
		vi.spyOn(translate, 'getBrowserCultureLang').mockReturnValue('fr-CA');
		vi.spyOn(translate, 'getBrowserLang').mockReturnValue('fr');

		TestBed.createComponent(AppComponent);

		expect(translate.getCurrentLang()).toBe('fr-FR');
		expect(root.dir).toBe('ltr');
		expect(root.lang).toBe('fr');
	});

	it('falls back to en-US for a language the shop has no catalogue for', () => {
		const translate = TestBed.inject(TranslateService);
		vi.spyOn(translate, 'getBrowserCultureLang').mockReturnValue('de-DE');
		vi.spyOn(translate, 'getBrowserLang').mockReturnValue('de');

		TestBed.createComponent(AppComponent);

		expect(translate.getCurrentLang()).toBe('en-US');
		expect(root.dir).toBe('ltr');
		expect(root.lang).toBe('en');
	});

	it('keeps the language already in use (no browser detection)', () => {
		const translate = TestBed.inject(TranslateService);
		translate.use('ru-RU');
		const culture = vi.spyOn(translate, 'getBrowserCultureLang');

		TestBed.createComponent(AppComponent);

		expect(culture).not.toHaveBeenCalled();
		expect(translate.getCurrentLang()).toBe('ru-RU');
		expect(translate.getFallbackLang()).toBe('ru-RU');
	});
});
