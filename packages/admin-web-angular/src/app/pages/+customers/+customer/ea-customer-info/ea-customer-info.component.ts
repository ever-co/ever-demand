import { Component, OnDestroy } from '@angular/core';
import User from '@modules/server.common/entities/User';
import { UsersService } from '../../../../@core/data/users.service';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

@Component({
	selector: 'ea-customer-info',
	styleUrls: ['ea-customer-info.component.scss'],
	templateUrl: './ea-customer-info.component.html',
})
export class CustomerInfoComponent implements OnDestroy {
	showCode: boolean = false;
	params$: any;
	user: User;

	constructor(
		private readonly _userService: UsersService,
		private readonly _router: ActivatedRoute
	) {
		this.params$ = this._router.params.subscribe(async (r) => {
			this.user = await this._userService
				.getUserById(r.id)
				.pipe(first())
				.toPromise();
		});
	}

	ngOnDestroy(): void {
		if (this.params$) {
			this.params$.unsubscribe();
		}
	}
}
