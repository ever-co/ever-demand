import { Component, OnDestroy, OnInit, OnChanges } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	AbstractControl,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { ICarrierCreateObject } from '@modules/server.common/interfaces/ICarrier';

export type CarrierBasicInfo = Pick<
	ICarrierCreateObject,
	'firstName' | 'lastName' | 'phone' | 'email' | 'logo'
>;

@Component({
	selector: 'basic-info-form',
	styleUrls: ['./basic-info-form.component.scss'],
	templateUrl: 'basic-info-form.component.html',
})
export class BasicInfoFormComponent implements OnDestroy, OnInit, OnChanges {
	form: FormGroup;

	firstName: AbstractControl;
	lastName: AbstractControl;
	logo: AbstractControl;
	phone: AbstractControl;
	email: AbstractControl;

	private _ngDestroy$ = new Subject<void>();
	private static phoneNumberRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9x]*$/;

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	constructor(private formBuilder: FormBuilder) {
		this.buildForm(this.formBuilder);
	}

	ngOnInit() {
		this.bindFormControls();
	}

	ngOnChanges(): void {}

	get isFirstNameValid() {
		return (
			this.firstName.errors &&
			(this.firstName.dirty || this.firstName.touched)
		);
	}

	get isLastNameValid() {
		return (
			this.lastName.errors &&
			(this.lastName.dirty || this.lastName.touched)
		);
	}

	get isPhoneValid() {
		return this.phone && (this.phone.dirty || this.phone.touched);
	}

	get isEmailValid() {
		return this.email && (this.email.dirty || this.email.touched);
	}

	buildForm(formBuilder: FormBuilder) {
		this.form = formBuilder.group({
			firstName: [
				'',
				[
					Validators.required,
					Validators.pattern(new RegExp(`^[a-z ,.'-]+$`, 'i')),
				],
			],
			lastName: [
				'',
				[
					Validators.required,
					Validators.pattern(new RegExp(`^[a-z ,.'-]+$`, 'i')),
				],
			],
			phone: [
				'',
				[
					Validators.required,
					Validators.pattern(BasicInfoFormComponent.phoneNumberRegex),
				],
			],
			email: ['', Validators.required],
			logo: [''],
		});
	}

	bindFormControls() {
		this.firstName = this.form.get('firstName');
		this.lastName = this.form.get('lastName');
		this.logo = this.form.get('logo');
		this.email = this.form.get('email');
		this.phone = this.form.get('phone');
	}

	deleteImg() {
		this.logo.setValue('');
	}
}
