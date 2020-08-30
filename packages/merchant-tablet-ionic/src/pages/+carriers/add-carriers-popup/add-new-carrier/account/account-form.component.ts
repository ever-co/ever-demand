import { Component, Input, OnDestroy, OnInit, OnChanges } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	AbstractControl,
} from '@angular/forms';

import { Subject } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'account-form',
	styleUrls: ['./account-form.component.scss'],
	templateUrl: 'account-form.component.html',
})
export class AccountFormComponent implements OnDestroy, OnInit, OnChanges {
	userName: AbstractControl;
	password: AbstractControl;
	isActive: AbstractControl;
	isSharedCarrier: AbstractControl;
	repeatPassword: AbstractControl;

	$password: any;

	form: FormGroup;

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private formBuilder: FormBuilder,
		private translate: TranslateService
	) {}

	ngOnInit() {
		this.buildForm(this.formBuilder);

		this.bindFormControls();
		this.repeatPassword = this.form.get('repeatPassword');

		this.$password = this.password.valueChanges.subscribe((res) => {
			this.repeatPassword.setValue('');
		});
	}

	ngOnChanges(): void {}

	buildForm(formBuilder: FormBuilder) {
		this.form = formBuilder.group({
			userName: ['', Validators.required],
			password: ['', Validators.required],
			repeatPassword: [
				'',
				[
					(control: AbstractControl) => {
						if (this.password) {
							return control.value === this.password.value
								? null
								: { validUrl: true };
						} else {
							return null;
						}
					},
				],
			],
			isActive: [true, Validators.required],
			isSharedCarrier: [false],
		});
	}

	bindFormControls() {
		this.userName = this.form.get('userName');
		this.password = this.form.get('password');
		this.repeatPassword = this.form.get('repeatPassword');
		this.isActive = this.form.get('isActive');
		this.isSharedCarrier = this.form.get('isSharedCarrier');
	}

	ngOnDestroy(): void {
		if (this.$password) {
			this.$password.unsubscribe();
		}
	}
}
