import {
	Component,
	ViewChild,
	OnInit,
	Input,
	Output,
	EventEmitter
} from '@angular/core';
import { WarehouseProductsComponent } from 'app/@shared/warehouse-product/forms/warehouse-products-table';
import Product from '@modules/server.common/entities/Product';
import { WarehousesService } from 'app/@core/data/warehouses.service';
import { first } from 'rxjs/operators';
import { NotifyService } from 'app/@core/services/notify/notify.service';

@Component({
	selector: 'ea-merchants-setup-add-products',
	templateUrl: './add-products.component.html'
})
export class SetupMerchantAddProductsComponent implements OnInit {
	@ViewChild('warehouseProductsTable')
	warehouseProductsTable: WarehouseProductsComponent;

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
		this.warehouseProductsTable.loadDataSmartTable(
			this.products || [],
			this.storeId
		);
	}

	async add() {
		try {
			const productsForAdd = this.warehouseProductsTable
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
