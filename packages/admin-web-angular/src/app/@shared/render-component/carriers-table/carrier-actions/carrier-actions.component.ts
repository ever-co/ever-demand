import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CarrierLocationComponent } from '@app/pages/+carriers/+carrier/location/carrier-location.component';
import { CarrierTableInfoComponent } from '@app/pages/+carriers/+carrier/carrier-info.component';

@Component({
	templateUrl: './carrier-actions.component.html',
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
