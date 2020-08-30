import { Component, Input, OnInit } from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import ICarrier from '@modules/server.common/interfaces/ICarrier';

@Component({
	selector: 'order-card',
	templateUrl: 'order-card.html',
	styles: ['order-card.scss'],
})
export class OrderCardComponent implements OnInit {
	private static NOT_EXPANDED_MAX_PRODUCTS_AMOUNT = 3;
	@Input()
	carrier: ICarrier;

	@Input()
	order: Order;

	ngOnInit() {}

	get maxProductsAmountToShow() {
		return OrderCardComponent.NOT_EXPANDED_MAX_PRODUCTS_AMOUNT;
	}
}
