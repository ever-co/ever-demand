import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WarehouseTableInfoComponent } from '../../../../pages/+warehouses/+warehouse/warehouse-info/warehouse-info.component';

@Component({
	standalone: false,
	styleUrls: ['warehouse-actions.component.scss'],
	templateUrl: './warehouse-actions.component.html',
})
export class WarehouseActionsComponent implements ViewCell, OnInit {
	value: string | number;
	baseUrl: string;

	@Input()
	rowData: any;

	constructor(private readonly modalService: NgbModal) {}

	ngOnInit() {}
	openInfo() {
		const activeModal = this.modalService.open(
			WarehouseTableInfoComponent,
			{ size: 'lg', container: 'nb-layout' }
		);
		const modalComponent: WarehouseTableInfoComponent =
			activeModal.componentInstance;
		modalComponent.warehouse = this.rowData.warehouseInfo;
	}
}
