import {
	OnInit,
	Component,
	EventEmitter,
	ViewChild,
	OnDestroy,
} from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import Order from '@modules/server.common/entities/Order';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import { ModalController } from '@ionic/angular';
import { Store } from 'app/services/store.service';
import { IssuePage } from '../../issue/issue.page';
import { Router } from '@angular/router';
import { CancelPage } from '../../+cancel/cancel.page';
import { takeUntil } from 'rxjs/operators';
import { OrderStoreInfo } from './store-info/store-info.component';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';

@Component({
	templateUrl: './takeaway-page.page.html',
	styleUrls: ['./takeaway-page.page.scss'],
})
export class OrderTakeawayInfoPage implements OnInit, OnDestroy {
	@ViewChild('storeInfo')
	storeInfo: OrderStoreInfo;

	modalOpen: boolean;

	order: Order | null = null;
	modalChange = new EventEmitter<boolean>();
	productsInfo: boolean;
	paymentsEnabled: boolean = true;

	private _pageSubscriptions: Subscription[] = [];
	private readonly ngDestroy$ = new Subject<void>();

	constructor(
		private readonly orderRouter: OrderRouter,
		private readonly store: Store,
		public modalController: ModalController,
		private router: Router,
		private readonly warehouseRouter: WarehouseRouter
	) {
		this._trackOrder();
		this.warehouseByOrder();
		this.getModalChange();
	}

	ngOnInit(): void {
		console.warn('OrderTakeawayInfoPage Initialize.');

		if (!this.store.startOrderDate) {
			this.store.startOrderDate = new Date().toString();
		}
	}

	get areIssuesDuringDelivery() {
		if (this.order == null) {
			return true;
		}

		return (
			this.order.carrierStatus >= OrderCarrierStatus.IssuesDuringDelivery
		);
	}

	get areIssuesDuringWarehouseProcessing() {
		if (this.order == null) {
			return true;
		}
		return (
			this.order.warehouseStatus >= OrderWarehouseStatus.AllocationFailed
		);
	}

	get areIssues() {
		return (
			this.areIssuesDuringDelivery ||
			this.areIssuesDuringWarehouseProcessing
		);
	}

	goToProductPage() {
		this.router.navigateByUrl('/products');
	}

	undo() {
		this.showCancelOrderInfoModal();
	}

	completeOrder() {
		localStorage.removeItem('startDate');
		localStorage.removeItem('endTime');
		this.store.orderId = null;
		this.router.navigate(['/products']);
	}

	clearTimer() {
		if (this.storeInfo) {
			clearInterval(this.storeInfo.elapsedTime.timer);
		}
	}

	warehouseByOrder() {
		const sub: Subscription = this.warehouseRouter
			.get(this.store.orderWarehouseId)
			.subscribe(
				(warehouse) =>
					(this.paymentsEnabled = warehouse.isPaymentEnabled)
			);

		this._pageSubscriptions.push(sub);
	}

	private _trackOrder() {
		const orderRouterOptions = {
			populateWarehouse: true,
			populateCarrier: true,
		};

		const sub: Subscription = this.orderRouter
			.get(this.store.orderId, orderRouterOptions)
			.subscribe((order: Order) => {
				this.order = order;
				if (this.areIssues && !this.modalOpen) {
					this.showIssueOrderInfoModal();
				}
			});

		this._pageSubscriptions.push(sub);
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

	private getModalChange() {
		this.modalChange
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((result) => {
				this.modalOpen = result;
			});
	}

	private _unsubscribeAll() {
		this._pageSubscriptions.forEach((s) => s.unsubscribe());
	}

	ngOnDestroy() {
		console.warn('OrderTakeawayInfoPage did leave');

		localStorage.removeItem('startDate');
		localStorage.removeItem('endTime');

		this._unsubscribeAll();
		this.clearTimer();

		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
