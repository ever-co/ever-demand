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

	accountModel = {
		email: '',
		username: '',
		password: '',
		repeatPassword: ''
	};

	get formValid() {
		return (
			this.accountForm.valid &&
			this.accountModel.password === this.accountModel.repeatPassword
		);
	}

	emailChange() {
		let targetIndex = this.accountModel.email.indexOf('@');
		if (targetIndex > 0 && this.accountModel.username === '') {
			let defaultUsername = this.accountModel.email.substring(
				0,
				targetIndex
			);

			this.accountModel.username = defaultUsername;
		}
	}
}
