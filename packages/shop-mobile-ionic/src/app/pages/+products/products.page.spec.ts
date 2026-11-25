import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
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

describe('ProductsPage', () => {
	let component: ProductsPage;
	let fixture: ComponentFixture<ProductsPage>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [ProductsPage],
				imports: [TranslateModule.forRoot()],
				providers: [
					// No user, no store mode, no pending order and nothing to buy.
					{ provide: Store, useValue: { language: 'en-US' } },
					{
						provide: UserRouter,
						useValue: jasmine.createSpyObj('UserRouter', ['get']),
					},
					{
						provide: GeoLocationProductsService,
						useValue: jasmine.createSpyObj(
							'GeoLocationProductsService',
							[
								'geoLocationProductsByPaging',
								'getCountOfGeoLocationProducts',
							]
						),
					},
					{
						provide: WarehouseOrdersRouter,
						useValue: jasmine.createSpyObj(
							'WarehouseOrdersRouter',
							['create']
						),
					},
					{
						provide: UserProductsRouter,
						useValue: jasmine.createSpyObj('UserProductsRouter', [
							'getPlaceholder',
						]),
					},
					{
						provide: Router,
						useValue: jasmine.createSpyObj('Router', [
							'navigate',
							'navigateByUrl',
						]),
					},
					{
						provide: ModalController,
						useValue: jasmine.createSpyObj('ModalController', [
							'create',
						]),
					},
					// The location never resolves, so no products load.
					{
						provide: GeoLocationService,
						useValue: jasmine.createSpyObj('GeoLocationService', {
							getCurrentGeoLocation: new Promise(() => {}),
						}),
					},
					{
						provide: WarehouseRouter,
						useValue: jasmine.createSpyObj('WarehouseRouter', [
							'get',
						]),
					},
					{
						provide: OrderRouter,
						useValue: jasmine.createSpyObj('OrderRouter', ['get']),
					},
					{
						provide: NavController,
						useValue: jasmine.createSpyObj('NavController', [
							'navigateRoot',
						]),
					},
					{
						provide: WarehouseProductsService,
						useValue: jasmine.createSpyObj(
							'WarehouseProductsService',
							['getWarehouseProduct']
						),
					},
					{
						provide: OrdersService,
						useValue: jasmine.createSpyObj('OrdersService', [
							'getOrder',
						]),
					},
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(ProductsPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
