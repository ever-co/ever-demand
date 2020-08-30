import { Component } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
	template: `
		<div class="text-center">
			<span class="badge-dark">{{ value }}</span>
		</div>
	`,
})
export class StoreProductQtyComponent implements ViewCell {
	value: any;
	rowData: any;

	constructor() {}
}
