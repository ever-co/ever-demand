import { Component, Input, OnInit } from '@angular/core';
import Order from '@modules/server.common/entities/Order';

@Component({
	selector: 'orders',
	styleUrls: ['./orders.component.scss'],
	templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
	@Input()
	public orders: Order[];

	public ordersSum: number;

	constructor() {}

	ngOnInit() {
		this.getTotalOrdersSum();
	}

	getTotalOrdersSum() {
		this.ordersSum = this.orders
			.map((order) => order.totalPrice)
			.reduce((prevPrice, nextPrice) => prevPrice + nextPrice, 0);
	}
}
