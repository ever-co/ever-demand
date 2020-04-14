import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';
import { Store } from '../../services/store.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
	selector: 'page-login',
	templateUrl: 'login.html',
	styleUrls: ['./login.scss'],
})
export class LoginPage {
	username: string = '';
	password: string = '';
	loginLogo: string;

	constructor(
		private authService: AuthService,
		private store: Store,
		private router: Router
	) {
		localStorage.removeItem('_warehouseId');
		localStorage.removeItem('_language');
		localStorage.removeItem('token');
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

		this.router.navigate(['warehouse']);
	}
}
