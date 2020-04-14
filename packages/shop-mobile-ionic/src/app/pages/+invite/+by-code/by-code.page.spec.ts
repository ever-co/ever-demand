import 'jasmine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ByCodePage } from './by-code.page';

describe('ByCodePage', () => {
	let component: ByCodePage;
	let fixture: ComponentFixture<ByCodePage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ByCodePage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ByCodePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
