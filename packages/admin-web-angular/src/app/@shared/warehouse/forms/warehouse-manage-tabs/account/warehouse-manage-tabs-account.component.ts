import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {
	FormGroup,
	FormBuilder,
	Validators,
	AbstractControl,
} from '@angular/forms';

@Component({
	selector: 'ea-warehouse-manage-tabs-account',
	styleUrls: ['./warehouse-manage-tabs-account.component.scss'],
	templateUrl: './warehouse-manage-tabs-account.component.html',
})
export class WarehouseManageTabsAccountComponent implements OnInit, OnDestroy {
	static password: AbstractControl;

	static initialize(passwordControl: AbstractControl) {
		this.password = passwordControl;
	}

	static clean() {
		WarehouseManageTabsAccountComponent.password = null;
	}

	static buildForm(formBuilder: FormBuilder) {
		return formBuilder.group({
			username: ['', [Validators.required]],
			password: formBuilder.group({
				current: [''],
				new: [''],
				confirm: [
					'',
					[
						(control: AbstractControl) => {
							if (this.password) {
								return control.value.length > 0 &&
									control.value !== this.password.value
									? { notMatch: true }
									: null;
							}
						},
					],
				],
			}),
		});
	}

	@Input()
	readonly form: FormGroup;

	get username() {
		return this.form.get('username');
	}
	get password() {
		return this.form.get('password');
	}
	get passwordNew() {
		return this.password.get('new');
	}
	get passwordConfirm() {
		return this.password.get('confirm');
	}

	ngOnInit() {
		WarehouseManageTabsAccountComponent.initialize(this.passwordNew);
	}

	ngOnDestroy() {
		WarehouseManageTabsAccountComponent.clean();
	}

	getValue() {
		const accountInfo = this.form.getRawValue() as {
			username: string;
			password: {
				current: string;
				new: string;
				confirm: string;
			};
		};

		return accountInfo;
	}

	setValue(username: string) {
		this.username.setValue(username);
	}
}
