import 'jasmine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguagePage } from './language.page';

describe('LanguagePage', () => {
	let component: LanguagePage;
	let fixture: ComponentFixture<LanguagePage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LanguagePage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LanguagePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
