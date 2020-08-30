import { Component, Input, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject, forkJoin, Observable } from 'rxjs';
import Order from '@modules/server.common/entities/Order';
import OrderProduct from '@modules/server.common/entities/OrderProduct';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import Product from '@modules/server.common/entities/Product';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { first, takeUntil } from 'rxjs/operators';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from 'angular2-toaster';
import { ConfimationModalComponent } from '../../../../@shared/confirmation-modal/confirmation-modal.component';
import { StoreOrderProductAmountComponent } from '../../../../@shared/render-component/store-products-table/store-order-product-amount/store-order-product-amount.component';
import { ProductTitleRedirectComponent } from '../../../../@shared/render-component/product-title-redirect/product-title-redirect.component';
import { StoreProductPriceComponent } from '../../../../@shared/render-component/store-products-table/store-product-price.component';
import { StoreProductImageComponent } from '../../../../@shared/render-component/store-products-table/store-product-image/store-product-image.component';
import { WarehouseOrderModalComponent } from '../../../../@shared/warehouse/+warehouse-order-modal/warehouse-order-modal.component';

interface OrderProductsViewModel {
	price: string;
	qty: string;
	product: Product;
	image: string;
}

@Component({
	selector: 'ea-order-products',
	templateUrl: './order-products.component.html',
	styleUrls: ['/order-products.component.scss'],
})
export class OrderProductsComponent implements OnInit, OnChanges, OnDestroy {
	public selectedProducts: OrderProductsViewModel[] = [];

	public sourceSmartTable: LocalDataSource = new LocalDataSource();
	public settingsSmartTable: object;
	private _ngDestroy$ = new Subject<void>();

	public modalTitle: string;
	public actionBtnText: string;
	public toastSuccMsg: string;
	public toastErrMsg: string;

	public loading: boolean;

	@Input()
	public order: Order;

	constructor(
		private readonly _productLocalesService: ProductLocalesService,
		private readonly warehouseOrdersRouter: WarehouseOrdersRouter,
		private readonly modalService: NgbModal,
		private readonly orderRouter: OrderRouter,
		private readonly _translateService: TranslateService,
		private readonly router: Router,
		private readonly _toasterService: ToasterService
	) {
		this._loadSmartTableSettings();
	}

	public get givenToCarrier() {
		return OrderWarehouseStatus.GivenToCarrier;
	}

	public get deliveryCompleted() {
		return OrderCarrierStatus.DeliveryCompleted;
	}

	ngOnInit(): void {
		this.loadDataSmartTable();
		this._applyTranslationOnSmartTable();
	}

	ngOnChanges(): void {
		this.loadDataSmartTable();
	}

	async loadDataSmartTable() {
		const loadData = () => {
			if (this.order) {
				const productsVM = this.order.products.map(
					(product: OrderProduct) => {
						return {
							id: product.product.id,
							price: product.price,
							qty: product.count,
							product: product.product,
							image: this._productLocalesService.getTranslate(
								product.product['images']
							),
							disableImg: true,
							orderId: this.order.id,
							orderWarehouseId: this.order.warehouseId,
							warehouseProducts: this.order.warehouse['products'],
						};
					}
				);

				this.sourceSmartTable.load(productsVM);
			}
		};

		loadData();
	}

	selectProductTmp(ev) {
		this.selectedProducts = ev.selected;
	}

	addProductsModalTranslates() {
		const columnTitlePrefix = 'ORDER_VIEW.ORDER_PRODUCT_INFO.';
		const getTranslatedWords = (name: string): Observable<string | any> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			getTranslatedWords('ADD_PRODUCTS_MODAL'),
			getTranslatedWords('ADD'),
			getTranslatedWords('SUCCESS_TOAST'),
			getTranslatedWords('ERROR_TOAST')
		)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(([addProduct, add, successToast, errorToast]) => {
				this.actionBtnText = add;
				this.modalTitle = addProduct;
				this.toastSuccMsg = successToast;
				this.toastErrMsg = errorToast;
			});
	}

	async addProducts() {
		if (this.order) {
			const componentRef = this.modalService.open(
				WarehouseOrderModalComponent,
				{
					size: 'lg',
					container: 'nb-layout',
					windowClass: 'ng-custom',
					backdrop: 'static',
				}
			);
			const instance: WarehouseOrderModalComponent =
				componentRef.componentInstance;

			instance.warehouseId = this.order.warehouseId;
			instance.modalTitle = this.modalTitle;
			instance.actionBtnText = this.actionBtnText;

			const products = await instance.makeOrderEmitter
				.pipe(first())
				.toPromise();

			this.orderRouter
				.addProducts(this.order.id, products, this.order.warehouseId)
				.then((r) => {
					this._toasterService.pop(
						`success`,
						`${this.toastSuccMsg}!`
					);
				})
				.catch((err) => {
					this._toasterService.pop(`error`, `${this.toastErrMsg}!`);
				});

			componentRef.close();
		}
	}

	async removeSelectedProducts() {
		const productsIds = this.selectedProducts.map((res) => res['id']);
		if (this.order && productsIds.length > 0) {
			try {
				this.loading = true;
				const order = await this.orderRouter.removeProducts(
					this.order.id,
					productsIds
				);

				this.selectedProducts = [];
				this.loading = false;
				this._toasterService.pop(
					`success`,
					`Selected products are deleted!`
				);
			} catch (error) {
				this.loading = false;
				this._toasterService.pop('error', `Error: "${error.message}"`);
			}
		}
	}

	async cancelOrder() {
		const activeModal = this.modalService.open(ConfimationModalComponent, {
			size: 'sm',
			container: 'nb-layout',
			backdrop: 'static',
		});
		const modalComponent: ConfimationModalComponent =
			activeModal.componentInstance;

		await modalComponent.confirmEvent
			.pipe(takeUntil(modalComponent.ngDestroy$))
			.subscribe((dataEvent) => {
				if (this.order) {
					try {
						this.loading = true;
						const res = this.warehouseOrdersRouter.cancel(
							this.order.id
						);
						this.loading = false;
						this._toasterService.pop(
							`success`,
							`Order is canceled!`
						);
					} catch (error) {
						this.loading = false;
						this._toasterService.pop(
							'error',
							`Error: "${error.message}"`
						);
					}
					// const res = await this.warehouseOrdersRouter.cancel(this.order.id);
				}
				modalComponent.cancel();
			});
	}

	private _loadSmartTableSettings() {
		const columnTitlePrefix = 'ORDER_VIEW.ORDER_PRODUCT_INFO.SMART_TABLE.';
		const getTranslate = (name: string): Observable<string | any> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			this._translateService.get('Id'),
			getTranslate('IMAGE'),
			getTranslate('NAME'),
			getTranslate('QTY'),
			getTranslate('PRICE')
		)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(([id, image, name, qty, price]) => {
				this.settingsSmartTable = {
					actions: false,
					selectMode: 'multi',
					columns: {
						name: {
							title: name,
							renderComponent: ProductTitleRedirectComponent,
							type: 'custom',
						},
						qty: {
							title: qty,
							class: 'text-center',
							type: 'custom',
							width: '15%',
							renderComponent: StoreOrderProductAmountComponent,
						},
						price: {
							title: price,
							type: 'custom',
							width: '20%',
							renderComponent: StoreProductPriceComponent,
						},
						image: {
							title: image,
							type: 'custom',
							class: 'text-center',
							renderComponent: StoreProductImageComponent,
							filter: false,
						},
					},
					pager: {
						display: true,
						perPage: 5,
					},
				};
			});
	}

	private _applyTranslationOnSmartTable() {
		this.addProductsModalTranslates();
		this._translateService.onLangChange.subscribe(() => {
			this._loadSmartTableSettings();
			this.addProductsModalTranslates();
		});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
