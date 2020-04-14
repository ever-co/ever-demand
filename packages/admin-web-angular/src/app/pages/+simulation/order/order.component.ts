import { Component, OnDestroy, Input, ViewChild, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import Order from '@modules/server.common/entities/Order';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { takeUntil } from 'rxjs/operators';
import { ElapsedTimeComponent } from '@app/@shared/elapsed-time/elapsed-time.component';
import { IImage } from 'ng-simple-slideshow';
import Product from '@modules/server.common/entities/Product';

export enum DeliveryStatus {
	Warehouse,
	Carrier,
	Customer,
	Completed,
}

@Component({
	selector: 'ea-simulation-order',
	templateUrl: './order.component.html',
	styleUrls: ['./order.component.scss'],
})
export class SimulationOrderComponent implements OnDestroy, OnInit {
	@ViewChild('elapsedTime')
	elapsedTime: ElapsedTimeComponent;

	@Input()
	public order: Order;
	public delivered: boolean;

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly _translateService: TranslateService,
		private readonly _localeTranslate: ProductLocalesService
	) {}

	ngOnInit() {
		if (!this._getStartDate) {
			this._setStartDate = new Date();
		}
	}

	getSlideImage(order: Order) {
		const images = order.products.map((p) => {
			return {
				url: this._localeTranslate.getTranslate(p.product.images),
				caption: this._localeTranslate.getTranslate(p.product.title),
				title: this._localeTranslate.getTranslate(
					p.product.description
				),
				backgroundSize: 'contain',
				backgroundPosition: 'center',
			};
		});

		return images;
	}

	private get _getStartDate() {
		return localStorage.getItem('simulationStartDate');
	}

	private set _setStartDate(val: Date) {
		localStorage.setItem('simulationStartDate', JSON.stringify(val));
	}
	private set _setEndTime(val: any) {
		localStorage.setItem('simulationEndTime', JSON.stringify(val));
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
			if (this.elapsedTime) {
				this._setEndTime = this.elapsedTime.timePasssed;
				this.clearTimer();
			}
		}
		this.delivered = isCurrent;
		return isCurrent;
	}

	public get isWarehouseActive() {
		return this.currentStatus >= DeliveryStatus.Warehouse;
	}

	public get isWarehouseCurrent() {
		return this.currentStatus === DeliveryStatus.Warehouse;
	}

	public get isCarrierActive() {
		return this.currentStatus >= DeliveryStatus.Carrier;
	}

	public get isCarrierCurrent() {
		return this.currentStatus === DeliveryStatus.Carrier;
	}

	public get currentStatus(): DeliveryStatus {
		if (this.order == null) {
			return DeliveryStatus.Warehouse;
		}

		if (this.order['isCompleted']) {
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

	public get orderInfoStatuses() {
		const popupStatuses =
			'SIMULATION_VIEW.ORDER_INFO.STATUSES.' + this.currentStatus;
		let result: string = '';

		const getTitle = () => {
			this._translateService
				.get(popupStatuses + '.TITLE')
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((t) => (result = t));
			return result;
		};

		const getDetails = () => {
			this._translateService
				.get(popupStatuses + '.DETAILS')
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((d) => (result = d));
			return result.replace('%t', this.deliveryTimeRange);
		};

		const getPaidNote = () => {
			this._translateService
				.get(popupStatuses + '.NOT_PAID_NOTE')
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((n) => (result = n));
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

	clearTimer() {
		clearInterval(this.elapsedTime.timer);
	}

	ngOnDestroy() {
		this.clearTimer();
		localStorage.removeItem('simulationStartDate');
		localStorage.removeItem('simulationEndTime');
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
