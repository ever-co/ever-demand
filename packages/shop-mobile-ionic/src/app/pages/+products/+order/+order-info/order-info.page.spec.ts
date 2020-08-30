import 'jasmine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderInfoPage } from './order-info.page';

describe('OrderInfoPage', () => {
	let component: OrderInfoPage;
	let fixture: ComponentFixture<OrderInfoPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OrderInfoPage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OrderInfoPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
