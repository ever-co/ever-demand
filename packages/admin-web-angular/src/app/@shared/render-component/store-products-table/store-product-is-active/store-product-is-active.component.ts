import { Component, OnInit, Input } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
	templateUrl: './store-product-is-active.component.ts.html',
})
export class StoreProductIsActiveComponent implements ViewCell, OnInit {
	@Input()
	value: string | number;
	@Input()
	rowData: any;

	isChecked = true;

	constructor() {}

	ngOnInit() {
		console.warn(this.value);
	}
}
