import 'jasmine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ConnectionLostPage } from './connection-lost.page';

describe('ConnectionLostPage', () => {
	let component: ConnectionLostPage;
	let fixture: ComponentFixture<ConnectionLostPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ConnectionLostPage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ConnectionLostPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
