import { OnInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ViewCell } from '@app/@shared/smart-table';

@Component({
	standalone: false,
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
