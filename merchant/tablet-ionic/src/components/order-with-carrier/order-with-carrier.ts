import { Component, Input } from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';

@Component({
	selector: 'order-with-carrier',
	templateUrl: 'order-with-carrier.html',
	styleUrls: ['./order-with-carrier.scss']
})
export class OrderWithCarrierComponent {
	@Input()
	getWarehouseStatus: () => void;

	@Input()
	protected order: Order;

	@Input()
	protected onUpdateWarehouseStatus: any;

	constructor(private _translateProductLocales: ProductLocalesService) {}

	isGivenToCarrier() {
		return (
			this.order.warehouseStatus === OrderWarehouseStatus.GivenToCarrier
		);
	}

	protected localeTranslate(member: ILocaleMember[]): string {
		return this._translateProductLocales.getTranslate(member);
	}
}
