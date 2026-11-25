import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController, NavParams, PopoverController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { NEVER } from 'rxjs';
import { Store } from '../../../services/store.service';
import { OrderPage } from './order.page';

describe('OrderPage', () => {
	let component: OrderPage;
	let fixture: ComponentFixture<OrderPage>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [OrderPage],
				imports: [TranslateModule.forRoot()],
				providers: [
					{
						provide: PopoverController,
						useValue: jasmine.createSpyObj('PopoverController', [
							'dismiss',
						]),
					},
					// The order and the warehouse never load.
					{
						provide: OrderRouter,
						useValue: jasmine.createSpyObj('OrderRouter', {
							get: NEVER,
						}),
					},
					{
						provide: WarehouseOrdersRouter,
						useValue: jasmine.createSpyObj(
							'WarehouseOrdersRouter',
							['cancel']
						),
					},
					{
						provide: WarehouseRouter,
						useValue: jasmine.createSpyObj('WarehouseRouter', {
							get: NEVER,
						}),
					},
					{
						provide: Store,
						useValue: { startOrderDate: '"2026-01-01T00:00:00Z"' },
					},
					{
						provide: NavParams,
						useValue: jasmine.createSpyObj('NavParams', {
							get: undefined,
						}),
					},
					{
						provide: ModalController,
						useValue: jasmine.createSpyObj('ModalController', [
							'create',
							'dismiss',
						]),
					},
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(OrderPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
