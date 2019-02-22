import { Component, OnDestroy, EventEmitter } from '@angular/core';
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
import { NavController, ModalController } from '@ionic/angular';
import { environment } from 'environment';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { GeoLocationService } from '../../services/geo-location';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';
import DeliveryType from '@modules/server.common/enums/DeliveryType';

import { GeoLocationProductsRouter } from '@modules/client.common.angular2/routers/geo-location-products-router.service';
import { OrderTakeawayInfoPopup } from './+order/takeaway/popup/popup.component';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import Warehouse from '@modules/server.common/entities/Warehouse';

@Component({
	selector: 'e-cu-products',
	templateUrl: './products.page.html',
	styleUrls: ['./products.page.scss']
})
export class ProductsPage implements OnDestroy {
	public viewType: string = environment.PRODUCTS_VIEW_TYPE;
	public products: ProductInfo[] = [];
	public areProductsLoaded: boolean;
	public soldOut: boolean;
	public products_placeholder: string = '';
	public modalOpen: boolean;
	public modalChange = new EventEmitter<boolean>();
	public isDeliveryRequired: boolean;
	merchant: Warehouse;

	private readonly ngDestroy$ = new Subject<void>();
	private $products: any;

	constructor(
		private store: Store,
		private userRouter: UserRouter,
		private geoLocationProductsRouter: GeoLocationProductsRouter,
		private warehouseOrdersRouter: WarehouseOrdersRouter,
		private userProductsRouter: UserProductsRouter,
		private router: Router,
		public modalController: ModalController,
		public geoLocationService: GeoLocationService,
		public navCtrl: NavController,
		public warehouseRouter: WarehouseRouter
	) {
		if (this.inStore) {
			this.store.deliveryType = DeliveryType.Takeaway;
			this.loadMerchant();
		}
		this.isDeliveryRequired =
			this.store.deliveryType === DeliveryType.Delivery;

		this._subscribeProductsPlaceholder();
		this._subscribeGeoLocationProducts(this.isDeliveryRequired);
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

	async buyItem(currentProduct: ProductInfo) {
		if (
			!this.store.userId &&
			this.store.registrationSystem === RegistrationSystem.Disabled
		) {
			this.store.registrationSystem = RegistrationSystem.Once;
			this.store.buyProduct = currentProduct.warehouseProduct.id;
			this.navCtrl.navigateRoot('/invite');
		} else {
			const orderCreateInput: IOrderCreateInput = {
				warehouseId: currentProduct.warehouseId,
				products: [{ count: 1, productId: currentProduct.product.id }],
				userId: this.store.userId,
				orderType: this.store.deliveryType,
				options: { autoConfirm: true }
			};

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
					}`
				]);
			}
		}
	}

	toggleGetProductsType() {
		this._subscribeGeoLocationProducts(this.isDeliveryRequired);
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
		this._subscribeGeoLocationProducts(this.isDeliveryRequired);
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
			componentProps: { modalChange: this.modalChange }
		});

		this.modalChange.emit(true);

		return modal.present();
	}

	private async _subscribeGeoLocationProducts(isDeliveryRequired: boolean) {
		this.areProductsLoaded = false;
		if (this.$products) {
			this.$products.unsubscribe();
		}

		this.store.deliveryType = this.isDeliveryRequired
			? DeliveryType.Delivery
			: DeliveryType.Takeaway;

		let geoLocationForProducts: GeoLocation;

		if (this.store.userId) {
			const user = await this.userRouter
				.get(this.store.userId)
				.pipe(first())
				.toPromise();

			geoLocationForProducts = user.geoLocation;
		} else {
			geoLocationForProducts = await this.geoLocationService.getCurrentGeoLocation();
		}

		this.$products = this.geoLocationProductsRouter
			.get(geoLocationForProducts, {
				isDeliveryRequired,
				isTakeaway: !isDeliveryRequired
			})
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((products = []) => {
				this.areProductsLoaded = true;
				let merchantIds = environment['MERCHANT_IDS'];
				if (!merchantIds && this.inStore) {
					merchantIds = [this.inStore];
				}
				if (merchantIds && merchantIds.length > 0) {
					this.products = products.filter((product: ProductInfo) => {
						return merchantIds.includes(
							product.warehouseId.toString()
						);
					});
				} else {
					this.products = products;
				}
				this.continueOrder();
			});
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

	private continueOrder() {
		const buyProductId = this.store.buyProduct;

		if (buyProductId && buyProductId !== 'null') {
			const products = this.products.filter(
				(p: ProductInfo) => p.warehouseProduct.id === buyProductId
			);

			// "[0]" is used because filter return array but we filter by id
			// and we are sure that will return product or undefined
			const productForBuy = products[0];
			if (this.store.userId) {
				if (productForBuy) {
					this.buyItem(productForBuy);
					this.store.buyProduct = null;
				}
			} else {
				this.store.buyProduct = null;
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
