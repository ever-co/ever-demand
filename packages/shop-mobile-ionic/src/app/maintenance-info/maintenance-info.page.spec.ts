import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceInfoPage } from './maintenance-info.page';

describe('MaintenanceInfoPage', () => {
	let component: MaintenanceInfoPage;
	let fixture: ComponentFixture<MaintenanceInfoPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MaintenanceInfoPage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MaintenanceInfoPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
