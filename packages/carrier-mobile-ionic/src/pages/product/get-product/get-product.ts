import { Component, OnDestroy } from '@angular/core';
import ICarrier from '@modules/server.common/interfaces/ICarrier';
import IOrder from '@modules/server.common/interfaces/IOrder';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { CarrierOrdersRouter } from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { Store } from '../../../services/store.service';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NavController } from '@ionic/angular';
import { environment } from 'environments/environment';

@Component({
	selector: 'page-get-product',
	templateUrl: 'get-product.html',
	styleUrls: ['./get-product.scss'],
})
export class GetProductPage implements OnDestroy {
	carrier: ICarrier;
	selectedOrder: IOrder;
	disabledButtons: boolean = true;
	private productsLocale: string;
	selectedProductImages: any;
	selectedProductTitles: any;
	orderCarrierCompetition: boolean;
	isTakenFromAnotherCarrier: boolean = false;

	private destroy$ = new Subject<void>();
	constructor(
		private orderRouter: OrderRouter,
		private carrierRouter: CarrierRouter,
		private carrierOrdersRouter: CarrierOrdersRouter,
		private _translateProductLocales: ProductLocalesService,
		private store: Store,
		private navCtrl: NavController
	) {
		this.productsLocale =
			this.store.language || environment.DEFAULT_LANGUAGE;
	}

	ionViewWillEnter() {
		this.loadData();
	}

	async gotProduct() {
		this.disabledButtons = true;
		if (this.carrier && this.selectedOrder) {
			await this.carrierOrdersRouter.updateStatus(
				this.carrier['id'],
				OrderCarrierStatus.CarrierPickedUpOrder
			);

			this.navCtrl.navigateRoot('/main/starting-delivery');
		} else {
			// TODO: replace with popup
			alert('Try again!');
		}
		this.disabledButtons = false;
	}
	async gotProductWithCarrierCompetition() {
		this.disabledButtons = true;
		if (this.carrier && this.selectedOrder) {
			await this.carrierOrdersRouter.selectedForDelivery(
				this.carrier['id'],
				[this.selectedOrder['id']],
				this.orderCarrierCompetition
			);

			this.navCtrl.navigateRoot('/main/starting-delivery');
		} else {
			// TODO: replace with popup
			alert('Try again!');
		}
		this.disabledButtons = false;
	}

	async cancelWork() {
		this.disabledButtons = true;
		if (this.carrier && this.selectedOrder) {
			await this.carrierOrdersRouter.cancelDelivery(this.carrier['id'], [
				this.selectedOrder['id'],
			]);

			this.unselectOrder();
		} else {
			// 	// TODO: replace with popup
			alert('Try again!');
		}
		this.disabledButtons = false;
	}

	localeTranslate(member: ILocaleMember[]): string {
		return this._translateProductLocales.getTranslate(member);
	}

	private async loadData() {
		this.carrier = await this.carrierRouter
			.get(this.store.carrierId)
			.pipe(first())
			.toPromise();
		await this.orderRouter
			.get(this.store.orderId, {
				populateWarehouse: true,
			})
			.pipe(takeUntil(this.destroy$))
			.subscribe((o) => {
				this.orderCarrierCompetition =
					o.warehouse['carrierCompetition'];

				this.isTakenFromAnotherCarrier =
					!!o.carrierId &&
					o.carrierId !== this.carrier._id &&
					o.carrierStatus >
						(this.orderCarrierCompetition
							? OrderCarrierStatus.CarrierSelectedOrder
							: OrderCarrierStatus.NoCarrier);

				this.selectedOrder = o;
				this.store.selectedOrder = o;
				this.disabledButtons = false;
				const imageUrls = [];
				const titles = [];
				this.selectedOrder.products.forEach((x) => {
					x.product.images.forEach((x) => {
						if (x.locale.match(this.productsLocale)) {
							imageUrls.push(x.url);
						}
					});
				});
				this.selectedOrder.products.forEach((x) => {
					x.product.title.forEach((x) => {
						if (x.locale.match(this.productsLocale)) {
							titles.push(x.value);
						}
					});
				});

				this.selectedProductImages = imageUrls;
				this.selectedProductTitles = titles;
			});
	}

	unselectOrder() {
		this.store.selectedOrder = null;
		localStorage.removeItem('orderId');

		this.navCtrl.navigateRoot('/main/home');
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
