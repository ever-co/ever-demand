import { Component, Input } from '@angular/core';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import DeliveryType from '@modules/server.common/enums/DeliveryType';

@Component({
	selector: 'order-control-buttons',
	templateUrl: 'order-control-buttons.html',
	styleUrls: ['./order-control-buttons.scss'],
})
export class OrderControlButtonsComponent {
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

	constructor(private orderRouter: OrderRouter) {}
}
