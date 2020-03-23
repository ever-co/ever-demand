import { Component, Input, Output } from '@angular/core';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';

@Component({
	selector: 'e-cu-discount',
	styleUrls: ['./discount.scss'],
	template: `
		<div *ngIf="getDiscount() != 0" class="discount-circle brand-light">
		
		<ion-icon src="../../../assets/icons/discount-sissors.svg" class="d-scissors"></ion-icon>
			<div class="price-initial">
				<span class="initial-price">{{ currentProduct ? '$' + currentProduct.initialPrice : '' }} </span>
				<span>{{ currentProduct ? '$' + currentProduct.price : '' }}</span>
			</div>
		</div>
	`
	
})
export class DiscountComponent {
	@Input()
	currentProduct: WarehouseProduct;

	constructor() {}

	// Return % of discount, e.g. 25 (so we display it as 25% in UI)
	// Returns 0 if no discount
	getDiscount() {
		if (
			!this.currentProduct ||
			this.currentProduct == null ||
			!this.currentProduct.initialPrice ||
			this.currentProduct.price === this.currentProduct.initialPrice
		) {
			return 0;
		}
		
		return Math.floor(
			(1 - this.currentProduct.price / this.currentProduct.initialPrice) *
				100
		);
	}
}
