import { OnInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ViewCell } from 'ng2-smart-table';

@Component({
	styleUrls: ['customer-orders-number.component.scss'],
	templateUrl: 'customer-orders-number.component.html',
})
export class CustomerOrdersNumberComponent implements ViewCell, OnInit {
	value: any;
	rowData: any;
	numberQTY: number;

	constructor(private readonly _router: Router) {}

	ngOnInit() {
		this.numberQTY = this.rowData.ordersQty;
	}
}
