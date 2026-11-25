import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController, NavParams, PopoverController } from '@ionic/angular/lazy';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { NEVER } from 'rxjs';
import { Store } from '../../../services/store.service';
import { OrderPage } from './order.page';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('OrderPage', () => {
	let component: OrderPage;
	let fixture: ComponentFixture<OrderPage>;

	beforeEach(async () => {
			await TestBed.configureTestingModule({
				declarations: [OrderPage],
				imports: [...translateTesting()],
				providers: [
					{
						provide: PopoverController,
						useValue: createSpyObj('PopoverController', [
							'dismiss',
						]),
					},
					// The order and the warehouse never load.
					{
						provide: OrderRouter,
						useValue: createSpyObj('OrderRouter', {
							get: NEVER,
						}),
					},
					{
						provide: WarehouseOrdersRouter,
						useValue: createSpyObj(
							'WarehouseOrdersRouter',
							['cancel']
						),
					},
					{
						provide: WarehouseRouter,
						useValue: createSpyObj('WarehouseRouter', {
							get: NEVER,
						}),
					},
					{
						provide: Store,
						useValue: { startOrderDate: '"2026-01-01T00:00:00Z"' },
					},
					{
						provide: NavParams,
						useValue: createSpyObj('NavParams', {
							get: undefined,
						}),
					},
					{
						provide: ModalController,
						useValue: createSpyObj('ModalController', [
							'create',
							'dismiss',
						]),
					},
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(OrderPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
