import { Component } from '@angular/core';
import { first } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Store } from '../../services/store.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
	selector: 'page-login',
	templateUrl: 'login.html',
	styleUrls: ['login.scss'],
})
export class LoginPage {
	user;
	loginLogo: string;

	constructor(
		private authService: AuthService,
		private store: Store,
		private router: Router
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

		this.router.navigateByUrl('main', { skipLocationChange: false });
	}
}
