import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { OrderInfoComponent } from '../../../../pages/+customers/+customer/ea-customer-orders/order-info/order-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderCancelComponent } from '../../../../pages/+customers/+customer/ea-customer-orders/order-cancel/order-cancel.component';

@Component({
	templateUrl: './customer-order-actions.component.html',
})
export class CustomerOrderActionsComponent implements ViewCell, OnInit {
	value: string | number;
	baseUrl: string;

	@Input()
	rowData: any;

	constructor(private readonly modalService: NgbModal) {}

	ngOnInit() {}

	openInfo() {
		const activeModal = this.modalService.open(OrderInfoComponent, {
			size: 'lg',
			container: 'nb-layout',
		});
		const modalComponent: OrderInfoComponent =
			activeModal.componentInstance;
		modalComponent.selectedOrder = this.rowData;
		modalComponent.orderId = this.rowData.id;
		modalComponent.storeId = this.rowData.warehouseId;
		modalComponent.carrierId = this.rowData.carrierId;
	}

	openCancel() {
		const activeModal = this.modalService.open(OrderCancelComponent, {
			size: 'sm',
			container: 'nb-layout',
		});
		const modalComponent: OrderCancelComponent =
			activeModal.componentInstance;
		modalComponent.orderId = this.rowData.id;
	}
}
