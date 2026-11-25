import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';

@Component({
	standalone: false,
	changeDetection: ChangeDetectionStrategy.Eager,
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
