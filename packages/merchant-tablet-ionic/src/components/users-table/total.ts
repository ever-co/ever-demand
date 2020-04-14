import { Component, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import User from '@modules/server.common/entities/User';
import Order from '@modules/server.common/entities/Order';

@Component({
	template: `
		<div class="text-center" *ngIf="rowData?.total !== 0">
			<span>{{ '$' + rowData?.total }}</span>
			<div></div>
		</div>
	`,
})
export class TotalComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	user: User;
	orders: Order[];

	constructor() {}

	ngOnInit(): void {
		this.user = this.rowData.user;
		this.orders = this.rowData.allOrders;
	}

	getTotalPrice(userId: string) {
		const orders = this.orders
			.filter((o: Order) => o.isPaid)
			.filter((o: Order) => o.user.id === userId);
		let totalPrice = 0;
		if (orders.length > 0) {
			totalPrice = orders
				.map((o: Order) => o.totalPrice)
				.reduce((a, b) => a + b);
		}
		return totalPrice;
	}
}
