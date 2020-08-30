import 'jasmine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdersHistoryPage } from './orders-history.page';

describe('OrdersHistoryPage', () => {
	let component: OrdersHistoryPage;
	let fixture: ComponentFixture<OrdersHistoryPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OrdersHistoryPage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OrdersHistoryPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
