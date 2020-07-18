import { Component, Input, OnInit } from '@angular/core';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';

@Component({
	styles: [
		`
			div {
				white-space: nowrap;
				padding-bottom: 4px;
			}
		`,
	],
	template: `
		<div>
			<div>
				<nb-checkbox
					[(ngModel)]="isDelivery"
					(checkedChange)="isDeliveryChange($event)"
					>{{
						'WAREHOUSE_VIEW.PRODUCTS_TAB.DELIVERY' | translate
					}}</nb-checkbox
				>
			</div>
			<div>
				<nb-checkbox
					[(ngModel)]="isTakeaway"
					(checkedChange)="isTakeawayChange($event)"
					>{{
						'WAREHOUSE_VIEW.PRODUCTS_TAB.TAKEAWAY' | translate
					}}</nb-checkbox
				>
			</div>
		</div>
	`,
})
export class ProductTakeawayDeliveryComponent implements OnInit {
	@Input()
	rowData: any;
	isDelivery: boolean;
	isTakeaway: boolean;
	wareHouseId: string;
	productId: string;

	constructor(private warehouseProductRouter: WarehouseProductsRouter) {}

	ngOnInit() {
		this.isDelivery = this.rowData.isDeliveryRequired;
		this.isTakeaway = this.rowData.isTakeaway;
		this.wareHouseId = this.rowData.storeId;
		this.productId = this.rowData.product.id;
	}

	async isDeliveryChange() {
		this.isDelivery = !this.isDelivery;

		if (!this.isDelivery && !this.isTakeaway) {
			this.isDelivery = true;
			alert('Atleast one type should be selected!');
			return;
		}
		this.rowData.isDeliveryRequired = this.isDelivery;
		await this.warehouseProductRouter.changeProductDelivery(
			this.wareHouseId,
			this.productId,
			this.rowData.isDeliveryRequired
		);
	}

	async isTakeawayChange() {
		this.isTakeaway = !this.isTakeaway;
		if (!this.isDelivery && !this.isTakeaway) {
			this.isTakeaway = true;
			alert('Atleast one type should be selected!');
			return;
		}
		this.rowData.isTakeaway = this.isTakeaway;
		await this.warehouseProductRouter.changeProductTakeaway(
			this.wareHouseId,
			this.productId,
			this.rowData.isTakeaway
		);
	}
}
