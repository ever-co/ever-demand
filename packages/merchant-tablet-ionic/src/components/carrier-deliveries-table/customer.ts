import { Component, OnInit, Input } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import Order from '@modules/server.common/entities/Order';
import User from '@modules/server.common/entities/User';
import UserOrder from '@modules/server.common/entities/UserOrder';

@Component({
	template: `
		<span class="nameAddress">
			<strong *ngIf="getUserName(order)">{{ getUserName(order) }}</strong>
			<div class="address">{{ order.user.fullAddress }}</div>
		</span>
	`,
})
export class CustomerComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	order: Order;

	constructor() {}

	ngOnInit(): void {
		this.order = this.rowData.order;
	}

	getUserName(order: Order) {
		const user: UserOrder = order.user;

		if (user.firstName) {
			if (user.lastName) {
				return user.firstName + ' ' + user.lastName;
			}

			return user.firstName;
		}
	}
}
