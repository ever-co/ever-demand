import { OnInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ViewCell } from 'ng2-smart-table';

@Component({
	styleUrls: ['warehouse-orders-number.component.scss'],
	templateUrl: 'warehouse-orders-number.component.html',
})
export class WarehouseOrdersNumberComponent implements ViewCell, OnInit {
	value: any;
	rowData: any;
	numberQTY: number;
	redirectPage: string;

	constructor(private readonly router: Router) {}

	ngOnInit() {
		this.numberQTY = this.rowData.ordersQty;
	}

	redirect() {
		if (this.redirectPage) {
			this.router.navigate([`${this.redirectPage}/${this.rowData.id}`]);
		}
	}
}
