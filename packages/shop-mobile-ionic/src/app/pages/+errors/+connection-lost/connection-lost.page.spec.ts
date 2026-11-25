import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConnectionLostPage } from './connection-lost.page';
import { translateTesting } from 'app/testing/translate';

describe('ConnectionLostPage', () => {
	let component: ConnectionLostPage;
	let fixture: ComponentFixture<ConnectionLostPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConnectionLostPage],
			imports: [...translateTesting()],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConnectionLostPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
