import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
	selector: 'ea-merchants-setup-account',
	templateUrl: './account.component.html',
	styleUrls: ['./account.component.scss'],
})
export class SetupMerchantAccountComponent {
	@ViewChild('accountForm', { static: true })
	accountForm: NgForm;

	@Output()
	previousStep: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output()
	nextStep: EventEmitter<boolean> = new EventEmitter<boolean>();

	accountModel = {
		email: '',
		username: '',
		password: '',
		repeatPassword: '',
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
