import { Component, NgZone } from '@angular/core';
import { UserOrdersRouter } from '@modules/client.common.angular2/routers/user-orders-router.service';
import Order from '@modules/server.common/entities/Order';
import { Store } from 'app/services/store';

@Component({
	selector: 'orders-container',
	template: `
		<orders *ngIf="orders" [orders]="orders"></orders>
		<div
			*ngIf="!orders.length"
			style="text-align:center; font-size:28px;margin:20px 0"
		>
			There are no orders ...
		</div>
	`,
})
export class OrdersContainerComponent {
	public orders: Order[] = [];

	constructor(
		private readonly userOrdersRouter: UserOrdersRouter,
		private readonly ngZone: NgZone,
		private readonly store: Store
	) {
		const userId = store.userId;

		// During testing: this.userOrdersRouter.getOrderedProducts('23');
		this.userOrdersRouter.get(userId).subscribe((res) => {
			this.ngZone.run(() => {
				this.orders = res.filter((r) => !r.isCancelled);
			});
		});
	}
}
