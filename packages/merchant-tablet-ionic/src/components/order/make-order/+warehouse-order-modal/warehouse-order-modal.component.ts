import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
} from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { WarehouseOrderInputComponent } from './warehouse-order-input.component';
import { IOrderCreateInputProduct } from '@modules/server.common/routers/IWarehouseOrdersRouter';
import { TranslateService } from '@ngx-translate/core';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';

@Component({
	selector: 'ea-warehouse-order-modal',
	styleUrls: ['./warehouse-order-modal.component.scss'],
	templateUrl: './warehouse-order-modal.component.html',
})
export class WarehouseOrderModalComponent implements OnInit, OnDestroy {
	@Input()
	warehouseId: string;

	@Input()
	showOrderAction: boolean = true;

	@Output()
	makeOrderEmitter = new EventEmitter<IOrderCreateInputProduct[]>();

	@Output()
	isOrderAllowedEmitter = new EventEmitter<boolean>();

	settingsSmartTable: object;
	sourceSmartTable = new LocalDataSource();

	private _warehouseProducts: WarehouseProduct[] = [];

	private _orderProducts: IOrderCreateInputProduct[] = [];

	private _clearAvailableProductsFilter: boolean = false;

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly _translateService: TranslateService,
		private readonly _productLocaleService: ProductLocalesService,
		private readonly _warehouseProductsRouter: WarehouseProductsRouter
	) {}

	get TRANSLATE_PREFIXES() {
		const basePrefix = 'SHARED.WAREHOUSE.ORDER_MODAL';
		const smartTableTitlesPrefix = 'SMART_TABLE.TITLES';

		return {
			MAKE_ORDER: `${basePrefix}.MAKE_ORDER`,
			ONLY_AVAILABLE: `${basePrefix}.ONLY_AVAILABLE`,
			ORDER: `${basePrefix}.ORDER`,
			SMART_TABLE: {
				TITLES: {
					IMG: `${basePrefix}.${smartTableTitlesPrefix}.IMG`,
					PRODUCT: `${basePrefix}.${smartTableTitlesPrefix}.PRODUCT`,
					PRICE: `${basePrefix}.${smartTableTitlesPrefix}.PRICE`,
					AVAILABLE: `${basePrefix}.${smartTableTitlesPrefix}.AVAILABLE`,
					AMOUNT: `${basePrefix}.${smartTableTitlesPrefix}.AMOUNT`,
				},
			},
		};
	}

	get canOrder(): boolean {
		return this._orderProducts.some((product) => product.count > 0);
	}

	ngOnInit() {
		this._loadSettingsSmartTable();
		this._loadWarehouseProducts();
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	makeOrder() {
		this.makeOrderEmitter.emit(
			this._orderProducts.filter(({ count }) => count > 0)
		);
	}

	toggleAvalableProducts() {
		if (this._clearAvailableProductsFilter) {
			this.sourceSmartTable.setFilter([]);
		} else {
			this.sourceSmartTable.setFilter([
				{
					field: 'available',
					search: '0',
					filter: (element, valueToCompare) => {
						const regex = /<div class="badge badge-pill badge-secondary">([0-9]+)<\/div>/gm;
						const productCount = +regex.exec(element)[1];

						return productCount > +valueToCompare;
					},
				},
			]);
		}

		this._clearAvailableProductsFilter = !this
			._clearAvailableProductsFilter;
	}

	private _loadWarehouseProducts() {
		this._warehouseProductsRouter
			.get(this.warehouseId)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((p) => {
				Object.assign(this._warehouseProducts, p);
				this._loadDataSmartTable();
			});
	}

	private _loadDataSmartTable() {
		this._orderProducts = this._warehouseProducts.map(
			(wp: WarehouseProduct) => {
				return {
					productId: wp.productId,
					count: 0,
				};
			}
		);

		const productsData = this._warehouseProducts.map(
			(wp: WarehouseProduct) => {
				return {
					img: `
						<img src="${this._getTranslate(wp.product['images'])}" height="68px"/>
					`,
					product: `
						<span class="float-left">${this._getTranslate(wp.product['title'])}</span>
					`,
					price: `${wp.price}$`,
					available: `
						<div class="badge badge-pill badge-secondary">${wp.count}</div>
					`,
					amount: { productId: wp.productId, available: wp.count },
				};
			}
		);

		this.sourceSmartTable.setSort([
			{
				field: 'available',
				direction: 'desc',
				compare: this._compareByAvailableProducts,
			},
		]);
		this.sourceSmartTable.load(productsData);
	}

	private _getTranslate(members: ILocaleMember[]): string {
		return this._productLocaleService.getTranslate(members);
	}

	private _compareByAvailableProducts(_, first, second) {
		const regex = /<div class="badge badge-pill badge-secondary">([0-9]+)<\/div>/gm;

		const matchFirst = +regex.exec(first)[1];
		regex.lastIndex = 0; // to reset the regex
		const matchSecond = +regex.exec(second)[1];

		return _ > 0 ? matchFirst - matchSecond : matchSecond - matchFirst;
	}

	private _translate(key: string): string {
		let translationResult = '';

		this._translateService.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}

	private _loadSettingsSmartTable() {
		const img = this._translate(
			this.TRANSLATE_PREFIXES.SMART_TABLE.TITLES.IMG
		);
		const product = this._translate(
			this.TRANSLATE_PREFIXES.SMART_TABLE.TITLES.PRODUCT
		);
		const price = this._translate(
			this.TRANSLATE_PREFIXES.SMART_TABLE.TITLES.PRICE
		);
		const available = this._translate(
			this.TRANSLATE_PREFIXES.SMART_TABLE.TITLES.AVAILABLE
		);
		const amount = this._translate(
			this.TRANSLATE_PREFIXES.SMART_TABLE.TITLES.AMOUNT
		);

		this.settingsSmartTable = {
			actions: false,
			pager: { perPage: 5 },
			columns: {
				img: {
					title: img,
					filter: false,
					type: 'html',
					width: '50px',
				},
				product: {
					title: product,
					type: 'html',
				},
				price: {
					title: price,
					filter: false,
					compareFunction: (_, first, second) => {
						const matchFirst = +first.replace('$', '');
						const matchSecond = +second.replace('$', '');
						return _ > 0
							? matchFirst - matchSecond
							: matchSecond - matchFirst;
					},
				},
				available: {
					title: available,
					type: 'html',
					filter: false,
					compareFunction: this._compareByAvailableProducts,
				},
				amount: {
					title: amount,
					filter: false,
					type: 'custom',
					renderComponent: WarehouseOrderInputComponent,
					onComponentInitFunction: (
						childInstance: WarehouseOrderInputComponent
					) => {
						childInstance.amount
							.pipe(takeUntil(this._ngDestroy$))
							.subscribe((count) => {
								const wProduct = this._orderProducts.find(
									({ productId }) =>
										productId === childInstance.productId
								);
								wProduct.count = count;

								if (!this.showOrderAction) {
									this.isOrderAllowedEmitter.emit(
										this.canOrder
									);
								}
							});
					},
				},
			},
		};
	}
}
