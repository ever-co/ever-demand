import 'jasmine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TermsOfUsePage } from './terms-of-use.page';

describe('TermsOfUsePage', () => {
	let component: TermsOfUsePage;
	let fixture: ComponentFixture<TermsOfUsePage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TermsOfUsePage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TermsOfUsePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
