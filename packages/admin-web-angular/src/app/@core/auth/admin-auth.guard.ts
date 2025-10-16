import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	CanActivate,
	Router,
	RouterStateSnapshot,
} from '@angular/router';
import { Apollo, gql } from 'apollo-angular';

@Injectable()
export class AdminAuthGuard implements CanActivate {
	constructor(
		private readonly router: Router,
		private readonly apollo: Apollo
	) {}

	async isAuthenticated() {
		const res = await this.apollo
			.query<{ adminAuthenticated: boolean }>({
				query: gql`
					query IsAdminAuthenticated {
						adminAuthenticated
					}
				`,
				fetchPolicy: 'network-only',
			})
			.toPromise();

		return res.data.adminAuthenticated;
	}

	async canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	) {
		if (await this.isAuthenticated()) {
			// logged in so return true
			return true;
		}

		// not logged in so redirect to login page with the return url
		this.router.navigate(['/auth/login'], {
			queryParams: { returnUrl: state.url },
		});

		return false;
	}
}
