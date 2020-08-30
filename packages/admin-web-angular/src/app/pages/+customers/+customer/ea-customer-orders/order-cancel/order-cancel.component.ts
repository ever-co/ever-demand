import { Component, OnInit } from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import { OrdersService } from '../../../../../@core/data/orders.service';
import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';

@Component({
	styleUrls: ['./order-cancel.component.scss'],
	templateUrl: './order-cancel.component.html',
})
export class OrderCancelComponent implements OnInit {
	public orderId: string;
	public order$: Observable<Order>;

	constructor(
		private readonly _orderService: OrdersService,
		private readonly activeModal: NgbActiveModal,
		private warehouseOrderdersRouter: WarehouseOrdersRouter
	) {}

	cancel() {
		this.activeModal.dismiss('canceled');
	}
	async cancelOrder() {
		const cncld = await this.warehouseOrderdersRouter.cancel(this.orderId);
		this.cancel();
	}

	ngOnInit(): void {}
}
