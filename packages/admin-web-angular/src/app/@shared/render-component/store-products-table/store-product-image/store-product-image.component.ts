import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';

@Component({
	standalone: false,
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './store-product-image.component.html',
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
