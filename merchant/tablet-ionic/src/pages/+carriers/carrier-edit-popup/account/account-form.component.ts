import { Component, OnDestroy, OnInit, OnChanges } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	AbstractControl
} from '@angular/forms';

@Component({
	selector: 'account-form',
	styles: ['./account-form.component.scss'],
	templateUrl: 'account-form.component.html'
})
export class AccountFormComponent implements OnDestroy, OnInit, OnChanges {
	userName: AbstractControl;
	password: AbstractControl;
	isActive: AbstractControl;
	repeatPassword: AbstractControl;
	$password: any;
	form: FormGroup;

	constructor(private formBuilder: FormBuilder) {}

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
					}
				]
			],
			isActive: [true, Validators.required]
		});
	}

	bindFormControls() {
		this.userName = this.form.get('userName');
		this.password = this.form.get('password');
		this.isActive = this.form.get('isActive');
		this.repeatPassword = this.form.get('repeatPassword');
	}

	ngOnDestroy(): void {
		if (this.$password) {
			this.$password.unsubscribe();
		}
	}
}
