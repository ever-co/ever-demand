import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
	styles: ['.order-input-wrapper { text-align: center; }'],
	template: `
		<div class="order-input-wrapper">
			<button
				(click)="productAmount = productAmount - 1"
				[disabled]="productAmount <= 0"
				class="btn btn-sm btn-secondary p-2"
			>
				-
			</button>

			<span class="mx-2">{{ productAmount }}</span>

			<button
				(click)="productAmount = productAmount + 1"
				[disabled]="!warehouseHasAvailable"
				class="btn btn-sm btn-secondary p-2"
			>
				+
			</button>
		</div>
	`,
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
		return +this.value.available;
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
