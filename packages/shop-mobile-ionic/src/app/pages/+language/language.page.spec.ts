import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular/lazy';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { Store } from '../../services/store.service';
import { LanguagePage } from './language.page';

describe('LanguagePage', () => {
	let component: LanguagePage;
	let fixture: ComponentFixture<LanguagePage>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [LanguagePage],
				imports: [TranslateModule.forRoot()],
				providers: [
					{ provide: Store, useValue: { language: 'en-US' } },
					{
						provide: Location,
						useValue: jasmine.createSpyObj('Location', ['back']),
					},
					{ provide: Platform, useValue: { isRTL: false } },
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(LanguagePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
