import { Component } from '@angular/core';
import { UserOrdersRouter } from '@modules/client.common.angular2/routers/user-orders-router.service';
import Order from '@modules/server.common/entities/Order';
import { Store } from 'app/services/store';

@Component({
	selector: 'orders-container',
	template: '<orders *ngIf="orders " [orders]="orders"></orders>',
})
export class OrdersContainerComponent {
	// TODO: add correct type of orders variable!
	public orders: Order[];
	// public orders: Observable<Order[]>;
	// public orders: Observable<IOrderProductInfo[]>;

	constructor(
		private readonly userOrdersRouter: UserOrdersRouter,
		private readonly store: Store
	) {
		const userId = store.userId;
		// During testing: this.userOrdersRouter.getOrderedProducts('23');
		this.userOrdersRouter.get(userId).subscribe((res) => {
			this.orders = res.filter((r) => !r.isCancelled);
			res = res.filter((r) => !r.isCancelled);
		});
	}
}
