import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
	template: `
		<div class="text-center">
			<input [(ngModel)]="rowData.checked" type="checkbox" />
		</div>
	`,
})
export class ProductCheckboxComponent implements ViewCell, OnInit {
	@Input()
	value: string | number;

	@Input()
	rowData: any;

	constructor() {}

	ngOnInit() {}
}
