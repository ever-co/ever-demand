import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { ToasterService } from 'angular2-toaster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WarehouseOrdersService } from '../../../@core/data/warehouseOrders.service';
import { WarehouseOrderModalComponent } from '../../../@shared/warehouse/+warehouse-order-modal/warehouse-order-modal.component';
import { WarehouseInfoComponent } from './warehouse-info/warehouse-info.component';

@Component({
	styleUrls: ['./warehouse-order.component.scss'],
	templateUrl: './warehouse-order.component.html',
})
export class WarehouseOrderComponent implements ViewCell, OnInit {
	@Input()
	value: any;
	@Input()
	rowData: any;

	get renderValue(): string {
		const orderAction =
			'CUSTOMERS_VIEW.' + this.value.actionName.toString();
		return orderAction;
	}

	constructor(
		private readonly _modalService: NgbModal,
		private readonly _warehouseOrdersService: WarehouseOrdersService,
		private readonly _toasterService: ToasterService,
		private readonly modalService: NgbModal
	) {}

	ngOnInit() {}

	openWarehouseOrderModal() {
		const componentRef = this._modalService.open(
			WarehouseOrderModalComponent,
			{ size: 'lg' }
		);
		const instance: WarehouseOrderModalComponent =
			componentRef.componentInstance;

		instance.warehouseId = this.rowData.id;

		instance.makeOrderEmitter.subscribe((data) => {
			const userId = this.value.actionOwnerId.toString();
			const warehouseId = instance.warehouseId;

			this._warehouseOrdersService
				.createOrder({ userId, warehouseId, products: data })
				.subscribe(() => {
					this._toasterService.pop(
						`success`,
						`The order is finished!`
					);
					componentRef.close();
				});
		});
	}

	openInfo() {
		const activeModal = this.modalService.open(WarehouseInfoComponent, {
			size: 'sm',
			container: 'nb-layout',
		});
		const modalComponent: WarehouseInfoComponent =
			activeModal.componentInstance;
		modalComponent.warehouseId = this.rowData.id;
		modalComponent.selectedWarehouse = this.rowData;
	}
}
