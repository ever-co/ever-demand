import {
	Component,
	ViewChild,
	OnInit,
	Input,
	Output,
	EventEmitter,
} from '@angular/core';
import { AddWarehouseProductsComponent } from '@app/@shared/warehouse-product/forms/add-warehouse-products-table';
import Product from '@modules/server.common/entities/Product';
import { WarehousesService } from '@app/@core/data/warehouses.service';
import { first } from 'rxjs/operators';
import { NotifyService } from '@app/@core/services/notify/notify.service';

@Component({
	selector: 'ea-merchants-setup-add-products',
	templateUrl: './add-products.component.html',
})
export class SetupMerchantAddProductsComponent implements OnInit {
	@ViewChild('addWarehouseProductsTable', { static: true })
	addWarehouseProductsTable: AddWarehouseProductsComponent;

	@Input()
	products: Product[];
	@Input()
	storeId: string;

	@Output()
	successAdd: EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor(
		private warehousesService: WarehousesService,
		private notifyService: NotifyService
	) {}

	ngOnInit(): void {
		this.addWarehouseProductsTable.loadDataSmartTable(
			this.products || [],
			this.storeId
		);
	}

	async add() {
		try {
			const productsForAdd = this.addWarehouseProductsTable
				.allWarehouseProducts;

			await this.warehousesService
				.addProducts(this.storeId, productsForAdd)
				.pipe(first())
				.toPromise();

			this.successAdd.emit(true);

			const message = `${productsForAdd.length} products was added`;
			this.notifyService.success(message);
		} catch (error) {
			let message = `Something went wrong`;

			if (error.message === 'Validation error') {
				message = error.message;
			}

			this.notifyService.error(message);
		}
	}
}
