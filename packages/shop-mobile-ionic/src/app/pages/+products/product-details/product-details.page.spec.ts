import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular/lazy';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { NEVER } from 'rxjs';
import { Store } from '../../../services/store.service';
import { ProductDetailsPage } from './product-details.page';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('ProductDetailsPage', () => {
	let component: ProductDetailsPage;
	let fixture: ComponentFixture<ProductDetailsPage>;

	beforeEach(async () => {
			await TestBed.configureTestingModule({
				declarations: [ProductDetailsPage],
				imports: [...translateTesting()],
				providers: [
					{
						provide: ActivatedRoute,
						useValue: {
							snapshot: {
								queryParams: {},
								paramMap: convertToParamMap({
									id: 'product-1',
								}),
							},
						},
					},
					{ provide: Store, useValue: {} },
					{
						provide: ProductLocalesService,
						useValue: createSpyObj(
							'ProductLocalesService',
							{
								getTranslate: '',
							}
						),
					},
					{
						provide: Router,
						useValue: createSpyObj('Router', ['navigate']),
					},
					{
						provide: NavController,
						useValue: createSpyObj('NavController', [
							'navigateRoot',
						]),
					},
					{
						provide: WarehouseOrdersRouter,
						useValue: createSpyObj(
							'WarehouseOrdersRouter',
							['create']
						),
					},
					{
						provide: ModalController,
						useValue: createSpyObj('ModalController', [
							'create',
						]),
					},
					// The warehouse never loads, so no product is shown.
					{
						provide: WarehouseRouter,
						useValue: createSpyObj('WarehouseRouter', {
							get: NEVER,
						}),
					},
					{
						provide: WarehouseProductsRouter,
						useValue: createSpyObj(
							'WarehouseProductsRouter',
							['get']
						),
					},
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ProductDetailsPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
