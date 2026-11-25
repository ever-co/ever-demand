import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
	ModalController,
	NavController,
	NavParams,
	PopoverController,
} from '@ionic/angular/lazy';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { Store } from '../../../../services/store.service';
import { CancelPage } from './cancel.page';

describe('CancelPage', () => {
	let component: CancelPage;
	let fixture: ComponentFixture<CancelPage>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [CancelPage],
				imports: [TranslateModule.forRoot()],
				providers: [
					{
						provide: PopoverController,
						useValue: jasmine.createSpyObj('PopoverController', [
							'dismiss',
						]),
					},
					{
						provide: WarehouseOrdersRouter,
						useValue: jasmine.createSpyObj(
							'WarehouseOrdersRouter',
							['cancel']
						),
					},
					{
						provide: OrderRouter,
						useValue: jasmine.createSpyObj('OrderRouter', [
							'refundWithStripe',
						]),
					},
					{ provide: Store, useValue: { orderId: 'order-1' } },
					{
						provide: ModalController,
						useValue: jasmine.createSpyObj('ModalController', [
							'create',
							'dismiss',
						]),
					},
					{
						provide: NavController,
						useValue: jasmine.createSpyObj('NavController', [
							'navigateRoot',
						]),
					},
					{
						provide: Router,
						useValue: jasmine.createSpyObj('Router', ['navigate']),
					},
					{
						provide: NavParams,
						useValue: jasmine.createSpyObj('NavParams', {
							get: undefined,
						}),
					},
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(CancelPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
