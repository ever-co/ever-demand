import { Component, OnDestroy, Input } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import Order from '@modules/server.common/entities/Order';

@Component({
	selector: 'e-cu-order-takeaway-info-title',
	templateUrl: './title.component.html',
	styleUrls: ['./title.component.scss'],
})
export class TakeawayTitleComponent implements OnDestroy {
	@Input()
	order: Order | null = null;

	private _pageSubscriptions: Subscription[] = [];
	private readonly ngDestroy$ = new Subject<void>();

	constructor(private readonly _translateService: TranslateService) {}

	get byPopupStatuses() {
		const popupStatuses = 'BUY_POPUP.STATUSES_TAKEAWAY';
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

	get deliveryTimeRange(): string {
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

	private _unsubscribeAll() {
		this._pageSubscriptions.forEach((s) => s.unsubscribe());
	}

	ngOnDestroy() {
		console.warn('OrderStoreInfo did leave');

		this._unsubscribeAll();

		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
