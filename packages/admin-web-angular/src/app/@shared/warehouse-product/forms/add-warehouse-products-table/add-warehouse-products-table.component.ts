import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import Product from '@modules/server.common/entities/Product';
import { first, takeUntil } from 'rxjs/operators';
import { Subject, Observable, forkJoin } from 'rxjs';
import { PriceCountInputComponent } from '../../../render-component/price-countInput/price-countInput.component';
import { TranslateService } from '@ngx-translate/core';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { CheckboxComponent } from '@app/@shared/render-component/customer-orders-table/checkbox/checkbox.component';

@Component({
	selector: 'ea-add-warehouse-products-table',
	templateUrl: './add-warehouse-products-table.component.html',
})
export class AddWarehouseProductsComponent implements OnInit, OnDestroy {
	@Input()
	boxShadow: string;
	@Input()
	perPage = 5;

	settingsSmartTable: object;
	sourceSmartTable = new LocalDataSource();

	private ngDestroy$ = new Subject<void>();
	private warehouseProducts: any[];
	private warehouse: Warehouse;

	constructor(
		private _translateService: TranslateService,
		private warehouseRouter: WarehouseRouter
	) {}

	ngOnInit(): void {
		this._loadSettingsSmartTable();
	}

	get allWarehouseProducts() {
		return [...this.warehouseProducts];
	}

	productsIsValid() {
		if (this.warehouseProducts) {
			const notRedy = this.warehouseProducts.filter(
				(p) =>
					!p.count ||
					!p.price ||
					(!p['isTakeaway'] && !p['isDeliveryRequired'])
			)[0];

			return notRedy ? false : true;
		}
	}

	async loadDataSmartTable(products: Product[], warehouseId?: string) {
		this.warehouseProducts = products.map((p) => {
			return { product: p.id };
		});

		if (warehouseId) {
			this.warehouse = await this.warehouseRouter
				.get(warehouseId)
				.pipe(first())
				.toPromise();
			if (this.warehouseProducts) {
				this.warehouseProducts.map((p) => {
					p['isTakeaway'] = this.warehouse.productsTakeaway;
					p['isDeliveryRequired'] = this.warehouse.productsDelivery;
					if (!p['isTakeaway'] && !p['isDeliveryRequired']) {
						p['isDeliveryRequired'] = true;
					}
				});
			}
		}

		const productsVM = products.map((product) => {
			const resObj = {
				name: product.title,
				id: product.id,
				takeProductDelivery: this.warehouse.productsDelivery,
				takeProductTakeaway: this.warehouse.productsTakeaway,
			};
			if (!resObj.takeProductDelivery && !resObj.takeProductTakeaway) {
				resObj.takeProductDelivery = true;
			}

			return resObj;
		});

		this.sourceSmartTable.load(productsVM);
	}

	private _loadSettingsSmartTable() {
		const columnTitlePrefix = 'WAREHOUSE_VIEW.SAVE.';
		const getTranslate = (name: string): Observable<string | any> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			getTranslate('PRODUCT_NAME'),
			getTranslate('PRICE'),
			getTranslate('COUNT'),
			getTranslate('DELIVERY'),
			getTranslate('TAKEAWAY')
		)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(([name, price, count, delivery, takeaway]) => {
				this.settingsSmartTable = {
					actions: false,
					hideSubHeader: true,
					// selectMode: 'multi',
					columns: {
						name: {
							title: name,
							filter: false,
						},
						price: {
							title: price,
							type: 'custom',
							filter: false,
							renderComponent: PriceCountInputComponent,
							onComponentInitFunction: async (instance) => {
								instance.placeholder = price;

								const id = await instance.id
									.pipe(first())
									.toPromise();
								const warehouseProd = this.warehouseProducts.filter(
									(p) => p.product === id
								)[0];

								instance.newValue
									.pipe(takeUntil(this.ngDestroy$))
									.subscribe((v) => {
										warehouseProd['initialPrice'] = v;
										warehouseProd['price'] = v;
									});
							},
						},
						count: {
							title: count,
							type: 'custom',
							filter: false,
							renderComponent: PriceCountInputComponent,
							onComponentInitFunction: async (instance) => {
								instance.placeholder = count;
								const id = await instance.id
									.pipe(first())
									.toPromise();
								const warehouseProd = this.warehouseProducts.filter(
									(p) => p.product === id
								)[0];
								warehouseProd['count'] = 1;
								instance.newValue
									.pipe(takeUntil(this.ngDestroy$))
									.subscribe((v) => {
										warehouseProd['count'] = v;
									});
							},
						},
						delivery: {
							title: delivery,
							type: 'custom',
							filter: false,
							renderComponent: CheckboxComponent,
							onComponentInitFunction: async (instance) => {
								instance.type = 'delivery';
								const id = await instance.id
									.pipe(first())
									.toPromise();
								const warehouseProd = this.warehouseProducts.filter(
									(p) => p.product === id
								)[0];
								instance.newValue
									.pipe(takeUntil(this.ngDestroy$))
									.subscribe((res) => {
										if (res.type === 'delivery') {
											warehouseProd[
												'isDeliveryRequired'
											] = res.checked;
										}
									});
							},
						},
						takeaway: {
							title: takeaway,
							type: 'custom',
							filter: false,
							renderComponent: CheckboxComponent,
							onComponentInitFunction: async (
								instance: CheckboxComponent
							) => {
								instance.type = 'takeaway';
								const id = await instance.id
									.pipe(first())
									.toPromise();
								const warehouseProd = this.warehouseProducts.filter(
									(p) => p.product === id
								)[0];
								instance.newValue
									.pipe(takeUntil(this.ngDestroy$))
									.subscribe((res) => {
										if (res.type === 'takeaway') {
											warehouseProd['isTakeaway'] =
												res.checked;
										}
									});
							},
						},
					},
					pager: {
						display: true,
						perPage: this.perPage,
					},
				};
			});
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
