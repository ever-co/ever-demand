import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular/lazy';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { NEVER } from 'rxjs';
import { Store } from '../../../services/store.service';
import { ProductDetailsPage } from './product-details.page';

describe('ProductDetailsPage', () => {
	let component: ProductDetailsPage;
	let fixture: ComponentFixture<ProductDetailsPage>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [ProductDetailsPage],
				imports: [TranslateModule.forRoot()],
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
						useValue: jasmine.createSpyObj(
							'ProductLocalesService',
							{
								getTranslate: '',
							}
						),
					},
					{
						provide: Router,
						useValue: jasmine.createSpyObj('Router', ['navigate']),
					},
					{
						provide: NavController,
						useValue: jasmine.createSpyObj('NavController', [
							'navigateRoot',
						]),
					},
					{
						provide: WarehouseOrdersRouter,
						useValue: jasmine.createSpyObj(
							'WarehouseOrdersRouter',
							['create']
						),
					},
					{
						provide: ModalController,
						useValue: jasmine.createSpyObj('ModalController', [
							'create',
						]),
					},
					// The warehouse never loads, so no product is shown.
					{
						provide: WarehouseRouter,
						useValue: jasmine.createSpyObj('WarehouseRouter', {
							get: NEVER,
						}),
					},
					{
						provide: WarehouseProductsRouter,
						useValue: jasmine.createSpyObj(
							'WarehouseProductsRouter',
							['get']
						),
					},
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(ProductDetailsPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
