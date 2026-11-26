import { Component, ChangeDetectionStrategy } from '@angular/core';
import { first } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Store } from '../../services/store.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { RoutersService } from '@modules/client.common.angular2/lib/router';

@Component({
	standalone: false,
	selector: 'page-login',
	templateUrl: 'login.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrls: ['login.scss'],
})
export class LoginPage {
	user;
	loginLogo: string;

	constructor(
		private authService: AuthService,
		private store: Store,
		private router: Router,
		private routers: RoutersService,
	) {
		this.user = {
			username: environment.DEFAULT_LOGIN_USERNAME,
			password: environment.DEFAULT_LOGIN_PASSWORD,
		};
		this.loginLogo = environment.LOGIN_LOGO;
	}

	async login() {
		const res = await this.authService
			.login(this.user.username, this.user.password)
			.pipe(first())
			.toPromise();

		if (!res || !res.carrier) {
			alert('Carrier not exists!');
			return;
		}

		console.log(`Carrier logged in with id ${res.carrier.id}`);

		this.store.carrierId = res.carrier.id;
		this.store.token = res.token;
		// the sockets handshake again with the token, so the API serves
		// the carrier's tenant (DESIGN.md §3.5)
		this.routers.reconnectAll();

		this.router.navigateByUrl('main', { skipLocationChange: false });
	}
}
