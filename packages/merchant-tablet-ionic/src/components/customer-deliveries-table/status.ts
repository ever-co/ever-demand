import { Component, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import Order from '@modules/server.common/entities/Order';

@Component({
	template: `
		<div class="space">
			{{ 'CUSTOMERS_VIEW.ORDERS_POP_UP.COMPLATED' | translate }}
			{{ order.isCompleted ? ' ✔' : ' ✘' }}
		</div>
		<div class="space">
			{{ 'CUSTOMERS_VIEW.ORDERS_POP_UP.PAID' | translate
			}}{{ order.isPaid ? ' ✔' : ' ✘' }}
		</div>
	`,
})
export class StatusComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	order: Order;

	constructor() {}

	ngOnInit(): void {
		this.order = this.rowData.order;
	}
}
