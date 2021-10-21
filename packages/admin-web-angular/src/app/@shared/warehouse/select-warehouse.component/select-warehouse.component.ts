import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
	template: `
		<button
			class="btn btn-sm btn-outline-secondary"
			(click)="selectWarehouse(renderValue)"
		>
			{{ renderValue }}
		</button>
	`,
})
export class SelectWarehouseComponent implements ViewCell, OnInit {
	@Input()
	public value: string | number;

	@Input()
	public rowData: any;

	public renderValue: string;

	constructor(private readonly _router: Router) {}

	ngOnInit() {
		this.renderValue = this.value.toString();
	}

	public selectWarehouse(warehouseId: string) {
		this._router.navigate(['/stores/' + warehouseId]);
	}
}
