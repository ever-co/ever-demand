import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import Order from '@modules/server.common/entities/Order';
import { Apollo } from 'apollo-angular';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { OrderDetailsQuery } from './order-details.model';
import { Store } from '../../../services/store.service';
import { Router } from '@angular/router';

@Component({
	templateUrl: 'order-details.page.html',
	styleUrls: ['./order-details.page.scss'],
})
export class OrderDetailsPage implements OnDestroy {
	private _ngDestroy$ = new Subject<void>();

	order: Order;

	constructor(
		private readonly _route: ActivatedRoute,
		private store: Store,
		private router: Router,
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


	async consultOrder(order: Order) {

		//this.store.startOrderDate = order.startDeliveryTime as unknown as string;
		this.store.orderId = order.id;
		this.router.navigateByUrl('/order-info');

	}

}
