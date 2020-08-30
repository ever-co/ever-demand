import { Component, Input, OnInit } from '@angular/core';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import { Store } from 'services/store.service';
import { WarehousesService } from 'services/warehouses.service';
import { map } from 'rxjs/operators';

@Component({
	selector: 'order-control-buttons',
	templateUrl: 'order-control-buttons.html',
	styleUrls: ['./order-control-buttons.scss'],
})
export class OrderControlButtonsComponent implements OnInit {
	@Input()
	orderId: string;

	@Input()
	warehouseStatus: number;

	@Input()
	carrierStatus: number;

	@Input()
	onUpdateWarehouseStatus: any;

	@Input()
	orderType: DeliveryType;

	orderTypeDelivery: DeliveryType = DeliveryType.Delivery;
	orderTypeTakeaway: DeliveryType = DeliveryType.Takeaway;

	ordersShortProcess: boolean;
	_storeID: string;
	constructor(
		private orderRouter: OrderRouter,
		private store: Store,
		private warehousesService: WarehousesService
	) {}

	ngOnInit() {
		this._storeID = this.store.warehouseId;
		this.warehousesService
			.getWarehouseOrderProcess(this._storeID)
			.pipe(map((store) => store.ordersShortProcess))
			.subscribe((isShortProcess) => {
				this.ordersShortProcess = isShortProcess;
			});
	}
}
