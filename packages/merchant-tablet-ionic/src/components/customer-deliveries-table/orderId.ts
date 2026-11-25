import { Component, OnInit } from '@angular/core';
import { ViewCell } from '../table-components/smart-table';

@Component({
	standalone: false,
	template: ` <strong *ngIf="orderId">{{ orderId }}</strong> `,
})
export class OrderIdComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	orderId: string;

	constructor() {}

	ngOnInit(): void {
		this.orderId = this.rowData.orderId;
	}
}
