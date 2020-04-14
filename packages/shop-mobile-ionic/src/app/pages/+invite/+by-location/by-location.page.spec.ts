import 'jasmine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ByLocationPage } from './by-location.page';

describe('ByLocationPage', () => {
	let component: ByLocationPage;
	let fixture: ComponentFixture<ByLocationPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ByLocationPage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ByLocationPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
