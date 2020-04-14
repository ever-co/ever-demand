import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WarehouseTableInfoComponent } from '../../../pages/+warehouses/+warehouse/warehouse-info/warehouse-info.component';

@Component({
	styleUrls: ['warehouse-actions.component.scss'],
	template: `
		<div class="iconsCont">
			<h4 class="text-center iconBtns">
				<i (click)="openInfo()" class="fa fa-info-circle infoBtn"></i>
			</h4>
		</div>
	`,
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
