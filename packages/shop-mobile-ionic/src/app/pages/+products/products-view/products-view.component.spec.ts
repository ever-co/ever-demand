import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { WarehouseProductsService } from 'app/services/merchants/warehouse-products';
import { ProductsService } from '../../../services/products.service';
import { Store } from '../../../services/store.service';
import { ProductsViewComponent } from './products-view.component';

describe('ProductsViewComponent', () => {
	let component: ProductsViewComponent;
	let fixture: ComponentFixture<ProductsViewComponent>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [ProductsViewComponent],
				providers: [
					{ provide: Store, useValue: {} },
					{
						provide: Router,
						useValue: jasmine.createSpyObj('Router', ['navigate']),
					},
					{
						provide: WarehouseProductsService,
						useValue: jasmine.createSpyObj(
							'WarehouseProductsService',
							['getWarehouseProduct']
						),
					},
					{
						provide: ProductsService,
						useValue: jasmine.createSpyObj('ProductsService', [
							'goToDetailsPage',
						]),
					},
				],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(ProductsViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
