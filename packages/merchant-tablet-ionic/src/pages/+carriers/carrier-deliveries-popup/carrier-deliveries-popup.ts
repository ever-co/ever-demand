import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import Carrier from '@modules/server.common/entities/Carrier';
import Order from '@modules/server.common/entities/Order';
import { CarrierOrdersRouter } from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject, Observable, forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { CustomerComponent } from '../../../components/carrier-deliveries-table/customer';
import { DeliveryComponent } from '../../../components/carrier-deliveries-table/delivery';
import { StatusComponent } from '../../../components/carrier-deliveries-table/status';
import { WarehouseComponent } from '../../../components/carrier-deliveries-table/warehouse';
import { ModalController } from '@ionic/angular';
import UserOrder from '@modules/server.common/entities/UserOrder';

@Component({
	selector: 'carrier-deliveries-popup',
	templateUrl: 'carrier-deliveries-popup.html',
	styleUrls: ['./carrier-deliveries-popup.scss'],
})
export class CarrierDeliveriesPopupPage implements OnInit, OnDestroy {
	@Input()
	carrier: Carrier;

	orders: Order[];

	showNoDeliveryIcon: boolean;

	settingsSmartTable: object;

	sourceSmartTable = new LocalDataSource();

	private _ngDestroy$ = new Subject<void>();
	private $orders: any;

	constructor(
		private modalCtrl: ModalController,
		private readonly carrierOrdersRouter: CarrierOrdersRouter,
		private readonly translateService: TranslateService
	) {
		this._loadSettingsSmartTable();
	}

	getUserName(order: Order) {
		const user: UserOrder = order.user;

		if (user.firstName) {
			if (user.lastName) {
				return user.firstName + ' ' + user.lastName;
			}
			return user.firstName;
		}
	}

	getStoreFullAddress(order: Order) {
		const store: Warehouse = order.warehouse as Warehouse;
		const geoLocation = store.geoLocation;
		const fullAddress = `${geoLocation.city}, ${geoLocation.streetAddress} ${geoLocation.house}`;
		return fullAddress;
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

	cancelModal() {
		this.modalCtrl.dismiss();
	}

	ngOnInit(): void {
		const loadData = (orders) => {
			const dataVM = orders.map((o: Order) => {
				let status = o.isCompleted ? 'Completed' : '';
				status += o.isPaid ? 'Paid' : '';
				return {
					customer: this.getUserName(o),
					status,
					warehouse: o.warehouse['name'],
					delivery: this.getTotalDeliveryTime(o),
					order: o,
				};
			});

			this.sourceSmartTable.load(dataVM);
		};

		this.$orders = this.carrierOrdersRouter
			.get(this.carrier.id, {
				populateWarehouse: true,
				completion: 'completed',
			})
			.subscribe((orders) => {
				this.orders = orders;
				loadData(orders);
				if (this.orders.length === 0) {
					this.showNoDeliveryIcon = true;
				}
			});
	}

	ngOnDestroy(): void {
		if (this.$orders) {
			this.$orders.unsubscribe();
		}
	}

	private _loadSettingsSmartTable() {
		const columnTitlePrefix = 'CARRIERS_VIEW.DELIVERIES_POP_UP.';
		const getTranslate = (name: string): Observable<string> =>
			this.translateService.get(columnTitlePrefix + name);

		forkJoin(
			getTranslate('CUSTOMER'),
			getTranslate('WAREHOUSE'),
			getTranslate('STATUS'),
			getTranslate('DELIVERY')
		)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(([customer, warehouse, status, delivery]) => {
				this.settingsSmartTable = {
					actions: true,
					columns: {
						customer: {
							title: customer,
							type: 'custom',
							renderComponent: CustomerComponent,
						},
						warehouse: {
							title: warehouse,
							type: 'custom',
							renderComponent: WarehouseComponent,
						},
						status: {
							title: status,
							type: 'custom',
							renderComponent: StatusComponent,
						},
						delivery: {
							title: delivery,
							type: 'custom',
							renderComponent: DeliveryComponent,
						},
					},
					pager: {
						display: true,
						perPage: 5,
					},
				};
			});
	}
}
