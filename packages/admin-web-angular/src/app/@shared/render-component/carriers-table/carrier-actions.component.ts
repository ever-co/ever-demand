import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CarrierTableInfoComponent } from '@app/pages/+carriers/+carrier/carrier-info.component';
import { CarrierLocationComponent } from '@app/pages/+carriers/+carrier/location/carrier-location.component';

@Component({
	template: `
		<div class="iconsCont" style="display:flex;">
			<h4 class="text-center iconBtns">
				<i (click)="openInfo()" class="fa fa-info-circle infoBtn"></i>
			</h4>
			<h4><i (click)="openMap()" class="fa fa-search infoBtn"></i></h4>
		</div>
	`,
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
			container: 'nb-layout',
		});
		const modalComponent: CarrierTableInfoComponent =
			activeModal.componentInstance;
		modalComponent.carrierId = this.rowData.id;
	}
	openMap() {
		const activeModal = this.modalService.open(CarrierLocationComponent, {
			size: 'sm',
			windowClass: 'map-modal',
		});
		const modalComponent: CarrierLocationComponent =
			activeModal.componentInstance;
		modalComponent.carrierId = this.rowData.id;
	}
}
