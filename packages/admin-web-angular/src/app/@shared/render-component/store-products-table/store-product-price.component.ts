import { Component } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { environment } from 'environments/environment';

@Component({
	template: ` <span>{{ currencySymbol }}{{ value }}</span> `,
})
export class StoreProductPriceComponent implements ViewCell {
	value: any;

	rowData: any;

	currencySymbol: string = environment.CURRENCY_SYMBOL;

	constructor() {}
}
