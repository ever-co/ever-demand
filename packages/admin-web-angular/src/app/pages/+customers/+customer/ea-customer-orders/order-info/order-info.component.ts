import { Component, OnInit } from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import { OrdersService } from '../../../../../@core/data/orders.service';
import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
	styleUrls: ['./order-info.component.scss'],
	templateUrl: './order-info.component.html',
})
export class OrderInfoComponent implements OnInit {
	public orderId: string;
	public storeId: string;
	public carrierId: string;
	public order$: Observable<Order>;

	public selectedOrder: any;

	constructor(
		private readonly _orderService: OrdersService,
		private readonly activeModal: NgbActiveModal,
		private router: Router
	) {}

	cancel() {
		this.activeModal.dismiss('canceled');
	}

	ngOnInit(): void {
		this.order$ = this._orderService.getOrderById(this.orderId);
	}

	redirectToOrderPage() {
		this.router.navigate([`/orders/${this.orderId}`]);
		this.activeModal.dismiss('canceled');
	}

	redirectToStorePage() {
		this.router.navigate([`/stores/${this.storeId}`]);
		this.activeModal.dismiss('canceled');
	}

	redirectToCarrierPage() {
		this.router.navigate([`/carriers/${this.carrierId}`]);
		this.activeModal.dismiss('canceled');
	}
}
