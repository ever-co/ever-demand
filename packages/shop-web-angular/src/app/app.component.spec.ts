import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppComponent } from './app.component';
import { AppState } from './app.service';
import { Store } from './services/store';

describe(`App`, () => {
	let comp: AppComponent;
	let fixture: ComponentFixture<AppComponent>;

	/**
	 * async beforeEach
	 */
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot()],
			declarations: [AppComponent],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [AppState, { provide: Store, useValue: {} }],
		})
			/**
			 * Compile template and css
			 */
			.compileComponents();
	}));

	/**
	 * Synchronous beforeEach
	 */
	beforeEach(() => {
		fixture = TestBed.createComponent(AppComponent);
		comp = fixture.componentInstance;

		/**
		 * Trigger initial data binding
		 */
		fixture.detectChanges();
	});

	it(`should be readly initialized`, () => {
		expect(fixture).toBeDefined();
		expect(comp).toBeDefined();
	});

	it('should log ngOnInit', () => {
		spyOn(console, 'log');
		expect(console.log).not.toHaveBeenCalled();

		comp.ngOnInit();
		expect(console.log).toHaveBeenCalled();
	});
});

describe('App on the first visit with a Hebrew browser', () => {
	const root = document.documentElement;
	let initialDir: string;
	let initialLang: string;

	beforeEach(async(() => {
		initialDir = root.dir;
		initialLang = root.lang;

		TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot()],
			declarations: [AppComponent],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [AppState, { provide: Store, useValue: {} }],
		}).compileComponents();
	}));

	afterEach(() => {
		root.dir = initialDir;
		root.lang = initialLang;
	});

	it('shows the shop in he-IL, right to left', () => {
		const translate = TestBed.inject(TranslateService);
		spyOn(translate, 'getBrowserCultureLang').and.returnValue('he-IL');
		spyOn(translate, 'getBrowserLang').and.returnValue('he');

		TestBed.createComponent(AppComponent);

		expect(translate.currentLang).toBe('he-IL');
		expect(root.dir).toBe('rtl');
		expect(root.lang).toBe('he');
		expect(translate.getLangs()).toContain('fr-FR');
	});
});
