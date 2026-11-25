import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';

@Component({
	standalone: false,
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
