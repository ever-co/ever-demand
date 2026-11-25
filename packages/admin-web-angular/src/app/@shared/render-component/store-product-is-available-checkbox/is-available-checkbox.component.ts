import {
	Component,
	Input,
	OnInit,
	ChangeDetectionStrategy,
} from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
@Component({
	standalone: false,
	template: `
		<div class="checkbox-container">
			<nb-checkbox
				[(ngModel)]="isChecked"
				(checkedChange)="clickHandler()"
			></nb-checkbox>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.Eager,
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
			this.rowData.isProductAvailable,
		);
	}
}
