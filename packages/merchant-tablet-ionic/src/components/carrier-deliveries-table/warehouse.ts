import { Component, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import Order from '@modules/server.common/entities/Order';
import Warehouse from '@modules/server.common/entities/Warehouse';

@Component({
	template: `
		<span class="storeAddress">
			<strong *ngIf="getStoreName(order)">{{
				getStoreName(order)
			}}</strong>
			<div class="address">{{ getStoreFullAddress(order) }}</div>
		</span>
	`,
})
export class WarehouseComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	order: Order;

	constructor() {}

	ngOnInit(): void {
		this.order = this.rowData.order;
	}

	getStoreName(order: Order) {
		const store: Warehouse = order.warehouse as Warehouse;

		if (store) return store.name;

		return null;
	}

	getStoreFullAddress(order: Order) {
		const store: Warehouse = order.warehouse as Warehouse;

		const geoLocation = store.geoLocation;

		const fullAddress = `${geoLocation.city}, ${geoLocation.streetAddress} ${geoLocation.house}`;

		return fullAddress;
	}
}
