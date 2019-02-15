import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CarrierTableInfoComponent } from '../../../pages/+carriers/+carrier/carrier-info.component';
import { CarrierMapComponent } from 'app/pages/+carriers/+carrier/carrier-map/carrier-map.component';

@Component({
	template: `
		<div class="iconsCont" style="display:flex;">
			<h4 class="text-center iconBtns">
				<i (click)="openInfo()" class="fa fa-info-circle infoBtn"></i>
			</h4>
			<h4><i (click)="openMap()" class="fa fa-search infoBtn"></i></h4>
		</div>
	`
})
export class CarrierActionsComponent implements ViewCell, OnInit {
	value: string | number;
	baseUrl: string;

	@Input()
	rowData: any;

	constructor(private readonly modalService: NgbModal) {}

	ngOnInit() {}
	openInfo() {
		const activeModal = this.modalService.open(CarrierTableInfoComponent, {
			size: 'sm',
			container: 'nb-layout'
		});
		const modalComponent: CarrierTableInfoComponent =
			activeModal.componentInstance;
		modalComponent.carrierId = this.rowData.id;
	}
	openMap() {
		const activeModal = this.modalService.open(CarrierMapComponent, {
			size: 'sm'
		});
		const modalComponent: CarrierMapComponent =
			activeModal.componentInstance;
		modalComponent.carrierId = this.rowData.id;
	}
}
