import { Component, OnDestroy } from '@angular/core';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import ICarrier from '@modules/server.common/interfaces/ICarrier';
import IOrder from '@modules/server.common/interfaces/IOrder';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { first, takeUntil } from 'rxjs/operators';
import { Store } from 'services/store.service';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { Subject } from 'rxjs';
import { NavController } from '@ionic/angular';

@Component({
	selector: 'page-return-product',
	templateUrl: 'return-product.html',
})
export class ReturnProductPage implements OnDestroy {
	carrier: ICarrier;
	selectedOrder: IOrder;

	private destroy$ = new Subject<void>();

	constructor(
		private translateProductLocales: ProductLocalesService,
		private carrierRouter: CarrierRouter,
		private orderRouter: OrderRouter,
		private store: Store,
		private navCtrl: NavController
	) {}

	get allowCancel() {
		switch (this.store.returnProductFrom) {
			case 'driveToWarehouse':
				return false;
			case 'startingDelivery':
				return this.selectedOrder && !this.selectedOrder.isCancelled;
			default:
				return false;
		}
	}

	ionViewWillEnter() {
		this.loadData();
	}

	localeTranslate(member: ILocaleMember[]) {
		return this.translateProductLocales.getTranslate(member);
	}

	cancelReturn() {
		if (!this.allowCancel) throw new Error('Cancel not allowed!');

		this.navCtrl.navigateRoot('/main/starting-delivery');
	}

	async returnProduct() {
		if (!this.selectedOrder.isCancelled) {
			await this.orderRouter.updateCarrierStatus(
				this.store.orderId,
				OrderCarrierStatus.IssuesDuringDelivery
			);

			this.unselectOrder();

			this.navCtrl.navigateRoot('/main/home');
		} else {
			this.unselectOrder();
			this.navCtrl.navigateRoot('/main/home');
		}
	}

	ionViewWillLeave() {
		localStorage.removeItem('returnProductFrom');
	}

	private async loadData() {
		this.carrier = await this.carrierRouter
			.get(this.store.carrierId)
			.pipe(first())
			.toPromise();

		this.orderRouter
			.get(this.store.orderId, {
				populateWarehouse: true,
			})
			.pipe(takeUntil(this.destroy$))
			.subscribe((o) => {
				this.selectedOrder = o;
				this.store.selectedOrder = o;
			});
	}

	private unselectOrder() {
		localStorage.removeItem('orderId');
		this.store.selectedOrder = null;
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
