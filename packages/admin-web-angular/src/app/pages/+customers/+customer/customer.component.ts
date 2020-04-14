import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../@core/data/users.service';
import User from '@modules/server.common/entities/User';
import { Observable, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

@Component({
	selector: 'ea-customer',
	templateUrl: './customer.component.html',
	styleUrls: ['./customer.component.scss'],
})
export class CustomerComponent implements OnInit, OnDestroy {
	user$: Observable<User>;
	users: User[] = [];
	selectedUser: User;

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly _userService: UsersService,
		private readonly _router: ActivatedRoute,
		private readonly _route: Router
	) {}

	ngOnInit() {
		this.user$ = this._router.params.switchMap((p) => {
			return this._userService.getUserById(p.id);
		});

		(async () => {
			return this.loadUsers();
		})();
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	async loadUsers() {
		this._userService
			.getUsers()
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((users) => {
				this.users = users;
				this._selectCurrentUser();
			});
	}

	async customerSelect(e) {
		this._route.navigate([`/customers/list/${e.id}`]);
		await this.loadUsers();
	}

	private async _selectCurrentUser() {
		const routeParams = await this._router.params.pipe(first()).toPromise();
		this.selectedUser = this.users.filter(
			(u) => u.id === routeParams.id
		)[0];
	}
}
