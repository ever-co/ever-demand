import { Component, OnDestroy } from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Store } from '../../services/store.service';
import { Apollo } from 'apollo-angular';
import { OrdersHistoryQuery } from './orders-history.model';

@Component({
	selector: 'e-cu-orders-history',
	templateUrl: './orders-history.page.html',
	styleUrls: ['./orders-history.page.scss'],
})
export class OrdersHistoryPage implements OnDestroy {
	private _ngDestroy$ = new Subject<void>();

	readonly orders$ = this._apollo
		.watchQuery<{ getOrders: Order[] }>({
			query: OrdersHistoryQuery,
			variables: { userId: this._store.userId },
		})
		.valueChanges.pipe(
			map((res) => res.data.getOrders),
			takeUntil(this._ngDestroy$)
		);

	constructor(
		private readonly _store: Store,
		private readonly _apollo: Apollo
	) {}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	getStatusText(order: Order) {
		return order.getStatusText(this._store.language);
	}
}
