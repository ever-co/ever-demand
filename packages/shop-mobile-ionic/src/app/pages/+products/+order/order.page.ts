import {
	Component,
	OnDestroy,
	OnInit,
	EventEmitter,
	ViewChild,
} from '@angular/core';
import IWarehouse from '@modules/server.common/interfaces/IWarehouse';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { TranslateService } from '@ngx-translate/core';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import Order from '@modules/server.common/entities/Order';
import { Subscription } from 'rxjs';
import { PopoverController, NavParams, ModalController } from '@ionic/angular';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { Store } from '../../../services/store.service';
import { CancelPage } from './+cancel/cancel.page';
import { ElapsedTimeComponent } from '../../../components/elapsed-time/elapsed-time.component';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';

export enum DeliveryStatus {
	Warehouse,
	Carrier,
	Customer,
	Completed,
}

@Component({
	templateUrl: './order.page.html',
	styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit, OnDestroy {
	public order: Order | null = null;

	public warehouse: IWarehouse | null = null;

	public paymentsEnabled: boolean = true;

	public delivered: boolean;

	public modalChange: EventEmitter<boolean>;

	@ViewChild('elapsedTime')
	elapsedTime: ElapsedTimeComponent;

	private _pageSubscriptions: Subscription[] = [];
	private pop: PopoverController;
	constructor(
		public readonly popoverCtrl: PopoverController,
		private readonly orderRouter: OrderRouter,
		private readonly warehouseOrdersRouter: WarehouseOrdersRouter,
		private readonly warehouseRouter: WarehouseRouter,
		private readonly _translateService: TranslateService,
		private readonly store: Store,
		private readonly navParams: NavParams,
		public modalController: ModalController
	) {
		this._trackOrder();
		this.warehouseByOrder();

		this.pop = navParams.get('popoverController');
		this.modalChange = navParams.get('modalChange');
	}

	ngOnInit() {
		if (!this.store.startOrderDate) {
			this.store.startOrderDate = new Date().toString();
		}
	}

	ngOnDestroy() {
		this._unsubscribeAll();
		this.clearTimer();
	}

	public get isCustomerActive() {
		return this.currentStatus >= DeliveryStatus.Customer;
	}

	public get isCustomerCurrent() {
		const isCurrent = this.currentStatus === DeliveryStatus.Customer;
		if (
			isCurrent !== this.delivered &&
			!isCurrent &&
			this.isCustomerActive
		) {
			this.store.endOrderTime = this.elapsedTime.timePasssed;
			this.clearTimer();
		}
		this.delivered = isCurrent;
		return isCurrent;
	}

	public get isWarehouseActive() {
		return this.currentStatus >= DeliveryStatus.Warehouse;
	}

	public get isWarehouseCurrent() {
		return (
			this.currentStatus === DeliveryStatus.Warehouse &&
			this.order &&
			!this.order.isCancelled
		);
	}

	public get isCarrierActive() {
		return this.currentStatus >= DeliveryStatus.Carrier;
	}

	public get isCarrierCurrent() {
		return this.currentStatus === DeliveryStatus.Carrier;
	}

	public get areIssues() {
		return (
			this.areIssuesDuringDelivery ||
			this.areIssuesDuringWarehouseProcessing
		);
	}

	protected get orderId() {
		return this.store.orderId;
	}

	protected get userId() {
		return this.store.userId;
	}

	private get _currentOrderWarehouseId() {
		return this.store.orderWarehouseId;
	}

	public get areIssuesDuringDelivery() {
		if (this.order == null) {
			return false;
		}

		return (
			this.order.carrierStatus >= OrderCarrierStatus.IssuesDuringDelivery
		);
	}

	public get areIssuesDuringWarehouseProcessing() {
		if (this.order == null) {
			return false;
		}
		return (
			this.order.warehouseStatus >= OrderWarehouseStatus.AllocationFailed
		);
	}

	public get currentStatus(): DeliveryStatus {
		if (this.order == null) {
			return DeliveryStatus.Warehouse;
		}

		if (this.order['isCompleted'] && !this.order['isCancelled']) {
			return DeliveryStatus.Completed;
		} else if (
			this.order.carrierStatus >=
			OrderCarrierStatus.CarrierArrivedToCustomer
		) {
			return DeliveryStatus.Customer;
		} else if (
			this.order.carrierStatus >= OrderCarrierStatus.CarrierPickedUpOrder
		) {
			return DeliveryStatus.Carrier;
		} else {
			return DeliveryStatus.Warehouse;
		}
	}

	public get deliveryTimeRange(): string {
		if (this.order == null) {
			return '';
		}

		let deliveryTimeMin = 0;
		let deliveryTimeMax = 0;

		this.order.products.forEach((product) => {
			if (
				product.deliveryTimeMin &&
				product.deliveryTimeMin > deliveryTimeMin
			) {
				deliveryTimeMin = product.deliveryTimeMin;
			}
			if (
				product.deliveryTimeMax &&
				product.deliveryTimeMax > deliveryTimeMax
			) {
				deliveryTimeMax = product.deliveryTimeMax;
			}
		});
		if (deliveryTimeMin !== 0 && deliveryTimeMax !== 0) {
			return deliveryTimeMin + '-' + deliveryTimeMax;
		}
		if (deliveryTimeMin !== 0) {
			return deliveryTimeMin.toString();
		}
		if (deliveryTimeMax !== 0) {
			return deliveryTimeMax.toString();
		}
		return 30 + '-' + 60;
	}

	public get byPopupStatuses() {
		// this is workaround for access language assets from array.
		const popupStatuses = `BUY_POPUP.${
			this.order && this.order.isCancelled ? 'CANCEL.' : ''
		}STATUSES.${this.currentStatus}`;
		let result: string = '';

		const getTitle = () => {
			const sub: Subscription = this._translateService
				.get(popupStatuses + '.TITLE')
				.subscribe((t) => (result = t));
			this._pageSubscriptions.push(sub);
			return result;
		};

		const getDetails = () => {
			const sub: Subscription = this._translateService
				.get(popupStatuses + '.DETAILS')
				.subscribe((d) => (result = d));
			this._pageSubscriptions.push(sub);
			return result.replace('%t', this.deliveryTimeRange);
		};

		const getPaidNote = () => {
			const sub: Subscription = this._translateService
				.get(popupStatuses + '.NOT_PAID_NOTE')
				.subscribe((n) => (result = n));
			this._pageSubscriptions.push(sub);
			return result.replace(
				'%s',
				`${
					this.order
						? (<Order>this.order).totalPrice.toFixed(2)
						: '00.00'
				}$`
			);
		};

		return {
			TITLE: getTitle(),
			DETAILS: getDetails(),
			NOT_PAID_NOTE: getPaidNote(),
		};
	}

	warehouseByOrder() {
		const sub: Subscription = this.warehouseRouter
			.get(this._currentOrderWarehouseId)
			.subscribe(
				(warehouse) =>
					(this.paymentsEnabled = warehouse.isPaymentEnabled)
			);

		this._pageSubscriptions.push(sub);
	}

	clearTimer() {
		clearInterval(this.elapsedTime.timer);
	}

	protected undo() {
		this.modalController.dismiss();
		this.showCancelOrderInfoModal();
	}

	protected async closePopup() {
		this.modalChange.emit(false);
		if (this.areIssues) {
			await this._orderCancel();
		}

		localStorage.removeItem('startDate');
		localStorage.removeItem('endTime');
		this.store.orderId = null;
		this.modalController.dismiss();
	}

	// For delivery-status
	private _trackOrder() {
		const orderRouterOptions = {
			populateWarehouse: true,
			populateCarrier: true,
		};

		const sub: Subscription = this.orderRouter
			.get(this.orderId, orderRouterOptions)
			.subscribe((order) => (this.order = order));

		this._pageSubscriptions.push(sub);
	}

	private async showCancelOrderInfoModal(): Promise<void> {
		const modal = await this.modalController.create({
			component: CancelPage,
			cssClass: 'order-info-modal',
			componentProps: { modalChange: this.modalChange },
		});
		return modal.present();
	}

	private async _orderCancel() {
		const order = await this.warehouseOrdersRouter.cancel(this.orderId);

		console.log(`order Cancelled: ${order.id}`);

		if (order.isPaid) {
			await this.orderRouter.refundWithStripe(order.id);
		}
	}

	private _unsubscribeAll() {
		this._pageSubscriptions.forEach((s) => s.unsubscribe());
	}
}
