import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuController } from '@ionic/angular/lazy';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { Store } from '../../services/store.service';
import { MenuComponent } from './menu.component';
import { MenuModule } from './menu.module';

describe('MenuComponent', () => {
	let menuCtrl: { enable: ReturnType<typeof vi.fn> };
	let store: { showInformationPage: boolean };

	beforeEach(async () => {
		menuCtrl = { enable: vi.fn() };
		store = { showInformationPage: false };

		await TestBed.configureTestingModule({
			// no loader: the translations are set in memory below
			imports: [MenuModule, TranslateModule.forRoot()],
			providers: [
				provideRouter([]),
				{ provide: Store, useValue: store },
				{ provide: MenuController, useValue: menuCtrl },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		const translate = TestBed.inject(TranslateService);
		translate.setTranslation('en', {
			MENU: {
				MAIN: 'Main',
				DELIVERIES: 'Deliveries',
				SETTINGS: 'Settings',
				LANGUAGE: 'Language',
				ABOUT_US: 'About us',
				TERMS_OF_USE: 'Terms of use',
			},
		});
		translate.use('en');
	});

	it('lists the carrier pages with translated labels', () => {
		const fixture = TestBed.createComponent(MenuComponent);
		fixture.detectChanges();

		const text = (fixture.nativeElement as HTMLElement).textContent;
		for (const label of [
			'Main',
			'Deliveries',
			'Language',
			'About us',
			'Terms of use',
		]) {
			expect(text).toContain(label);
		}
		const links = Array.from(
			(fixture.nativeElement as HTMLElement).querySelectorAll('ion-item[routerLink]')
		).map((i) => i.getAttribute('routerLink'));
		// one menu for left-to-right and one for right-to-left languages
		expect(links.length).toBe(10);
		expect(links.slice(0, 5)).toEqual([
			'/main',
			'/deliveries',
			'/language',
			'/information/about',
			'/information/terms-of-use',
		]);
	});

	it('enables the right-to-left menu for Hebrew', () => {
		TestBed.createComponent(MenuComponent);
		const translate = TestBed.inject(TranslateService);

		translate.setTranslation('he', {});
		translate.use('he');
		expect(menuCtrl.enable).toHaveBeenCalledWith(true, 'rtl');
		expect(menuCtrl.enable).toHaveBeenCalledWith(false, 'ltr');

		translate.use('en');
		expect(menuCtrl.enable).toHaveBeenCalledWith(true, 'ltr');
	});
});
