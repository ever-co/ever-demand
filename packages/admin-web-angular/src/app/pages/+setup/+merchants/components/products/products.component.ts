import {
	Component,
	ViewChild,
	Output,
	EventEmitter,
	OnDestroy,
	Input,
	OnChanges,
} from '@angular/core';
import { SetupMerchantProductsCatalogComponent } from './products-catalog/products-catalog.component';
import { SetupMerchantAddProductsComponent } from './add-products/add-products.component';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { WarehouseProductsComponent } from '@app/@shared/warehouse-product/forms/warehouse-products-table';
import { SetupMerchantProductMutationComponent } from './product-mutation/product-mutation.component';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { NotifyService } from '@app/@core/services/notify/notify.service';
import Product from '@modules/server.common/entities/Product';
import { Router } from '@angular/router';

@Component({
	selector: 'ea-merchants-setup-products',
	templateUrl: './products.component.html',
	styleUrls: ['./products.component.scss'],
})
export class SetupMerchantProductsComponent implements OnChanges, OnDestroy {
	@ViewChild('productsCatalog')
	productsCatalog: SetupMerchantProductsCatalogComponent;
	@ViewChild('addProducts')
	addProducts: SetupMerchantAddProductsComponent;
	@ViewChild('productsTable')
	productsTable: WarehouseProductsComponent;
	@ViewChild('productMutation')
	productMutation: SetupMerchantProductMutationComponent;

	@Output()
	previousStep: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output()
	nextStep: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input()
	storeId: string;

	componentViews = {
		main: 'main',
		productsTable: 'productsTable',
		createProduct: 'createProduct',
		editProduct: 'editProduct',
		addProducts: 'addProducts',
	};
	productsPerPage = 3;
	showProductsTable: boolean = false;
	currentProduct: Product;

	productsForAdd = [];
	storeProducts: WarehouseProduct[];

	private _currentView = this.componentViews.main;
	private _prevView = this.componentViews.main;
	private _ngDestroy$ = new Subject<void>();
	private products$: Subscription;

	constructor(
		private warehouseProductsRouter: WarehouseProductsRouter,
		private warehouseRouter: WarehouseRouter,
		private notifyService: NotifyService,
		private router: Router
	) {}

	get haveProductsForAdd() {
		let hasSelectedCarriers = false;

		if (this.productsCatalog) {
			hasSelectedCarriers = this.productsCatalog.productsTable
				.hasSelectedProducts;
		}

		return hasSelectedCarriers;
	}

	get currentView() {
		return this._currentView;
	}

	set currentView(view: string) {
		this._prevView = this.currentView;
		this._currentView = view;
	}

	get existedProductsIds() {
		let ids = [];
		if (this.storeProducts) {
			ids = this.storeProducts.map((p) => p.productId);
		}

		return ids;
	}

	select(products) {
		this.productsForAdd = products;
		this.currentView = this.componentViews.addProducts;
	}

	back() {
		if (this.currentView === this.componentViews.addProducts) {
			this.currentView = this._prevView;
			return;
		}

		this.currentProduct = null;
		this.currentView = this.componentViews.main;
	}

	editProduct({ data }) {
		this.currentProduct = data.product;
		this.currentView = this.componentViews.editProduct;
	}

	async removeProduct({ data }) {
		try {
			if (this.storeId) {
				const store = await this.warehouseRouter
					.get(this.storeId, true)
					.pipe(first())
					.toPromise();

				store.products = store.products.filter(
					(p: WarehouseProduct) => p.productId !== data.id
				);

				await this.warehouseRouter.save(store);
			} else {
				throw new Error("Store id don't exist");
			}
		} catch (error) {
			const message = `Can't remove products error: ${error.message}`;
			this.notifyService.error(message);
		}
	}

	async loadProducts() {
		if (this.storeId) {
			if (this.products$) {
				await this.products$.unsubscribe();
			}

			this.products$ = this.warehouseProductsRouter
				.get(this.storeId)
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((products) => {
					this.showProductsTable = products.length > 0;

					this.productsTable.loadDataSmartTable(
						products,
						this.storeId
					);

					this.storeProducts = products;
				});
		}
	}

	updateMain() {
		this.currentProduct = null;
		this.currentView = this.componentViews.main;
		this.loadProducts();
	}

	finish() {
		this.nextStep.emit();
		this.router.navigateByUrl('/setup');
	}

	ngOnChanges(): void {
		this.loadProducts();
	}

	ngOnDestroy(): void {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
