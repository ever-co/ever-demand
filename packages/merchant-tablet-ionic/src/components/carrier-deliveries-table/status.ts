import { Component, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import Order from '@modules/server.common/entities/Order';

@Component({
	template: `
		<span>
			<div class="space">
				{{ 'CARRIERS_VIEW.DELIVERIES_POP_UP.COMPLETED' | translate
				}}{{ order.isCompleted ? ' ✔' : ' ✘' }}
			</div>
			<div class="space">
				{{ 'CARRIERS_VIEW.DELIVERIES_POP_UP.PAID' | translate
				}}{{ order.isPaid ? ' ✔' : ' ✘' }}
			</div>
		</span>
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
