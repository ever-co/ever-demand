import {
	Component,
	Input,
	Output,
	EventEmitter,
	OnInit,
	OnDestroy,
} from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject, Observable, forkJoin } from 'rxjs';
import { MakeOrderInputComponent } from './make-order-input.component';
import { IOrderCreateInputProduct } from '@modules/server.common/routers/IWarehouseOrdersRouter';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { takeUntil } from 'rxjs/operators';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { WarehouseOrdersService } from '../../../services/warehouse-orders.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';

@Component({
	selector: 'make-order',
	templateUrl: './make-order.component.html',
	styleUrls: ['./make-order.component.scss'],
})
export class MakeOrderComponent implements OnInit, OnDestroy {
	private ngDestroy$ = new Subject<void>();

	@Input()
	customerId: string;

	@Input()
	orderFinishedEmitter: EventEmitter<void>;

	@Output()
	isOrderAllowedEmitter = new EventEmitter<boolean>();

	settingsSmartTable: any;
	sourceSmartTable = new LocalDataSource();

	private _orderProducts: IOrderCreateInputProduct[] = [];

	private _warehouseProducts: WarehouseProduct[] = [];

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly _warehouseProductsRouter: WarehouseProductsRouter,
		private readonly _productLocaleService: ProductLocalesService,
		private readonly _warehouseOrdersService: WarehouseOrdersService,
		private readonly _alertController: AlertController,
		private readonly _translateService: TranslateService
	) {}

	get canOrder(): boolean {
		return this._orderProducts.some((product) => product.count > 0);
	}

	get warehouseId() {
		return localStorage.getItem('_warehouseId');
	}

	ngOnInit() {
		this._loadSettingsSmartTable();
		this._loadWarehouseProducts();
	}

	makeOrder() {
		const orderProducts = this._orderProducts.filter(
			({ count }) => count > 0
		);

		this._warehouseOrdersService
			.createOrder({
				userId: this.customerId,
				warehouseId: this.warehouseId,
				products: orderProducts,
			})
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(
				() => {
					this._showNotification(
						`User with id '${this.customerId}' finish the order`
					);
					this.orderFinishedEmitter.emit();
				},
				() => {
					this._showNotification(
						'Something is wrong, unable to place order!'
					);
				}
			);
	}

	private _compareByAvailableProducts(_, first, second) {
		const regex = /<div class="text-center"><div class="badge badge-pill badge-secondary text-center">([0-9]+)<\/div><\/div>/gm;

		const matchFirst = +regex.exec(first)[1];
		regex.lastIndex = 0; // to reset the regex
		const matchSecond = +regex.exec(second)[1];

		return _ > 0 ? matchFirst - matchSecond : matchSecond - matchFirst;
	}

	private async _showNotification(message: string) {
		const alert = await this._alertController.create({
			message,
			buttons: ['OK'],
		});
		await alert.present();
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
					price: `<div class="text-center">$${wp.price}</div>`,
					available: `
						<div class="text-center"><div class="badge badge-pill badge-secondary text-center">${wp.count}</div></div>
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

	private _loadSettingsSmartTable() {
		const columnTitlePrefix = 'WAREHOUSE_VIEW.NEW_ORDER_VIEW.';
		const getTranslate = (name: string): Observable<string | any> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			this._translateService.get('Id'),
			getTranslate('IMAGE'),
			getTranslate('PRODUCT'),
			getTranslate('PRICE'),
			getTranslate('AVAILABLE'),
			getTranslate('AMOUNT')
		)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(([id, image, product, price, available, amount]) => {
				this.settingsSmartTable = {
					actions: false,
					pager: { perPage: 3 },
					columns: {
						img: {
							title: image,
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
							type: 'html',
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
							renderComponent: MakeOrderInputComponent,
							onComponentInitFunction: (
								childInstance: MakeOrderInputComponent
							) => {
								childInstance.amount
									.pipe(takeUntil(this._ngDestroy$))
									.subscribe((count) => {
										const wProduct = this._orderProducts.find(
											({ productId }) =>
												productId ===
												childInstance.productId
										);
										wProduct.count = count;
										this.isOrderAllowedEmitter.emit(
											this.canOrder
										);
									});
							},
						},
					},
				};
			});
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
