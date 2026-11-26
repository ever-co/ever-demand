import { OnInit, Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ViewCell } from '@app/@shared/smart-table';

@Component({
	standalone: false,
	styleUrls: ['customer-orders-number.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
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
