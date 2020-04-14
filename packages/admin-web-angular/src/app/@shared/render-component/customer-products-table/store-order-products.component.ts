import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { WarehousesService } from '../../../@core/data/warehouses.service';

@Component({
	template: `
		<div class="product">
			<h6 *ngIf="store$ | async as store" class="text-center">
				<span (click)="redirect()" class="button-redirect warhouseBtn">
					<span class="productTitle">{{ store.name }}</span>
				</span>
			</h6>
		</div>
	`,
})
export class StoreOrderProductsComponent implements ViewCell, OnInit {
	value: string | number;
	store$: Observable<Warehouse>;

	@Input()
	rowData: any;

	constructor(
		private readonly router: Router,
		private readonly warehousesService: WarehousesService
	) {}

	ngOnInit(): void {
		this.store$ = this.warehousesService.getStoreById(
			this.rowData.warehouseId
		);
	}

	redirect() {
		if (this.rowData) {
			this.router.navigate([`stores/${this.rowData.warehouseId}`]);
		}
	}
}
