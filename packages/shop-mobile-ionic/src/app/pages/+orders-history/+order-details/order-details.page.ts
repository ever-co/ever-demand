import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import Order from '@modules/server.common/entities/Order';
import { Apollo } from 'apollo-angular';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { OrderDetailsQuery } from './order-details.model';

@Component({
	templateUrl: 'order-details.page.html',
	styleUrls: ['./order-details.page.scss'],
})
export class OrderDetailsPage implements OnDestroy {
	private _ngDestroy$ = new Subject<void>();

	order: Order;

	constructor(
		private readonly _route: ActivatedRoute,
		private readonly _apollo: Apollo
	) {
		this._route.params
			.pipe(
				switchMap(({ id }) => {
					return this._apollo.query<{ getOrder: Order }>({
						query: OrderDetailsQuery,
						variables: { id },
					});
				}),
				map((res) => res.data.getOrder),
				takeUntil(this._ngDestroy$)
			)
			.subscribe((order) => {
				this.order = order;
			});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
