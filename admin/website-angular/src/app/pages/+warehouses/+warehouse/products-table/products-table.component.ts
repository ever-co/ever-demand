import {
	OnDestroy,
	Component,
	Output,
	EventEmitter,
	Input
} from '@angular/core';
import { Subject, Observable, forkJoin } from 'rxjs';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import Product from '@modules/server.common/entities/Product';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { Subscription } from 'apollo-client/util/Observable';
import { Router } from '@angular/router';
import { NotifyService } from '../../../../@core/services/notify/notify.service';
import { ConfimationModalComponent } from '../../../../@shared/confirmation-modal/confirmation-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StoreProductImageComponent } from '../../../../@shared/render-component/store-products-table/store-product-image/store-product-image.component';
import { ProductTitleRedirectComponent } from '../../../../@shared/render-component/product-title-redirect/product-title-redirect.component';
import { ProductCategoriesComponent } from '../../../../@shared/render-component/product-categories/product-categories';
import { ProductsCategoryService } from '../../../../@core/data/productsCategory.service';
import { StoreProductPriceComponent } from '../../../../@shared/render-component/store-products-table/store-product-price.component';
import { StoreProductAmountComponent } from '../../../../@shared/render-component/store-products-table/store-product-amount/store-product-amount.component';

interface WarehouseProductViewModel {
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
	selector: 'ea-store-products-table',
	templateUrl: './products-table.component.html',
	styleUrls: ['./products-table.component.scss']
})
export class ProductsTableComponent implements OnDestroy {
	@Output()
	public addProducts: EventEmitter<boolean> = new EventEmitter();

	@Input()
	public warehouse: Warehouse;

	public settingsSmartTable: object;
	public sourceSmartTable = new LocalDataSource();
	private categoriesInfo: any = [];

	private _selectedProducts: WarehouseProductViewModel[] = [];
	private ngDestroy$ = new Subject<void>();
	private warehouseProducts$: Subscription;

	public loading: boolean;

	constructor(
		private readonly _translateService: TranslateService,
		private readonly _warehouseProductsRouter: WarehouseProductsRouter,
		private readonly _productLocalesService: ProductLocalesService,
		private readonly productsCategoryService: ProductsCategoryService,
		private readonly warehouseRouter: WarehouseRouter,
		private readonly _router: Router,
		private readonly _notifyService: NotifyService,
		private readonly modalService: NgbModal
	) {
		this._loadSettingsSmartTable();
		this.getCategories();
		this._applyTranslationOnSmartTable();
	}

	get hasSelectedProducts(): boolean {
		return this._selectedProducts.length > 0;
	}

	editProduct(ev) {
		this._router.navigate(['/products/list/' + ev.data.id + '/edit']);
	}

	removeProduct(ev) {
		const activeModal = this.modalService.open(ConfimationModalComponent, {
			size: 'sm',
			container: 'nb-layout',
			backdrop: 'static'
		});
		const modalComponent: ConfimationModalComponent =
			activeModal.componentInstance;

		modalComponent.confirmEvent
			.pipe(takeUntil(modalComponent.ngDestroy$))
			.subscribe((dataEvent) => {
				this.removeProducts([ev.data]);
				modalComponent.cancel();
			});
	}

	getCategories() {
		this.productsCategoryService.getCategories().subscribe((categories) => {
			this.categoriesInfo = categories;
		});
	}

	deleteSelectedRows() {
		this.removeProducts(this._selectedProducts);
	}

	localeTranslate(member: ILocaleMember[]) {
		return this._productLocalesService.getTranslate(member);
	}

	async loadDataSmartTable(storeId) {
		let products: WarehouseProduct[] = [];

		if (this.warehouseProducts$) {
			this.warehouseProducts$.unsubscribe();
			this._selectedProducts = [];
		}

		const loadData = () => {
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
									this._productLocalesService.getTranslate(
										c.name
									)
								)
								.toString()
					},
					price: product.price,
					qty: product.count,
					storeId,
					product: product.product,
					allCategories: this.categoriesInfo
				};
			});

			this.sourceSmartTable.load(productsVM);
		};

		this.warehouseProducts$ = this._warehouseProductsRouter
			.get(storeId)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((p: WarehouseProduct[]) => {
				products = p;
				loadData();
			});
	}

	removeProducts(warehouseProducts: WarehouseProductViewModel[]) {
		if (this.warehouse) {
			this.loading = true;
			this.warehouse.products = this.warehouse.products.filter(
				(p: WarehouseProduct) =>
					!warehouseProducts
						.map((product) => product.id)
						.includes(p.productId)
			);
			this.warehouseRouter.save(this.warehouse);
			this.loading = false;
			const message = 'Selected products are deleted!';
			this._notifyService.success(message);
		} else {
			const message = `Can't remove products`;
			this.loading = false;
			this._notifyService.error(message);
		}
	}

	selectProductTmp(ev) {
		this._selectedProducts = ev.selected;
	}

	private _applyTranslationOnSmartTable() {
		this._translateService.onLangChange.subscribe(() => {
			this._loadSettingsSmartTable();
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
					quantity
				]) => {
					this.settingsSmartTable = {
						mode: 'external',
						actions: {
							add: false,
							position: 'left'
						},
						edit: {
							editButtonContent: '<i class="nb-edit"></i>'
						},
						delete: {
							deleteButtonContent: '<i class="nb-trash"></i>',
							confirmDelete: true
						},
						selectMode: 'multi',
						columns: {
							image: {
								title: image,
								type: 'custom',
								class: 'text-center',
								renderComponent: StoreProductImageComponent,
								filter: false
							},
							title: {
								title: titleTr,
								type: 'custom',
								renderComponent: ProductTitleRedirectComponent
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
								}
							},
							price: {
								title: price,
								type: 'custom',
								renderComponent: StoreProductPriceComponent
							},
							qty: {
								title: quantity,
								class: 'text-center',
								type: 'custom',
								renderComponent: StoreProductAmountComponent
							}
						},
						pager: {
							display: true,
							perPage: 5
						}
					};
				}
			);
	}

	ngOnDestroy(): void {
		console.warn('ProductsTableComponent destroyed');
	}
}
