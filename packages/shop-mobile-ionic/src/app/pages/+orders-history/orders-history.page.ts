import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
} from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Store } from '../../services/store.service';
import { Apollo } from 'apollo-angular';
import { OrdersHistoryQuery } from './orders-history.model';
import { Platform } from '@ionic/angular';

@Component({
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
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
			// Apollo Client 4 can emit a loading result without data first.
			filter((res) => !!res.data?.getOrders),
			map((res) => res.data.getOrders as Order[]),
			takeUntil(this._ngDestroy$)
		);

	constructor(
		private readonly _store: Store,
		private readonly _apollo: Apollo,
		public platform: Platform
	) {}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	getStatusText(order: Order) {
		return order.getStatusText(this._store.language);
	}
}
