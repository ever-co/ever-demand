import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
	ModalController,
	NavController,
	NavParams,
	PopoverController,
} from '@ionic/angular/lazy';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { Store } from '../../../../services/store.service';
import { CancelPage } from './cancel.page';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('CancelPage', () => {
	let component: CancelPage;
	let fixture: ComponentFixture<CancelPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CancelPage],
			imports: [...translateTesting()],
			providers: [
				{
					provide: PopoverController,
					useValue: createSpyObj('PopoverController', ['dismiss']),
				},
				{
					provide: WarehouseOrdersRouter,
					useValue: createSpyObj('WarehouseOrdersRouter', ['cancel']),
				},
				{
					provide: OrderRouter,
					useValue: createSpyObj('OrderRouter', ['refundWithStripe']),
				},
				{ provide: Store, useValue: { orderId: 'order-1' } },
				{
					provide: ModalController,
					useValue: createSpyObj('ModalController', [
						'create',
						'dismiss',
					]),
				},
				{
					provide: NavController,
					useValue: createSpyObj('NavController', ['navigateRoot']),
				},
				{
					provide: Router,
					useValue: createSpyObj('Router', ['navigate']),
				},
				{
					provide: NavParams,
					useValue: createSpyObj('NavParams', {
						get: undefined,
					}),
				},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CancelPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
