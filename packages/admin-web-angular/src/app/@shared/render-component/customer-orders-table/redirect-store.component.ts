import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { WarehousesService } from '../../../@core/data/warehouses.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { Observable } from 'rxjs';

@Component({
	styleUrls: ['redirect-store.component.scss'],
	template: `
		<div
			*ngIf="store$ | async as store"
			(click)="redirect()"
			class="redirectBtn"
		>
			<h6>
				<img class="warehouse-image" alt="" src="{{ store.logo }}" />
				<div class="warehouse-name">{{ store.name }}</div>
			</h6>
			<h6>{{ warehouseStatusText | translate }}</h6>
		</div>
	`,
})
export class RedirectStoreComponent implements ViewCell, OnInit {
	value: string | number;

	@Input()
	rowData: any;
	store$: Observable<Warehouse>;

	public warehouseStatusText: string;

	constructor(
		private readonly router: Router,
		private readonly warehousesService: WarehousesService
	) {}

	ngOnInit() {
		this.store$ = this.warehousesService.getStoreById(
			this.rowData.warehouseId
		);
		this.warehouseStatusText =
			'STATUS_TEXT.' + this.rowData.warehouseStatusText;
	}

	redirect() {
		if (this.rowData.warehouseId) {
			this.router.navigate([`stores/${this.rowData.warehouseId}`]);
		}
	}
}
