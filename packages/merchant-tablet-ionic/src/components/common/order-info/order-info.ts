import { Component, Input } from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'order-info',
	styleUrls: ['./order-info.scss'],
	templateUrl: 'order-info.html',
})
export class OrderInfoComponent {
	@Input()
	public order: Order;

	constructor(private translate: TranslateService) {}

	get orderType() {
		const type =
			this.order.orderType === 0
				? this.translate.instant('ORDER_TYPE.DELIVERY')
				: this.translate.instant('ORDER_TYPE.TAKEAWAY');

		return type;
	}
}
