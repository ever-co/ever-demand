import { Component, OnDestroy, Input, OnInit } from '@angular/core';
import User from '@modules/server.common/entities/User';
import Order from '@modules/server.common/entities/Order';
import { UserOrdersRouter } from '@modules/client.common.angular2/routers/user-orders-router.service';
import Carrier from '@modules/server.common/entities/Carrier';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject, Observable, forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { OrderIdComponent } from '../../../components/customer-deliveries-table/orderId';
import { DeliveryComponent } from '../../../components/customer-deliveries-table/delivery';
import { AddressComponent } from '../../../components/customer-deliveries-table/address';
import { StatusComponent } from '../../../components/customer-deliveries-table/status';
import { getIdFromTheDate } from '@modules/server.common/utils';
import { ModalController } from '@ionic/angular';

@Component({
	selector: 'customer-deliveries-popup',
	templateUrl: 'customer-deliveries-popup.html',
	styleUrls: ['./customer-deliveries-popup.scss'],
})
export class CustomerDeliveriesPopupPage implements OnInit, OnDestroy {
	@Input()
	user: User;
	orders: Order[];
	ordersFromWarehouse: Order[];
	userId: string;
	showNoDeliveryIcon: boolean;
	ordersCurrentWarehouse: Order[];
	carrier: Carrier;
	totalOrdersSum: number = 0;

	settingsSmartTable: object;
	sourceSmartTable = new LocalDataSource();

	private _ngDestroy$ = new Subject<void>();
	private $orders: any;

	constructor(
		public modalController: ModalController,
		private readonly userOrdersRouter: UserOrdersRouter,
		private readonly translateService: TranslateService
	) {
		this._loadSettingsSmartTable();
	}

	get warehouseId() {
		return localStorage.getItem('_warehouseId');
	}

	compareByCreateDate(a, b) {
		if (new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime()) {
			return -1;
		}
		if (new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime()) {
			return 1;
		}
		return 0;
	}

	ngOnInit(): void {
		this.userId = this.user.id;
		this.$orders = this.userOrdersRouter
			.get(this.user.id)
			.subscribe((orders) => {
				this.orders = orders;
				if (this.orders.length === 0) {
					this.showNoDeliveryIcon = true;
				}
				this.getOrders();
			});
	}

	getCustomerFullAddress(order: Order) {
		if (order.isCompleted) {
			const addressUser: User = order.user as User;
			const geoLocation = addressUser.geoLocation;
			const fullAddress = `${geoLocation.city}, ${geoLocation.streetAddress} ${geoLocation.house}`;
			return fullAddress;
		}
	}

	getTotalDeliveryTime(order: Order) {
		const start = order.createdAt;

		const end = new Date(order.deliveryTime);

		let delta = Math.abs(start.getTime() - end.getTime()) / 1000;

		const days = Math.floor(delta / 86400);
		delta -= days * 86400;

		const hours = Math.floor(delta / 3600) % 24;
		delta -= hours * 3600;

		const minutes = Math.floor(delta / 60) % 60;
		delta -= minutes * 60;

		const seconds = delta % 60;
		let secondsStr = seconds.toString();
		secondsStr = secondsStr.substring(0, secondsStr.indexOf('.'));

		let h = '0' + hours;
		h = h.substr(-2);
		let min = '0' + minutes;
		min = min.substr(-2);
		let sec = '0' + secondsStr;
		sec = sec.substr(-2);

		return `${days !== 0 ? days + 'days ' : ''}
            ${hours} : ${min} : ${sec}`;
	}

	getOrders() {
		const loadData = (orders) => {
			const usersVM = orders.map((o: Order) => {
				let status = o.isCompleted ? 'Completed' : '';
				status += o.isPaid ? 'Paid' : '';
				return {
					orderId: getIdFromTheDate(o),
					status,
					address: this.getCustomerFullAddress(o),
					delivery: this.getTotalDeliveryTime(o),
					order: o,
				};
			});

			this.sourceSmartTable.load(usersVM);
		};

		this.ordersCurrentWarehouse = this.orders.filter(
			(o: Order) => o.warehouse === this.warehouseId
		);
		this.ordersCurrentWarehouse.forEach((o) => {
			this.totalOrdersSum += o.totalPrice;
		});
		this.ordersCurrentWarehouse.sort(this.compareByCreateDate);
		loadData(this.ordersCurrentWarehouse);
		return this.ordersCurrentWarehouse;
	}

	cancelModal() {
		this.modalController.dismiss();
	}

	private _loadSettingsSmartTable() {
		const columnTitlePrefix = 'CUSTOMER_ORDERS_POP_UP.';
		const getTranslate = (name: string): Observable<string> =>
			this.translateService.get(columnTitlePrefix + name);

		forkJoin(
			getTranslate('ORDER_ID'),
			getTranslate('DELIVERY'),
			getTranslate('ADDRESS'),
			getTranslate('STATUS')
		)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(([orderId, delivery, address, status]) => {
				this.settingsSmartTable = {
					actions: true,
					columns: {
						orderId: {
							title: orderId,
							class: 'text-align-left',
							type: 'custom',
							renderComponent: OrderIdComponent,
						},
						delivery: {
							title: delivery,
							type: 'custom',
							renderComponent: DeliveryComponent,
						},
						address: {
							title: address,
							type: 'custom',
							renderComponent: AddressComponent,
						},
						status: {
							title: status,
							type: 'custom',
							renderComponent: StatusComponent,
						},
					},
					pager: {
						display: true,
						perPage: 4,
					},
				};
			});
	}

	ngOnDestroy() {
		if (this.$orders) {
			this.$orders.unsubscribe();
		}

		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
