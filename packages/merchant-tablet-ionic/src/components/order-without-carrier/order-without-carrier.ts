import { Component, Input } from '@angular/core';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import Order from '@modules/server.common/entities/Order';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';

@Component({
	selector: 'order-without-carrier',
	templateUrl: 'order-without-carrier.html',
	styleUrls: ['./order-without-carrier.scss'],
})
export class OrderWithoutCarrierComponent {
	@Input()
	getWarehouseStatus: () => void;

	@Input()
	order: Order;

	@Input()
	onUpdateWarehouseStatus: any;

	constructor(private _translateProductLocales: ProductLocalesService) {}

	get hasProducts() {
		if (this.order && this.order.products && this.order.products.length) {
			return true;
		}
		return false;
	}

	localeTranslate(member: ILocaleMember[]): string {
		return this._translateProductLocales.getTranslate(member);
	}
}
