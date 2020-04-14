import { Component } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';

@Component({
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
