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
import { map } from 'underscore';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { ToasterService } from 'angular2-toaster';

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
		private orderRouter: OrderRouter,
		private readonly _toasterService: ToasterService
	) {
		this.enumOrderCarrierStatus = OrderCarrierStatus;
	}

	public get ordersIds(): string[] {
		this.orders.push(this.selectedOrder);
		return map(this.orders, (order) => order.id);
	}

	public get ordersCarrierStatus() {
		return this.selectedOrder ? this.selectedOrder.carrierStatus : null;
	}

	async selectOrdersForDelivery() {
		// One request at a time: the Picked up and Cancel buttons appear as
		// soon as Start is pressed, so a double-click on Start would start a
		// pick up that saves this select's unconfirmed status as its own.
		if (this.loading) {
			return;
		}

		this.pageBtnStates.isSelectOrdersForDeliveryAvailable = false;

		// The status is set before the server answers, so keep the old one:
		// the server refuses when another carrier took the order or it was
		// cancelled, and the card must then show the Start button again.
		const order = this.selectedOrder;
		const previousCarrierStatus = order.carrierStatus;

		order.carrierStatus = this.enumOrderCarrierStatus.CarrierSelectedOrder;

		this.loading = true;

		try {
			await this.carrierOrdersRouter.selectedForDelivery(
				this.selectedCarrier.id,
				this.ordersIds
			);
		} catch (error) {
			order.carrierStatus = previousCarrierStatus;
			this._showError(error);
		} finally {
			this.loading = false;

			this.pageBtnStates.isSelectOrdersForDeliveryAvailable = true;
		}
	}

	async updateCarrierOrdersStatus(status: OrderCarrierStatus) {
		if (this.loading) {
			return;
		}

		this.pageBtnStates.isCarrierPickupOrder = false;

		this.loading = true;

		const order = this.selectedOrder;
		const previousCarrierStatus = order.carrierStatus;

		order.carrierStatus = status;

		try {
			this.selectedOrder = await this.orderRouter.updateCarrierStatus(
				order.id,
				status
			);

			this.getChangeOrder.emit(this.selectedOrder);
		} catch (error) {
			order.carrierStatus = previousCarrierStatus;
			this._showError(error);
		} finally {
			this.loading = false;

			this.pageBtnStates.isCarrierPickupOrder = true;
		}
	}

	async cancelDelivery() {
		if (this.loading) {
			return;
		}

		this.pageBtnStates.isCarrierPickupOrder = false;

		this.loading = true;

		try {
			await this.carrierOrdersRouter.cancelDelivery(
				this.selectedCarrier.id,
				this.ordersIds
			);

			this.selectedOrder = null;
			this.getChangeOrder.emit(null);
		} catch (error) {
			this._showError(error);
		} finally {
			this.loading = false;
			this.pageBtnStates.isCarrierPickupOrder = true;
		}
	}

	ngOnDestroy() {}

	private _showError(error: any) {
		this._toasterService.pop(
			'error',
			error && error.message ? error.message : `${error}`
		);
	}
}
