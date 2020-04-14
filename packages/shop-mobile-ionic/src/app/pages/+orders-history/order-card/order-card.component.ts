import { Component, Input } from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import IUser from '@modules/server.common/interfaces/IUser';

@Component({
	selector: 'e-cu-order-card',
	styleUrls: ['./order-card.component.scss'],
	templateUrl: './order-card.component.html',
})
export class OrderCardComponent {
	private static NOT_EXPANDED_MAX_PRODUCTS_AMOUNT = 3;

	@Input()
	user: IUser;

	private _order: Order;

	get order() {
		return this._order;
	}

	@Input()
	set order(order: Order) {
		// use type annotation
		this._order = { ...order } as Order;
		this._order.products = order.products.slice(
			0,
			OrderCardComponent.NOT_EXPANDED_MAX_PRODUCTS_AMOUNT
		);
		this.notDisplayedProductsAmount =
			order.products.length - this._order.products.length;
	}

	notDisplayedProductsAmount: number;
}
