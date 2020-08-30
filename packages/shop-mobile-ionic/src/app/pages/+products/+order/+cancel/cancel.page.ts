import { Component, OnInit, EventEmitter } from '@angular/core';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { PopoverController, ModalController, NavParams } from '@ionic/angular';
import { Store } from '../../../../services/store.service';
import { OrderPage } from '../order.page';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import { OrderTakeawayInfoPopup } from '../takeaway/popup/popup.component';

@Component({
	selector: 'e-cu-cancel',
	templateUrl: './cancel.page.html',
	styleUrls: ['./cancel.page.scss'],
})
export class CancelPage {
	public modalChange: EventEmitter<boolean>;

	constructor(
		public readonly popoverCtrl: PopoverController,
		private readonly warehouseOrdersRouter: WarehouseOrdersRouter,
		private readonly orderRouter: OrderRouter,
		private readonly store: Store,
		public modalController: ModalController,
		private router: Router,
		private readonly navParams: NavParams
	) {
		this.modalChange = navParams.get('modalChange');
	}

	private async _orderCancel() {
		const orderId = this.store.orderId;
		const order = await this.warehouseOrdersRouter.cancel(orderId);
		localStorage.removeItem('startDate');
		localStorage.removeItem('endTime');
		console.log(`order Cancelled: ${order.id}`);

		if (order.isPaid) {
			await this.orderRouter.refundWithStripe(order.id);
		}
	}

	async closePopup() {
		if (this.modalChange) {
			this.modalChange.emit(false);
		}
		await this._orderCancel();
		this.store.orderId = null;

		if (environment.ORDER_INFO_TYPE === 'page') {
			this.router.navigate(['/products']);
		}

		await this.modalController.dismiss();
	}

	async showOrderInfo() {
		this.modalController.dismiss();
		if (environment.ORDER_INFO_TYPE === 'popup') {
			this.showOrderInfoModal();
		}

		if (environment.ORDER_INFO_TYPE === 'page' && this.modalChange) {
			this.modalChange.emit(false);
		}
	}

	private async showOrderInfoModal(): Promise<void> {
		const modal = await this.modalController.create({
			component:
				this.store.deliveryType === DeliveryType.Delivery
					? OrderPage
					: OrderTakeawayInfoPopup,
			cssClass: 'order-info-modal',
			componentProps: { modalChange: this.modalChange },
		});
		return modal.present();
	}
}
