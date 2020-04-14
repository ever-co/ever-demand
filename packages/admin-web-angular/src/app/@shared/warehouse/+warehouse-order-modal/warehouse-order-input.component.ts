import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
	styles: ['.order-input-wrapper { text-align: center; }'],
	templateUrl: './warehouse-order-input.component.html',
})
export class WarehouseOrderInputComponent implements ViewCell {
	@Input()
	value;

	@Input()
	rowData: any;

	@Output()
	amount = new EventEmitter<number>();

	private _productAmount: number = 0;

	get warehouseAvailableProducts(): number {
		if (this.value) {
			return +this.value.available;
		}
		return 0;
	}

	get productId(): string {
		return this.value.productId;
	}

	get productAmount(): number {
		return this._productAmount;
	}

	set productAmount(amount: number) {
		this._productAmount = amount;
		this.amount.emit(amount);
	}

	get warehouseHasAvailable(): boolean {
		return this._productAmount < this.warehouseAvailableProducts;
	}
}
