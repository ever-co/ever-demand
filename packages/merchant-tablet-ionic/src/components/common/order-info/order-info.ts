import { Component, Input } from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import { TranslateService } from '@ngx-translate/core';
import DeliveryType from '@modules/server.common/enums/DeliveryType';

@Component({
	selector: 'order-info',
	styleUrls: ['./order-info.scss'],
	templateUrl: 'order-info.html',
})
export class OrderInfoComponent {
	@Input()
	public order: Order;
	public type: DeliveryType;

	constructor(private translate: TranslateService) {}

	get orderType() {
		this.type =
			this.order.orderType === 0
				? this.translate.instant('ORDER_TYPE.DELIVERY')
				: this.translate.instant('ORDER_TYPE.TAKEAWAY');

		return this.type;
	}
}
