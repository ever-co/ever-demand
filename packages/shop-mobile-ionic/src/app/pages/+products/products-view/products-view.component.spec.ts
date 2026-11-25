import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { WarehouseProductsService } from 'app/services/merchants/warehouse-products';
import { ProductsService } from '../../../services/products.service';
import { Store } from '../../../services/store.service';
import { ProductsViewComponent } from './products-view.component';
import { createSpyObj } from 'app/testing/spies';

describe('ProductsViewComponent', () => {
	let component: ProductsViewComponent;
	let fixture: ComponentFixture<ProductsViewComponent>;

	beforeEach(async () => {
			await TestBed.configureTestingModule({
				declarations: [ProductsViewComponent],
				providers: [
					{ provide: Store, useValue: {} },
					{
						provide: Router,
						useValue: createSpyObj('Router', ['navigate']),
					},
					{
						provide: WarehouseProductsService,
						useValue: createSpyObj(
							'WarehouseProductsService',
							['getWarehouseProduct']
						),
					},
					{
						provide: ProductsService,
						useValue: createSpyObj('ProductsService', [
							'goToDetailsPage',
						]),
					},
				],
			}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ProductsViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
