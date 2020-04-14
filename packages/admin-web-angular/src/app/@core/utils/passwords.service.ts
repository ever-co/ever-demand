import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable()
export class PasswordsService {
	static generatePassword() {
		const min = 7;
		const max = 10;

		const length = Math.floor(Math.random() * (max - min + 1)) + min;

		const charset = environment.GENERATE_PASSWORD_CHARSET;

		let password = '';

		for (let i = 0, n = charset.length; i < length; ++i) {
			password += charset.charAt(Math.floor(Math.random() * n));
		}

		return password;
	}
}
