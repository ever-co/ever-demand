import { Component, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import Order from '@modules/server.common/entities/Order';
import { Store } from 'app/services/store.service';
import { Router } from '@angular/router';

@Component({
	selector: 'e-cu-issue',
	templateUrl: './issue.page.html',
	styleUrls: ['./issue.page.scss'],
})
export class IssuePage implements OnInit {
	public modalChange: EventEmitter<boolean>;
	public order: Order;
	public areIssuesDuringDelivery: boolean;
	public areIssuesDuringWarehouseProcessing: boolean;

	constructor(
		private readonly navParams: NavParams,
		private readonly orderRouter: OrderRouter,
		private readonly warehouseOrdersRouter: WarehouseOrdersRouter,
		private readonly store: Store,
		private router: Router,
		public modalController: ModalController
	) {
		this.modalChange = this.navParams.get('modalChange');
		this.areIssuesDuringDelivery = this.navParams.get(
			'areIssuesDuringDelivery'
		);
		this.areIssuesDuringWarehouseProcessing = this.navParams.get(
			'areIssuesDuringWarehouseProcessing'
		);
		this.order = this.navParams.get('order');
	}

	ngOnInit() {}

	async closePopup() {
		await this.warehouseOrdersRouter.cancel(this.order.id);
		if (this.order.isPaid) {
			await this.orderRouter.refundWithStripe(this.order.id);
		}

		localStorage.removeItem('startDate');
		localStorage.removeItem('endTime');
		this.store.orderId = null;

		this.router.navigate(['/products']);
		await this.modalController.dismiss();
	}
}
