import {
	Component,
	OnInit,
	OnDestroy,
	EventEmitter,
	ViewChild,
} from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Store } from 'app/services/store.service';
import { CancelPage } from '../../+cancel/cancel.page';
import { Subscription } from 'rxjs';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import Order from '@modules/server.common/entities/Order';
import { ElapsedTimeComponent } from 'app/components/elapsed-time/elapsed-time.component';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { getCountryName } from '@modules/server.common/entities';
import { MapModalComponent } from '../../common/map-modal/map-modal.component';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';

@Component({
	templateUrl: './popup.component.html',
	styleUrls: ['./popup.component.scss'],
})
export class OrderTakeawayInfoPopup implements OnInit, OnDestroy {
	@ViewChild('elapsedTime')
	elapsedTime: ElapsedTimeComponent;

	modalChange: EventEmitter<boolean>;
	order: Order | null = null;
	paymentsEnabled: boolean = true;
	inStore: boolean;
	showProducts: boolean = true;

	private _pageSubscriptions: Subscription[] = [];

	constructor(
		public modalController: ModalController,
		public store: Store,
		private readonly navParams: NavParams,
		private readonly orderRouter: OrderRouter,
		private readonly warehouseRouter: WarehouseRouter,
		private readonly warehouseOrdersRouter: WarehouseOrdersRouter,
		private _translateProductLocales: ProductLocalesService
	) {
		this._trackOrder();
		this.warehouseByOrder();
		this.modalChange = navParams.get('modalChange');
	}

	ngOnInit(): void {
		if (!this.store.startOrderDate) {
			this.store.startOrderDate = new Date().toString();
		}
	}

	ngOnDestroy(): void {
		this._unsubscribeAll();
		this.clearTimer();
	}

	get areIssues() {
		return this.areIssuesDuringWarehouseProcessing;
	}

	get areIssuesDuringWarehouseProcessing() {
		if (this.order == null) {
			return false;
		}
		return (
			this.order.warehouseStatus >= OrderWarehouseStatus.AllocationFailed
		);
	}

	get storeFullAddress(): string {
		if (this.order && this.order.warehouse) {
			const store = this.order.warehouse;

			return (
				`${store['geoLocation'].city}, ${store['geoLocation'].streetAddress} ` +
				`${store['geoLocation'].house}, ${
					store['geoLocation'].postcode
						? store['geoLocation'].postcode + ', '
						: ''
				} ${getCountryName(store['geoLocation'].countryId)}`
			);
		}
		return;
	}

	get inStoreMode() {
		return this.store.inStore;
	}

	clearTimer() {
		if (this.elapsedTime) {
			clearInterval(this.elapsedTime.timer);
		}
	}

	changeInStore() {
		this.inStore = true;
		this.clearTimer();
	}

	undo() {
		this.modalController.dismiss();
		this.showCancelOrderInfoModal();
	}

	complete() {
		this.closePopup();
	}

	localeTranslate(member: ILocaleMember[]): string {
		return this._translateProductLocales.getTranslate(member);
	}

	async showMapModal(): Promise<void> {
		const modal = await this.modalController.create({
			component: MapModalComponent,
			cssClass: 'map-info-modal',
			componentProps: {
				origin: this.order.user.geoLocation,
				destination: this.order.warehouse['geoLocation'],
			},
		});
		return modal.present();
	}

	async closePopup() {
		this.modalChange.emit(false);
		if (this.areIssues) {
			await this._orderCancel();
		}

		localStorage.removeItem('startDate');
		localStorage.removeItem('endTime');
		this.store.orderId = null;
		this.modalController.dismiss();
	}

	private async _orderCancel() {
		const order = await this.warehouseOrdersRouter.cancel(
			this.store.orderId
		);

		console.log(`order Cancelled: ${order.id}`);

		if (order.isPaid) {
			await this.orderRouter.refundWithStripe(order.id);
		}
	}

	private async showCancelOrderInfoModal(): Promise<void> {
		const modal = await this.modalController.create({
			component: CancelPage,
			cssClass: 'order-info-modal',
			componentProps: { modalChange: this.modalChange },
		});
		return modal.present();
	}

	private _trackOrder() {
		const orderRouterOptions = {
			populateWarehouse: true,
			populateCarrier: true,
		};

		const sub: Subscription = this.orderRouter
			.get(this.store.orderId, orderRouterOptions)
			.subscribe((order) => (this.order = order));

		this._pageSubscriptions.push(sub);
	}

	private warehouseByOrder() {
		const sub: Subscription = this.warehouseRouter
			.get(this.store.orderWarehouseId)
			.subscribe(
				(warehouse) =>
					(this.paymentsEnabled = warehouse.isPaymentEnabled)
			);

		this._pageSubscriptions.push(sub);
	}

	private _unsubscribeAll() {
		this._pageSubscriptions.forEach((s) => s.unsubscribe());
	}
}
