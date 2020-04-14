import 'jasmine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacyPage } from './privacy.page';

describe('PrivacyPage', () => {
	let component: PrivacyPage;
	let fixture: ComponentFixture<PrivacyPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PrivacyPage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PrivacyPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
