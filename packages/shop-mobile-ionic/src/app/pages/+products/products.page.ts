import { Component, OnDestroy, EventEmitter, OnInit } from '@angular/core';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { UserProductsRouter } from '@modules/client.common.angular2/routers/user-products-router.service';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import { takeUntil, first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Store } from '../../services/store.service';
import { Router } from '@angular/router';
import { IOrderCreateInput } from '@modules/server.common/routers/IWarehouseOrdersRouter';
import { OrderPage } from './+order/order.page';
import { ModalController } from '@ionic/angular';
import { environment } from 'environments/environment';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { GeoLocationService } from '../../services/geo-location';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import { OrderTakeawayInfoPopup } from './+order/takeaway/popup/popup.component';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';
import { GeoLocationProductsService } from 'app/services/geo-location/geo-location-products';
import { WarehouseProductsService } from 'app/services/merchants/warehouse-products';

const initializeProductsNumber: number = 10;

@Component({
	selector: 'e-cu-products',
	templateUrl: './products.page.html',
	styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit, OnDestroy {
	viewType: string = environment.PRODUCTS_VIEW_TYPE;
	products: ProductInfo[] = [];
	areProductsLoaded: boolean = false;
	soldOut: boolean;
	products_placeholder: string = '';
	modalOpen: boolean;
	modalChange = new EventEmitter<boolean>();
	isDeliveryRequired: boolean;
	merchant: Warehouse;
	productsCount: number;
	$areProductsLoaded = new EventEmitter<boolean>();
	changePage: boolean;

	private readonly ngDestroy$ = new Subject<void>();
	getOrdersGeoObj: { loc: ILocation };
	private lastLoadProductsCount: number;
	private lastImageOrientation: number;
	private productsLocale: string;

	constructor(
		private store: Store,
		private userRouter: UserRouter,
		private geoLocationProductsService: GeoLocationProductsService,
		private warehouseOrdersRouter: WarehouseOrdersRouter,
		private userProductsRouter: UserProductsRouter,
		private router: Router,
		private modalController: ModalController,
		private geoLocationService: GeoLocationService,
		private warehouseRouter: WarehouseRouter,
		private warehouseProductsService: WarehouseProductsService
	) {
		this.productsLocale = this.store.language || environment.DEFAULT_LOCALE;

		if (this.inStore) {
			this.store.deliveryType = DeliveryType.Takeaway;
			this.loadMerchant();
		}
		this.isDeliveryRequired =
			this.store.deliveryType === DeliveryType.Delivery;

		this._subscribeProductsPlaceholder();
		this.loadGeoLocationProducts();
		this.hasOrder();
		this.getModalChange();
	}

	get inStore() {
		return this.store.inStore;
	}

	get navigateToMerchants() {
		const merchantIds = environment['MERCHANT_IDS'];

		return (!merchantIds || merchantIds.length < 1) && !this.inStore;
	}

	ngOnInit(): void {
		this.continueOrder();
	}

	async buyItem(currentProduct: ProductInfo) {
		if (
			!this.store.userId &&
			this.store.registrationSystem === RegistrationSystem.Disabled
		) {
			this.store.registrationSystem = RegistrationSystem.Once;
			this.store.buyProduct = currentProduct.warehouseProduct.id;
			this.store.warehouseId = currentProduct.warehouseId;
			this.router.navigateByUrl('/invite');
		} else {
			const orderCreateInput: IOrderCreateInput = {
				warehouseId:
					currentProduct.warehouseId || this.store.warehouseId,
				products: [
					{
						count: 1,
						productId: currentProduct.warehouseProduct
							? currentProduct.warehouseProduct.product['id']
							: currentProduct.product.id,
					},
				],
				userId: this.store.userId,
				orderType: this.store.deliveryType,
				options: { autoConfirm: true },
			};

			try {
				const order = await this.warehouseOrdersRouter.create(
					orderCreateInput
				);

				this.store.orderId = order.id;

				this.store.orderWarehouseId = order.warehouseId;

				if (environment.ORDER_INFO_TYPE === 'popup') {
					this.showOrderInfoModal();
				}

				if (environment.ORDER_INFO_TYPE === 'page') {
					this.router.navigate([
						`${
							this.store.deliveryType === DeliveryType.Delivery
								? '/order-info'
								: '/order-info-takeaway'
						}`,
					]);
				}
			} catch (error) {
				const loadedProduct = this.products.find(
					(p) =>
						p.warehouseProduct.id ===
						currentProduct.warehouseProduct.id
				);
				if (loadedProduct) {
					loadedProduct['soldOut'] = true;
				}
			}
		}
	}

	toggleGetProductsType() {
		this.changePage = true;
		this.products = [];
		this.loadProducts({
			count: this.lastLoadProductsCount,
			imageOrientation: this.lastImageOrientation,
		});
	}

	changeStoreMode() {
		if (this.inStore) {
			this.store.clearInStore();
		} else {
			if (!this.navigateToMerchants) {
				// Here take first merchant id because all id's are from one merchant
				this.store.inStore = environment['MERCHANT_IDS'][0];

				this.loadMerchant();
			}
		}

		this.changePage = true;
		this.products = [];
		this.loadProducts({
			count: this.lastLoadProductsCount,
			imageOrientation: this.lastImageOrientation,
		});
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}

	private async showOrderInfoModal(): Promise<void> {
		const modal = await this.modalController.create({
			component:
				this.store.deliveryType === DeliveryType.Delivery
					? OrderPage
					: OrderTakeawayInfoPopup,
			cssClass: 'order-info-modal',
			showBackdrop: true,
			componentProps: { modalChange: this.modalChange },
		});

		this.modalChange.emit(true);

		return modal.present();
	}

	private async loadGeoLocationProducts() {
		let geoLocationForProducts: GeoLocation;

		const isProductionEnv = environment.production;

		if (this.store.userId && isProductionEnv) {
			const user = await this.userRouter
				.get(this.store.userId)
				.pipe(first())
				.toPromise();

			geoLocationForProducts = user.geoLocation;
		} else {
			try {
				geoLocationForProducts = await this.geoLocationService.getCurrentGeoLocation();
			} catch (error) {
				console.warn(error);
				this.store.registrationSystem = RegistrationSystem.Once;
				this.router.navigate(['/invite']);
			}
		}

		if (geoLocationForProducts) {
			this.getOrdersGeoObj = {
				loc: {
					type: 'Point',
					coordinates: geoLocationForProducts.loc.coordinates,
				},
			};
		}
	}

	async loadProducts(options = {}) {
		this.store.deliveryType = this.isDeliveryRequired
			? DeliveryType.Delivery
			: DeliveryType.Takeaway;

		const count = options['count'];
		const imageOrientation = options['imageOrientation'];

		this.lastLoadProductsCount = count;
		this.lastImageOrientation = imageOrientation;

		let merchantIds = environment['MERCHANT_IDS'];

		if ((!merchantIds || merchantIds.length === 0) && this.inStore) {
			merchantIds = [this.inStore];
		}

		await this.loadProductsCount(merchantIds, imageOrientation);

		this.changePage = false;

		if (this.productsCount > this.products.length) {
			if (this.getOrdersGeoObj) {
				this.areProductsLoaded = false;

				const isDeliveryRequired =
					this.store.deliveryType === DeliveryType.Delivery;
				const isTakeaway =
					this.store.deliveryType === DeliveryType.Takeaway;

				let loadProducts = true;

				this.geoLocationProductsService
					.geoLocationProductsByPaging(
						this.getOrdersGeoObj,
						{
							skip: this.products.length,
							limit: count ? count : initializeProductsNumber,
						},
						{
							isDeliveryRequired,
							isTakeaway,
							merchantIds,
							imageOrientation,
							locale: this.productsLocale,
							withoutCount: true,
						}
					)
					.pipe(takeUntil(this.ngDestroy$))
					.subscribe((products) => {
						if (!loadProducts) {
							for (const product of products) {
								const loadedProduct = this.products.find(
									(p) =>
										p.warehouseProduct.id ===
										product.warehouseProduct.id
								);
								if (loadedProduct) {
									loadedProduct['soldOut'] =
										product.warehouseProduct.count === 0;
								}
							}
						}

						if (loadProducts) {
							this.products.push(...products);
						}

						loadProducts = false;
						this.areProductsLoaded = true;
					});
			} else {
				this.store.registrationSystem = RegistrationSystem.Once;
				this.router.navigate(['/invite']);
			}
		} else {
			this.areProductsLoaded = true;
		}

		this.$areProductsLoaded.emit();
	}

	private async loadProductsCount(
		merchantIds?: string[],
		imageOrientation?: number
	) {
		if (this.getOrdersGeoObj) {
			const isDeliveryRequired =
				this.store.deliveryType === DeliveryType.Delivery;
			const isTakeaway =
				this.store.deliveryType === DeliveryType.Takeaway;

			this.productsCount = await this.geoLocationProductsService.getCountOfGeoLocationProducts(
				this.getOrdersGeoObj,
				{
					isDeliveryRequired,
					isTakeaway,
					merchantIds,
					imageOrientation,
					locale: this.productsLocale,
					withoutCount: true,
				}
			);
		}
	}

	private _subscribeProductsPlaceholder() {
		if (this.store.userId) {
			this.userProductsRouter
				.getPlaceholder(this.store.userId, this.store.deviceId)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe((placeholder) => {
					this.products_placeholder = placeholder;
				});
		}
	}

	private hasOrder() {
		if (this.store.orderId) {
			if (environment.ORDER_INFO_TYPE === 'popup') {
				this.showOrderInfoModal();
			}
		}
	}

	private getModalChange() {
		this.modalChange
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((result) => {
				this.modalOpen = result;
			});
	}

	private async continueOrder() {
		const buyProduct = this.store.buyProduct;

		if (buyProduct) {
			const userId = this.store.userId;
			const mechantId = this.store.warehouseId;

			if (userId && mechantId) {
				const productForBuy = await this.warehouseProductsService.getWarehouseProduct(
					mechantId,
					buyProduct
				);
				if (productForBuy) {
					this.buyItem(productForBuy);
					this.store.buyProduct = '';
					this.store.warehouseId = '';
				}
			} else {
				this.store.buyProduct = '';
				this.store.warehouseId = '';
			}
		}
	}

	private async loadMerchant() {
		if (this.store.inStore) {
			this.merchant = await this.warehouseRouter
				.get(this.store.inStore, false)
				.pipe(first())
				.toPromise();
		}
	}
}
