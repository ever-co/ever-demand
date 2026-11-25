import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';
import { environment } from 'environments/environment';

@Component({
	standalone: false,
	changeDetection: ChangeDetectionStrategy.Eager,
	template: ` <span>{{ currencySymbol }}{{ value }}</span> `,
})
export class StoreProductPriceComponent implements ViewCell {
	value: any;

	rowData: any;

	currencySymbol: string = environment.CURRENCY_SYMBOL;

	constructor() {}
}
