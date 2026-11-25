import { Component } from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';

@Component({
	standalone: false,
	template: `
		<div class="text-center">
			<span class="text-bg-dark">{{ value }}</span>
		</div>
	`,
})
export class StoreProductQtyComponent implements ViewCell {
	value: any;
	rowData: any;

	constructor() {}
}
