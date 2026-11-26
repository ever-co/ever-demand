import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { UserProductsRouter } from '@modules/client.common.angular2/routers/user-products-router.service';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { GeoLocationProductsService } from 'app/services/geo-location/geo-location-products';
import { WarehouseProductsService } from 'app/services/merchants/warehouse-products';
import { OrdersService } from 'app/services/orders/orders.service';
import { GeoLocationService } from '../../services/geo-location';
import { Store } from '../../services/store.service';
import { ProductsPage } from './products.page';
import { NEVER } from 'rxjs';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('ProductsPage resuming a Buy after registration', () => {
	let store: any;
	let warehouseProducts;
	let warehouseOrdersRouter;
	let navController;

	beforeEach(async () => {
		store = {
			language: 'en-US',
			userId: 'user-1',
			buyProduct: 'wp-1',
			warehouseId: 'warehouse-1',
			deliveryType: 0,
			orderId: null,
		};
		warehouseProducts = createSpyObj('WarehouseProductsService', {
			getWarehouseProduct: Promise.resolve({
				id: 'wp-1',
				product: { id: 'product-1' },
			}),
		});
		warehouseOrdersRouter = createSpyObj('WarehouseOrdersRouter', {
			create: Promise.resolve({
				id: 'order-1',
				warehouseId: 'warehouse-1',
			}),
		});
		navController = createSpyObj('NavController', ['navigateRoot']);

		await TestBed.configureTestingModule({
			declarations: [ProductsPage],
			imports: [...translateTesting()],
			providers: [
				{ provide: Store, useValue: store },
				{
					provide: UserRouter,
					useValue: createSpyObj('UserRouter', ['get']),
				},
				{
					provide: GeoLocationProductsService,
					useValue: createSpyObj('GeoLocationProductsService', [
						'geoLocationProductsByPaging',
						'getCountOfGeoLocationProducts',
					]),
				},
				{
					provide: WarehouseOrdersRouter,
					useValue: warehouseOrdersRouter,
				},
				{
					provide: UserProductsRouter,
					useValue: createSpyObj('UserProductsRouter', {
						getPlaceholder: NEVER,
					}),
				},
				{
					provide: Router,
					useValue: createSpyObj('Router', [
						'navigate',
						'navigateByUrl',
					]),
				},
				{
					provide: ModalController,
					useValue: createSpyObj('ModalController', ['create']),
				},
				// The location never resolves, so no products load.
				{
					provide: GeoLocationService,
					useValue: createSpyObj('GeoLocationService', {
						getCurrentGeoLocation: new Promise(() => {}),
					}),
				},
				{
					provide: WarehouseRouter,
					useValue: createSpyObj('WarehouseRouter', ['get']),
				},
				{
					provide: OrderRouter,
					useValue: createSpyObj('OrderRouter', ['get']),
				},
				{ provide: NavController, useValue: navController },
				{
					provide: WarehouseProductsService,
					useValue: warehouseProducts,
				},
				{
					provide: OrdersService,
					useValue: createSpyObj('OrdersService', ['getOrder']),
				},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	it('buys the product the customer tapped before registering, when the page shows again', async () => {
		const page = TestBed.createComponent(ProductsPage).componentInstance;

		// Ionic reuses the page: only the view lifecycle hook runs again.
		page.ionViewWillEnter();
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(warehouseProducts.getWarehouseProduct).toHaveBeenCalledWith(
			'warehouse-1',
			'wp-1',
		);
		expect(warehouseOrdersRouter.create).toHaveBeenCalledWith(
			expect.objectContaining({
				warehouseId: 'warehouse-1',
				userId: 'user-1',
				products: [{ count: 1, productId: 'product-1' }],
				options: { autoConfirm: true },
			}),
		);
		expect(store.buyProduct).toBe('');
		expect(store.warehouseId).toBe('');
		expect(store.orderId).toBe('order-1');
	});

	it('does nothing without a pending Buy', async () => {
		store.buyProduct = '';
		const page = TestBed.createComponent(ProductsPage).componentInstance;

		page.ionViewWillEnter();
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(warehouseProducts.getWarehouseProduct).not.toHaveBeenCalled();
		expect(warehouseOrdersRouter.create).not.toHaveBeenCalled();
	});
});
