import 'jasmine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CancelPage } from './cancel.page';

describe('CancelPage', () => {
	let component: CancelPage;
	let fixture: ComponentFixture<CancelPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CancelPage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CancelPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
