import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';
import { Store } from '../../services/store.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { RoutersService } from '@modules/client.common.angular2/lib/router';

@Component({
	standalone: false,
	selector: 'page-login',
	templateUrl: 'login.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrls: ['./login.scss'],
})
export class LoginPage {
	username: string = '';
	password: string = '';
	loginLogo: string;

	constructor(
		private authService: AuthService,
		private store: Store,
		private router: Router,
		private routers: RoutersService,
	) {
		// Opening the login page signs out (the menu's "Sign out" links here).
		const wasLoggedIn = localStorage.getItem('token') != null;
		localStorage.removeItem('_warehouseId');
		localStorage.removeItem('_language');
		localStorage.removeItem('token');
		if (wasLoggedIn) {
			// the sockets handshake again without the old store's token
			this.routers.reconnectAll();
		}
		this.username = environment.DEFAULT_LOGIN_USERNAME;
		this.password = environment.DEFAULT_LOGIN_PASSWORD;
		this.loginLogo = environment.LOGIN_LOGO;
	}

	async login() {
		const res = await this.authService
			.login(this.username, this.password)
			.pipe(first())
			.toPromise();

		if (!res) {
			alert('Merchant not found!');
			return;
		}

		console.log(`Merchant logged in with id ${res.warehouse.id}`);

		this.store.warehouseId = res.warehouse.id;
		this.store.token = res.token;
		// the sockets handshake again with the token, so the API serves
		// the store's tenant (DESIGN.md §3.5)
		this.routers.reconnectAll();

		this.router.navigate(['warehouse']);
	}
}
