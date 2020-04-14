import { Component, OnDestroy } from '@angular/core';
import User from '@modules/server.common/entities/User';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'apollo-client/util/Observable';
import { UsersService } from '@app/@core/data/users.service';

@Component({
	selector: 'ea-customer-metrics',
	templateUrl: './ea-customer-metrics.component.html',
})
export class CustomerMetricsComponent implements OnDestroy {
	showCode: boolean = false;
	params$: Subscription;
	user: User;
	userMetrics: any;

	constructor(
		private readonly _router: ActivatedRoute,
		private userService: UsersService
	) {
		this.params$ = this._router.params.subscribe(async (r) => {
			this.userMetrics = await this.userService.getCustomerMetrics(r.id);
		});
	}

	ngOnDestroy(): void {
		if (this.params$) {
			this.params$.unsubscribe();
		}
	}
}
