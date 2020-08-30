import { Component, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import Order from '@modules/server.common/entities/Order';
import User from '@modules/server.common/entities/User';

@Component({
	template: `
		<span class="nameAddress">
			<span *ngIf="order.isCompleted" class="address">{{
				getCustomerFullAddress(order)
			}}</span>
		</span>
	`,
})
export class AddressComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	order: Order;

	constructor() {}

	ngOnInit(): void {
		this.order = this.rowData.order;
	}

	getCustomerFullAddress(order: Order) {
		const addressUser: User = order.user as User;
		const geoLocation = addressUser.geoLocation;
		const fullAddress = `${geoLocation.city}, ${geoLocation.streetAddress} ${geoLocation.house}`;
		return fullAddress;
	}
}
