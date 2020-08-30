import {
	Component,
	Input,
	OnDestroy,
	Output,
	EventEmitter,
} from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import Carrier from '@modules/server.common/entities/Carrier';
import { CarrierOrdersRouter } from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import _ from 'lodash';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';

@Component({
	selector: 'ea-carrier-orders-status',
	styleUrls: ['./carrier-orders-status.component.scss'],
	templateUrl: 'carrier-orders-status.component.html',
})
export class CarrierOrdersStatusComponent implements OnDestroy {
	@Input()
	selectedOrder: Order;
	@Input()
	selectedCarrier: Carrier;

	@Output()
	getChangeOrder = new EventEmitter<Order>();

	enumOrderCarrierStatus: typeof OrderCarrierStatus;
	canControlNEw: boolean;

	public orders: Order[] = [];
	public loading: boolean;

	protected pageBtnStates: any = {
		isSelectOrdersForDeliveryAvailable: true,
		isCarrierPickupOrder: true,
	};

	constructor(
		private carrierOrdersRouter: CarrierOrdersRouter,
		private orderRouter: OrderRouter
	) {
		this.enumOrderCarrierStatus = OrderCarrierStatus;
	}

	public get ordersIds(): string[] {
		this.orders.push(this.selectedOrder);
		return _.map(this.orders, (order) => order.id);
	}

	public get ordersCarrierStatus() {
		return this.selectedOrder ? this.selectedOrder.carrierStatus : null;
	}

	async selectOrdersForDelivery() {
		this.pageBtnStates.isSelectOrdersForDeliveryAvailable = false;

		this.selectedOrder.carrierStatus = this.enumOrderCarrierStatus.CarrierSelectedOrder;

		this.loading = true;

		await this.carrierOrdersRouter.selectedForDelivery(
			this.selectedCarrier.id,
			this.ordersIds
		);

		this.loading = false;

		this.pageBtnStates.isSelectOrdersForDeliveryAvailable = true;
	}

	async updateCarrierOrdersStatus(status: OrderCarrierStatus) {
		this.pageBtnStates.isCarrierPickupOrder = false;

		this.loading = true;

		this.selectedOrder.carrierStatus = status;

		this.selectedOrder = await this.orderRouter.updateCarrierStatus(
			this.selectedOrder.id,
			status
		);

		this.getChangeOrder.emit(this.selectedOrder);

		this.loading = false;

		this.pageBtnStates.isCarrierPickupOrder = true;
	}

	async cancelDelivery() {
		this.pageBtnStates.isCarrierPickupOrder = false;

		this.loading = true;

		await this.carrierOrdersRouter.cancelDelivery(
			this.selectedCarrier.id,
			this.ordersIds
		);

		this.selectedOrder = null;
		this.getChangeOrder.emit(null);
		this.loading = false;
		this.pageBtnStates.isCarrierPickupOrder = true;
	}

	ngOnDestroy() {}
}
