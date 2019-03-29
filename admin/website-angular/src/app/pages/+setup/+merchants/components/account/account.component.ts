import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
	selector: 'ea-merchants-setup-account',
	templateUrl: './account.component.html',
	styleUrls: ['./account.component.scss']
})
export class AccountComponent {
	@ViewChild('accountForm')
	accountForm: NgForm;

	account = {
		email: '',
		username: '',
		password: '',
		repeatPassword: ''
	};

	get formValid() {
		return (
			this.accountForm.valid &&
			this.account.password === this.account.repeatPassword
		);
	}
}
