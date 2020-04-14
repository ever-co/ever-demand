import {
	Component,
	OnDestroy,
	OnInit,
	Output,
	EventEmitter,
	Input,
} from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { StoreProductPriceComponent } from '@app/@shared/render-component/store-products-table/store-product-price.component';
import { StoreProductAmountComponent } from '@app/@shared/render-component/store-products-table/store-product-amount/store-product-amount.component';
import { ProductCategoriesComponent } from '@app/@shared/render-component/product-categories/product-categories';
import { ProductTitleRedirectComponent } from '@app/@shared/render-component/product-title-redirect/product-title-redirect.component';
import { Observable, forkJoin, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ProductsCategoryService } from '@app/@core/data/productsCategory.service';
import Product from '@modules/server.common/entities/Product';
import { StoreProductImageComponent } from '@app/@shared/render-component/store-products-table/store-product-image/store-product-image.component';

export interface WarehouseProductViewModel {
	id: string;
	image: string;
	title: string;
	description: string;
	details: string;
	categories: { ids: string[]; search: string };
	price: number;
	qty: number;
	storeId: string;
	product: Product;
	allCategories: any[];
}

@Component({
	selector: 'ea-warehouse-products-table',
	templateUrl: './warehouse-products-table.component.html',
})
export class WarehouseProductsComponent implements OnInit, OnDestroy {
	@Output()
	onEdit = new EventEmitter();
	@Output()
	onDelete = new EventEmitter();

	@Input()
	perPage: number = 5;
	@Input()
	selectMode = 'multi';

	settingsSmartTable: object;
	sourceSmartTable = new LocalDataSource();
	selectedProducts: WarehouseProductViewModel[] = [];

	private ngDestroy$ = new Subject<void>();
	private categoriesInfo: any = [];

	constructor(
		private readonly _translateService: TranslateService,
		private readonly _productLocalesService: ProductLocalesService,
		private readonly _productsCategoryService: ProductsCategoryService
	) {}

	get hasSelectedProducts(): boolean {
		return this.selectedProducts.length > 0;
	}

	ngOnInit(): void {
		this._getCategories();
		this._loadSettingsSmartTable();
		this._applyTranslationOnSmartTable();
	}

	ngOnDestroy(): void {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}

	async loadDataSmartTable(products: WarehouseProduct[], storeId: string) {
		const productsVM = products.map((product: WarehouseProduct) => {
			return {
				id: product.productId,
				image: this._productLocalesService.getTranslate(
					product.product['images']
				),
				title: this._productLocalesService.getTranslate(
					product.product['title']
				),
				description: this._productLocalesService.getTranslate(
					product.product['description']
				),
				details: this._productLocalesService.getTranslate(
					product.product['details']
				),
				categories: {
					ids: product.product['categories'],
					search:
						this.categoriesInfo &&
						this.categoriesInfo
							.filter((c) =>
								product.product['categories'].includes(c.id)
							)
							.map((c) =>
								this._productLocalesService.getTranslate(c.name)
							)
							.toString(),
				},
				price: product.price,
				qty: product.count,
				storeId,
				product: product.product,
				allCategories: this.categoriesInfo,
			};
		});

		this.sourceSmartTable.load(productsVM);
	}

	selectProductTmp(ev) {
		this.selectedProducts = ev.selected;
	}

	private _getCategories() {
		this._productsCategoryService
			.getCategories()
			.subscribe((categories) => {
				this.categoriesInfo = categories;
			});
	}

	private _loadSettingsSmartTable() {
		const columnTitlePrefix = 'WAREHOUSE_VIEW.PRODUCTS_TAB.';
		const getTranslate = (name: string): Observable<any> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			this._translateService.get('Id'),
			getTranslate('IMAGE'),
			getTranslate('TITLE'),
			getTranslate('DESCRIPTION'),
			getTranslate('DETAILS'),
			getTranslate('CATEGORY'),
			getTranslate('PRICE'),
			getTranslate('QUANTITY')
		)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(
				([
					id,
					image,
					titleTr,
					description,
					details,
					category,
					price,
					quantity,
				]) => {
					this.settingsSmartTable = {
						mode: 'external',
						actions: {
							add: false,
							position: 'left',
						},
						edit: {
							editButtonContent: '<i class="ion-md-create"></i>',
						},
						delete: {
							deleteButtonContent: '<i class="ion-md-trash"></i>',
							confirmDelete: true,
						},
						selectMode: this.selectMode,
						columns: {
							image: {
								title: image,
								type: 'custom',
								class: 'text-center',
								renderComponent: StoreProductImageComponent,
								filter: false,
							},
							title: {
								title: titleTr,
								type: 'custom',
								renderComponent: ProductTitleRedirectComponent,
							},
							description: { title: description },
							details: { title: details },
							categories: {
								title: category,
								type: 'custom',
								renderComponent: ProductCategoriesComponent,
								filterFunction(
									cell?: any,
									search?: string
								): boolean {
									if (cell.search.includes(search)) {
										return true;
									} else {
										return false;
									}
								},
							},
							price: {
								title: price,
								type: 'custom',
								renderComponent: StoreProductPriceComponent,
							},
							qty: {
								title: quantity,
								class: 'text-center',
								type: 'custom',
								renderComponent: StoreProductAmountComponent,
							},
						},
						pager: {
							display: true,
							perPage: this.perPage,
						},
					};
				}
			);
	}

	private _applyTranslationOnSmartTable() {
		this._translateService.onLangChange.subscribe(() => {
			this._loadSettingsSmartTable();
		});
	}
}
