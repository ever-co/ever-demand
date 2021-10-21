import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
@Component({
	template: `
		<div class="checkbox-container">
			<nb-checkbox
				[(ngModel)]="isChecked"
				(checkedChange)="clickHandler()"
			></nb-checkbox>
		</div>
	`,
	styles: [
		`
			.checkbox-container {
				display: flex;
				justify-content: center;
				align-items: center;
			}
			​ nb-checkbox {
				width: 1rem;
				height: 1rem;
			}
		`,
	],
})
export class IsAvailableCheckBox implements ViewCell, OnInit {
	@Input() rowData: any;
	@Input() value: string;
	isChecked: boolean;
	wareHouseId: string;
	productId: string;
	constructor(private warehouseProductRouter: WarehouseProductsRouter) {}
	ngOnInit() {
		this.isChecked = this.rowData.isProductAvailable;
		this.wareHouseId = this.rowData.storeId;
		this.productId = this.rowData.product.id;
	}

	async clickHandler() {
		this.isChecked = !this.isChecked;
		this.rowData.isProductAvailable = this.isChecked;
		await this.warehouseProductRouter.changeProductAvailability(
			this.wareHouseId,
			this.productId,
			this.rowData.isProductAvailable
		);
	}
}
