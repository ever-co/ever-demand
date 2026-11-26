import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
	ModalController,
	NavController,
	NavParams,
	PopoverController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { BehaviorSubject, NEVER, of } from 'rxjs';
import { vi } from 'vitest';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import { environment } from 'environments/environment';
import { Store } from 'app/services/store.service';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';
import { DeliveryStatus, OrderPage } from './order.page';
import { CancelPage } from './+cancel/cancel.page';
import { IssuePage } from './issue/issue.page';
import { ElapsedTimeComponent } from 'app/components/elapsed-time/elapsed-time.component';

// Lets every pending promise callback run.
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

const anOrder = (fields: Record<string, unknown> = {}) =>
	({
		id: 'order-1',
		isPaid: false,
		isCancelled: false,
		isCompleted: false,
		carrierStatus: OrderCarrierStatus.NoCarrier,
		warehouseStatus: OrderWarehouseStatus.NoStatus,
		totalPrice: 12.5,
		products: [
			{ deliveryTimeMin: 10, deliveryTimeMax: 20 },
			{ deliveryTimeMin: 15, deliveryTimeMax: 40 },
		],
		...fields,
	}) as any;

describe('order tracking (OrderPage, delivery)', () => {
	let order$: BehaviorSubject<any>;
	let warehouseOrdersRouter;
	let orderRouter;
	let modalController;
	let store: any;
	let modalChange: EventEmitter<boolean>;

	const createPage = async () => {
		await TestBed.configureTestingModule({
			// The page reads the elapsed time component when the customer step ends.
			declarations: [OrderPage, ElapsedTimeComponent],
			imports: [...translateTesting()],
			providers: [
				{ provide: PopoverController, useValue: {} },
				{ provide: OrderRouter, useValue: orderRouter },
				{
					provide: WarehouseOrdersRouter,
					useValue: warehouseOrdersRouter,
				},
				{
					provide: WarehouseRouter,
					useValue: createSpyObj('WarehouseRouter', {
						get: of({ isPaymentEnabled: false }),
					}),
				},
				{ provide: Store, useValue: store },
				{
					provide: NavParams,
					useValue: {
						get: (key: string) =>
							key === 'modalChange' ? modalChange : undefined,
					},
				},
				{ provide: ModalController, useValue: modalController },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		const fixture = TestBed.createComponent(OrderPage);
		fixture.detectChanges();
		return fixture;
	};

	beforeEach(() => {
		order$ = new BehaviorSubject(anOrder());
		orderRouter = createSpyObj('OrderRouter', ['get', 'refundWithStripe']);
		orderRouter.get.mockReturnValue(order$);
		warehouseOrdersRouter = createSpyObj('WarehouseOrdersRouter', [
			'cancel',
		]);
		modalController = createSpyObj('ModalController', {
			create: Promise.resolve({ present: () => Promise.resolve() }),
			dismiss: Promise.resolve(true),
		});
		modalChange = new EventEmitter<boolean>();
		vi.spyOn(modalChange, 'emit');
		store = {
			orderId: 'order-1',
			orderWarehouseId: 'warehouse-1',
			startOrderDate: '"2026-01-01T00:00:00Z"',
		};
	});

	it('follows the live order with its warehouse and carrier', async () => {
		await createPage();

		expect(orderRouter.get).toHaveBeenCalledWith('order-1', {
			populateWarehouse: true,
			populateCarrier: true,
		});
	});

	it('hides the payment when the merchant has payments off', async () => {
		const fixture = await createPage();
		expect(fixture.componentInstance.paymentsEnabled).toBe(false);
	});

	it.each([
		[{}, DeliveryStatus.Warehouse],
		[
			{ carrierStatus: OrderCarrierStatus.CarrierPickedUpOrder },
			DeliveryStatus.Carrier,
		],
		[
			{ carrierStatus: OrderCarrierStatus.CarrierArrivedToCustomer },
			DeliveryStatus.Customer,
		],
		[{ isCompleted: true }, DeliveryStatus.Completed],
	])('shows step %j as %s', async (fields, step) => {
		const fixture = await createPage();

		// The socket pushes the update after the page rendered.
		order$.next(anOrder(fields));
		fixture.detectChanges();

		expect(fixture.componentInstance.currentStatus).toBe(step);
	});

	it('shows the slowest product times as the delivery time range', async () => {
		const page = (await createPage()).componentInstance;
		expect(page.deliveryTimeRange).toBe('15-40');

		page.order = anOrder({ products: [{ deliveryTimeMin: 5 }] });
		expect(page.deliveryTimeRange).toBe('5');

		page.order = anOrder({ products: [{}] });
		expect(page.deliveryTimeRange).toBe('30-60');
	});

	it('reads the status texts of the current step and fills in time and price', async () => {
		const page = (await createPage()).componentInstance;

		// TranslateModule.forRoot() without translations returns the keys.
		expect(page.byPopupStatuses).toEqual({
			TITLE: 'BUY_POPUP.STATUSES.0.TITLE',
			DETAILS: 'BUY_POPUP.STATUSES.0.DETAILS',
			NOT_PAID_NOTE: 'BUY_POPUP.STATUSES.0.NOT_PAID_NOTE',
		});

		page.order = anOrder({ isCancelled: true });
		expect(page.byPopupStatuses.TITLE).toBe(
			'BUY_POPUP.CANCEL.STATUSES.0.TITLE',
		);
	});

	it('flags delivery and warehouse issues', async () => {
		const page = (await createPage()).componentInstance;
		expect(page.areIssues).toBe(false);

		page.order = anOrder({
			carrierStatus: OrderCarrierStatus.IssuesDuringDelivery,
		});
		expect(page.areIssuesDuringDelivery).toBe(true);

		page.order = anOrder({
			warehouseStatus: OrderWarehouseStatus.AllocationFailed,
		});
		expect(page.areIssuesDuringWarehouseProcessing).toBe(true);
		expect(page.areIssues).toBe(true);
	});

	it('cancels and refunds a paid order with issues when the customer closes it', async () => {
		const page = (await createPage()).componentInstance;
		page.order = anOrder({
			warehouseStatus: OrderWarehouseStatus.AllocationFailed,
		});
		warehouseOrdersRouter.cancel.mockResolvedValue(
			anOrder({ isPaid: true, isCancelled: true }),
		);
		localStorage.setItem('startDate', '"x"');

		await page.closePopup();

		expect(modalChange.emit).toHaveBeenCalledWith(false);
		expect(warehouseOrdersRouter.cancel).toHaveBeenCalledWith('order-1');
		expect(orderRouter.refundWithStripe).toHaveBeenCalledWith('order-1');
		expect(store.orderId).toBeNull();
		expect(localStorage.getItem('startDate')).toBeNull();
		expect(modalController.dismiss).toHaveBeenCalled();
	});

	it('only forgets a completed order without issues', async () => {
		const page = (await createPage()).componentInstance;
		page.order = anOrder({ isCompleted: true });

		await page.closePopup();

		expect(warehouseOrdersRouter.cancel).not.toHaveBeenCalled();
		expect(store.orderId).toBeNull();
	});

	it('opens the cancel popup on Undo', async () => {
		const page = (await createPage()).componentInstance;

		page.undo();
		await settle();

		expect(modalController.dismiss).toHaveBeenCalled();
		expect(modalController.create).toHaveBeenCalledWith(
			expect.objectContaining({ component: CancelPage }),
		);
	});
});

describe('CancelPage', () => {
	let warehouseOrdersRouter;
	let orderRouter;
	let modalController;
	let navController;
	let store: any;
	const orderInfoType = environment.ORDER_INFO_TYPE;

	const createPage = async () => {
		await TestBed.configureTestingModule({
			declarations: [CancelPage],
			imports: [...translateTesting()],
			providers: [
				{ provide: PopoverController, useValue: {} },
				{
					provide: WarehouseOrdersRouter,
					useValue: warehouseOrdersRouter,
				},
				{ provide: OrderRouter, useValue: orderRouter },
				{ provide: Store, useValue: store },
				{ provide: ModalController, useValue: modalController },
				{ provide: NavController, useValue: navController },
				{ provide: Router, useValue: {} },
				{ provide: NavParams, useValue: { get: () => undefined } },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		return TestBed.createComponent(CancelPage).componentInstance;
	};

	beforeEach(() => {
		warehouseOrdersRouter = createSpyObj('WarehouseOrdersRouter', [
			'cancel',
		]);
		orderRouter = createSpyObj('OrderRouter', ['refundWithStripe']);
		modalController = createSpyObj('ModalController', {
			create: Promise.resolve({ present: () => Promise.resolve() }),
			dismiss: Promise.resolve(true),
		});
		navController = createSpyObj('NavController', ['navigateRoot']);
		store = { orderId: 'order-1', deliveryType: DeliveryType.Delivery };
	});

	afterEach(() => {
		environment.ORDER_INFO_TYPE = orderInfoType;
	});

	it('cancels an unpaid order without a refund and goes back to the products', async () => {
		environment.ORDER_INFO_TYPE = 'page';
		warehouseOrdersRouter.cancel.mockResolvedValue(anOrder());
		const page = await createPage();

		await page.closePopup();

		expect(warehouseOrdersRouter.cancel).toHaveBeenCalledWith('order-1');
		expect(orderRouter.refundWithStripe).not.toHaveBeenCalled();
		expect(store.orderId).toBeNull();
		expect(navController.navigateRoot).toHaveBeenCalledWith('/products');
		expect(modalController.dismiss).toHaveBeenCalled();
	});

	it('refunds a paid order it cancels', async () => {
		warehouseOrdersRouter.cancel.mockResolvedValue(
			anOrder({ isPaid: true }),
		);
		const page = await createPage();

		await page.closePopup();

		expect(orderRouter.refundWithStripe).toHaveBeenCalledWith('order-1');
	});

	it('reopens the order popup on Back in popup mode', async () => {
		environment.ORDER_INFO_TYPE = 'popup';
		const page = await createPage();

		await page.showOrderInfo();
		await settle();

		expect(modalController.create).toHaveBeenCalledWith(
			expect.objectContaining({ component: OrderPage }),
		);
		expect(warehouseOrdersRouter.cancel).not.toHaveBeenCalled();
	});
});

describe('IssuePage', () => {
	it('cancels the order, refunds it when paid and goes back to the products', async () => {
		const warehouseOrdersRouter = createSpyObj('WarehouseOrdersRouter', {
			cancel: Promise.resolve(anOrder()),
		});
		const orderRouter = createSpyObj('OrderRouter', {
			refundWithStripe: Promise.resolve(anOrder()),
		});
		const navController = createSpyObj('NavController', ['navigateRoot']);
		const modalController = createSpyObj('ModalController', {
			dismiss: Promise.resolve(true),
		});
		const store: any = { orderId: 'order-1' };
		const props = {
			order: anOrder({ id: 'order-7', isPaid: true }),
			areIssuesDuringDelivery: true,
			areIssuesDuringWarehouseProcessing: false,
			modalChange: NEVER,
		};

		await TestBed.configureTestingModule({
			declarations: [IssuePage],
			imports: [...translateTesting()],
			providers: [
				{ provide: NavParams, useValue: { get: (key) => props[key] } },
				{ provide: OrderRouter, useValue: orderRouter },
				{
					provide: WarehouseOrdersRouter,
					useValue: warehouseOrdersRouter,
				},
				{ provide: Store, useValue: store },
				{ provide: Router, useValue: {} },
				{ provide: NavController, useValue: navController },
				{ provide: ModalController, useValue: modalController },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		const page = TestBed.createComponent(IssuePage).componentInstance;

		expect(page.areIssuesDuringDelivery).toBe(true);
		await page.closePopup();

		expect(warehouseOrdersRouter.cancel).toHaveBeenCalledWith('order-7');
		expect(orderRouter.refundWithStripe).toHaveBeenCalledWith('order-7');
		expect(store.orderId).toBeNull();
		expect(navController.navigateRoot).toHaveBeenCalledWith('/products');
	});
});
