import { Component } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';

@Component({
	template: `
		<div class="text-center">
			<img
				*ngIf="value"
				src="{{ value }}"
				[ngClass]="{ clickable: !rowData.disableImg }"
				(click)="addProduct()"
				width="60"
			/>
		</div>
	`,
})
export class StoreProductImageComponent implements ViewCell {
	value: any;
	rowData: any;

	constructor(private warehouseProductsRouter: WarehouseProductsRouter) {}

	addProduct() {
		const storeId = this.rowData.storeId;
		const productId = this.rowData.id;
		const disableImg = this.rowData.disableImg;
		if (storeId && productId && !disableImg) {
			this.warehouseProductsRouter.increaseCount(storeId, productId, 1);
		} else {
			console.warn("Can't add product.");
		}
	}
}
