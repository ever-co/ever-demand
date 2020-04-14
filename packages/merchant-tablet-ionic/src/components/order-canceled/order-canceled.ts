import { Component, Input } from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';

@Component({
	selector: 'order-canceled',
	templateUrl: 'order-canceled.html',
})
export class OrderCanceledComponent {
	@Input()
	getWarehouseStatus: Function;

	@Input()
	order: Order;

	constructor(private _translateProductLocales: ProductLocalesService) {}

	protected localeTranslate(member: ILocaleMember[]): string {
		return this._translateProductLocales.getTranslate(member);
	}
}
