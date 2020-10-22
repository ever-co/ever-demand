import { Component, Input, OnInit } from '@angular/core';
import { OrdersService } from 'app/services/orders/orders.service';
import { Store } from 'app/services/store.service';
import { first } from 'rxjs/operators';

@Component({
	selector: 'e-cu-order-sign',
	templateUrl: './order-sign.component.html',
	styleUrls: ['./order-sign.component.scss'],
})
export class OrderSignComponent implements OnInit {
	totalPrice = 0;

	constructor(private store: Store, private ordersService: OrdersService) {}

	ngOnInit(): void {
		this.getPrice();
	}

	async getPrice() {
		const orderId = this.store.orderId;

		if (orderId) {
			const { totalPrice } = await this.ordersService
				.getOrder(this.store.orderId, `{totalPrice}`)
				.pipe(first())
				.toPromise();

			this.totalPrice = totalPrice;
		}
	}
}
