import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular/lazy';
import { Store } from '../../services/store.service';
import { LanguagePage } from './language.page';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('LanguagePage', () => {
	let component: LanguagePage;
	let fixture: ComponentFixture<LanguagePage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [LanguagePage],
			imports: [...translateTesting()],
			providers: [
				{ provide: Store, useValue: { language: 'en-US' } },
				{
					provide: Location,
					useValue: createSpyObj('Location', ['back']),
				},
				{ provide: Platform, useValue: { isRTL: false } },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LanguagePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
