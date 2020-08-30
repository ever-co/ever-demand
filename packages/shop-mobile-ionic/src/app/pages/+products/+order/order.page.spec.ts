import 'jasmine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderPage } from './order.page';

describe('OrderPage', () => {
	let component: OrderPage;
	let fixture: ComponentFixture<OrderPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OrderPage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OrderPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
