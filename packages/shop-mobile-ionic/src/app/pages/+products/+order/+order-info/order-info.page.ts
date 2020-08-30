import {
	Component,
	OnInit,
	ViewChild,
	EventEmitter,
	OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import Order from '@modules/server.common/entities/Order';
import { DeliveryStatus } from '../order.page';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import IWarehouse from '@modules/server.common/interfaces/IWarehouse';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '../../../../services/store.service';
import { ModalController } from '@ionic/angular';
import { CancelPage } from '../+cancel/cancel.page';
import { IssuePage } from '../issue/issue.page';
import { takeUntil } from 'rxjs/operators';
import { ElapsedTimeComponent } from 'app/components/elapsed-time/elapsed-time.component';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';

@Component({
	selector: 'e-cu-order-info',
	templateUrl: './order-info.page.html',
	styleUrls: ['./order-info.page.scss'],
})
export class OrderInfoPage implements OnInit, OnDestroy {
	public order: Order | null = null;

	public warehouse: IWarehouse | null = null;

	public paymentsEnabled: boolean = true;

	public delivered: boolean;

	@ViewChild('elapsedTime')
	elapsedTime: ElapsedTimeComponent;

	public modalOpen: boolean;
	public modalChange = new EventEmitter<boolean>();
	private readonly ngDestroy$ = new Subject<void>();

	private _pageSubscriptions: Subscription[] = [];
	constructor(
		private readonly orderRouter: OrderRouter,
		private readonly warehouseRouter: WarehouseRouter,
		private readonly _translateService: TranslateService,
		private readonly store: Store,
		public modalController: ModalController,
		private router: Router
	) {
		this._trackOrder();
		this.warehouseByOrder();
		this.getModalChange();
	}

	ngOnInit() {
		if (!this.store.startOrderDate) {
			this.store.startOrderDate = new Date().toString();
		}
	}

	ngOnDestroy() {
		console.warn('OrderInfoPage did leave');

		this.closePopup();
		this._unsubscribeAll();
		this.clearTimer();

		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}

	goToProductPage() {
		this.router.navigateByUrl('/products');
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
		return localStorage.getItem('_orderId');
	}

	protected get userId() {
		return this.store.userId;
	}

	private get _currentOrderWarehouseId() {
		return this.store.orderWarehouseId;
	}

	public get areIssuesDuringDelivery() {
		if (this.order == null) {
			return true;
		}

		return (
			this.order.carrierStatus >= OrderCarrierStatus.IssuesDuringDelivery
		);
	}

	public get areIssuesDuringWarehouseProcessing() {
		if (this.order == null) {
			return true;
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

	undo() {
		this.showCancelOrderInfoModal();
	}

	private async showCancelOrderInfoModal(): Promise<void> {
		const modal = await this.modalController.create({
			component: CancelPage,
			cssClass: 'order-info-modal',
			componentProps: {
				modalChange: this.modalChange,
			},
		});
		this.modalChange.emit(true);
		return modal.present();
	}

	async closePopup() {
		localStorage.removeItem('startDate');
		localStorage.removeItem('endTime');
		this.store.orderId = null;
		this.router.navigate(['/products']);
	}

	// For delivery-status
	private _trackOrder() {
		const orderRouterOptions = {
			populateWarehouse: true,
			populateCarrier: true,
		};

		const sub: Subscription = this.orderRouter
			.get(this.orderId, orderRouterOptions)
			.subscribe((order: Order) => {
				this.order = order;
				if (this.areIssues && !this.modalOpen) {
					this.showIssueOrderInfoModal();
				}
			});

		this._pageSubscriptions.push(sub);
	}

	private async showIssueOrderInfoModal(): Promise<void> {
		const modal = await this.modalController.create({
			component: IssuePage,
			cssClass: 'order-info-modal',
			componentProps: {
				modalChange: this.modalChange,
				areIssuesDuringDelivery: this.areIssuesDuringDelivery,
				areIssuesDuringWarehouseProcessing: this
					.areIssuesDuringWarehouseProcessing,
				order: this.order,
			},
		});
		this.clearTimer();
		this.modalChange.emit(true);
		return modal.present();
	}

	private _unsubscribeAll() {
		this._pageSubscriptions.forEach((s) => s.unsubscribe());
	}

	private getModalChange() {
		this.modalChange
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((result) => {
				this.modalOpen = result;
			});
	}
}
