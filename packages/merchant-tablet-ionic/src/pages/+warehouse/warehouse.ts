import { Component } from '@angular/core';
import { Mixpanel } from '@ionic-native/mixpanel/ngx';
import Order from '@modules/server.common/entities/Order';
import Warehouse from '@modules/server.common/entities/Warehouse';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { OrdersFilterModes } from '../../filters/orders-filters';
import _ from 'lodash';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { Store } from '../../../src/services/store.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import Product from '@modules/server.common/entities/Product';
import { PopoverController, ModalController } from '@ionic/angular';
import { CreateProductTypePopupPage } from './create-product-type-popup/create-product-type-popup';
import { EditProductTypePopupPage } from './edit-product-type-popup/edit-product-type-popup';

export enum OrderState {
	WarehousePreparation,
	WarehousePreparationProblem,
	InDelivery,
	Canceled,
	DeliveryProblem,
	Delivered,
}

@Component({
	selector: 'page-warehouse',
	templateUrl: 'warehouse.html',
	styleUrls: ['./warehouse.scss'],
})
export class WarehousePage {
	private warehouse$: any;
	filterMode: OrdersFilterModes = 'ready';
	warehouse: Warehouse;
	OrderState: any = OrderState;
	isOrderContainerLive: boolean = false;
	productsLoading: boolean = true;
	ordersCount: number;
	showRelevant: boolean = true;
	showAllProducts: boolean = false;
	focusedOrder: Order;
	focusedOrder$: any;

	constructor(
		// public navCtrl: NavController,
		// public navParams: NavParams,
		public popoverCtrl: PopoverController,
		public modalCtrl: ModalController,
		private orderRouter: OrderRouter,
		private warehouseProductsRouter: WarehouseProductsRouter,
		private mixpanel: Mixpanel,
		private translateProductLocales: ProductLocalesService,
		private store: Store,
		private barcodeScanner: BarcodeScanner
	) {}

	// ionViewDidLoad() {
	// 	if (!this.isLogged) {
	// 		this.navCtrl.setRoot('LoginPage');
	// 	}
	// }
	// TODO
	// async ionViewCanEnter() {
	// 	const isLogged = await this.store.isLogged();
	// 	return this.store.maintenanceMode === null && isLogged;
	// }

	get isLogged() {
		return localStorage.getItem('_warehouseId');
	}

	get warehouseId() {
		return localStorage.getItem('_warehouseId');
	}

	get language() {
		return localStorage.getItem('_language');
	}

	async scanBarcode() {
		try {
			const barcodeData = await this.barcodeScanner.scan();
			const orderId = barcodeData.text;
			if (orderId !== '') {
				this.focusedOrder$ = this.orderRouter
					.get(orderId, {
						populateCarrier: true,
						populateWarehouse: true,
					})
					.subscribe((order) => {
						if (
							order.warehouseStatus >=
							OrderWarehouseStatus.GivenToCarrier
						) {
							this.switchOrders(this.showRelevant);
						} else {
							this.focusedOrder = order;
						}
					});
			}
		} catch (error) {
			console.warn(error);
		}
	}

	switchOrders(showRelevant) {
		if (this.focusedOrder$) {
			this.focusedOrder$.unsubscribe();
		}
		this.focusedOrder = null;
		this.showRelevant = showRelevant;
	}

	onOrderFinish() {
		this.toggleOrderContainer();
	}

	toggleOrderContainer() {
		this.isOrderContainerLive = !this.isOrderContainerLive;
	}

	getWarehouseProductImageUrl(p: Product) {
		if (p instanceof Product) {
			const productImg = p.images.filter((i) =>
				i.locale.includes(this.language)
			)[0];
			if (productImg) {
				return productImg.url;
			}
			return p.images[0].url;
		}
	}

	truncateTitle(title: string) {
		if (title) {
			title = title.replace(/[ ]{2,}/, ' ');
			if (title.length <= 15) {
				return title;
			}
			return title.substring(0, 12) + '...';
		}
	}

	localeTranslate(member: ILocaleMember[]): string {
		if (member !== undefined) {
			return this.translateProductLocales.getTranslate(member);
		}
	}

	orderState(order: Order) {
		if (order.warehouseStatus >= 200) {
			return OrderState.WarehousePreparationProblem;
		}

		if (order.carrierStatus >= 200) {
			return OrderState.DeliveryProblem;
		}

		if (order.isCancelled) {
			return OrderState.Canceled;
		}

		if (order.carrierStatus === OrderCarrierStatus.DeliveryCompleted) {
			return OrderState.Delivered;
		}

		if (order.carrier == null) {
			return OrderState.WarehousePreparation;
		} else {
			return OrderState.InDelivery;
		}
	}

	updateOrderWarehouseStatus(orderId: string, status: OrderWarehouseStatus) {
		if (status >= 200) {
			if (this.mixpanel) {
				this.mixpanel.track('Order Failed');
			}
		}
		return this.orderRouter.updateWarehouseStatus(orderId, status);
	}

	addProduct(productId: string) {
		return this.warehouseProductsRouter.increaseCount(
			this.warehouseId,
			productId,
			1
		);
	}

	async presentCreateProductPopover() {
		const modal = await this.modalCtrl.create({
			component: CreateProductTypePopupPage,
			// backdropDismiss: false,
			cssClass: 'mutation-product-modal',
		});

		await modal.present();
	}

	async openEditProductModal(product) {
		const modal = await this.modalCtrl.create({
			component: EditProductTypePopupPage,
			// backdropDismiss: false,
			componentProps: { warehouseProduct: product },
			cssClass: 'mutation-product-modal',
		});

		await modal.present();
	}

	getWarehouseStatus(orderWarehouseStatusNumber: OrderWarehouseStatus) {
		const basePath = 'WAREHOUSE_VIEW.ORDER_WAREHOUSE_STATUSES.';
		switch (orderWarehouseStatusNumber) {
			case OrderWarehouseStatus.NoStatus:
				return basePath + 'CREATED';
			case OrderWarehouseStatus.ReadyForProcessing:
				return basePath + 'CONFIRMED';
			case OrderWarehouseStatus.WarehouseStartedProcessing:
				return basePath + 'PROCESSING';
			case OrderWarehouseStatus.AllocationStarted:
				return basePath + 'ALLOCATION_STARTED';
			case OrderWarehouseStatus.AllocationFinished:
				return basePath + 'ALLOCATION_FINISHED';
			case OrderWarehouseStatus.PackagingStarted:
				return basePath + 'PACKAGING_STARTED';
			case OrderWarehouseStatus.PackagingFinished:
				return basePath + 'PACKAGED';
			case OrderWarehouseStatus.GivenToCarrier:
				return basePath + 'GIVEN_TO_CARRIER';
			case OrderWarehouseStatus.GivenToCustomer:
				return basePath + 'TAKEN';
			case OrderWarehouseStatus.AllocationFailed:
				return basePath + 'ALLOCATION_FAILED';
			case OrderWarehouseStatus.PackagingFailed:
				return basePath + 'PACKAGING_FAILED';
			default:
				return basePath + 'BAD_STATUS';
		}
	}

	ionViewWillLeave() {
		if (this.warehouse$) {
			this.warehouse$.unsubscribe();
		}
		if (this.focusedOrder$) {
			this.focusedOrder$.unsubscribe();
		}
	}
}
