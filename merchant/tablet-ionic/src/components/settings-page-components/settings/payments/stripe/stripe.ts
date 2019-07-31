import { Component, OnInit, Input } from '@angular/core';
import {
	FormGroup,
	AbstractControl,
	FormBuilder,
	Validators
} from '@angular/forms';

@Component({
	selector: 'e-cu-stripe-gateway',
	templateUrl: './stripe.html',
	styleUrls: ['stripe.scss']
})
export class StripeGatewayComponent implements OnInit {
	@Input()
	currenciesCodes: string[] = [];

	form: FormGroup;

	payButtontext: AbstractControl;
	currency: AbstractControl;
	companyBrandLogo: AbstractControl;
	publishableKey: AbstractControl;
	allowRememberMe: AbstractControl;

	invalidUrl: boolean;

	constructor(private formBuilder: FormBuilder) {
		this.buildForm(this.formBuilder);
	}

	ngOnInit() {
		this.bindFormControls();
	}

	bindFormControls() {
		this.payButtontext = this.form.get('payButtontext');
		this.currency = this.form.get('currency');
		this.companyBrandLogo = this.form.get('companyBrandLogo');
		this.publishableKey = this.form.get('publishableKey');
		this.allowRememberMe = this.form.get('allowRememberMe');
	}

	deleteImg() {
		this.companyBrandLogo.setValue('');
	}

	private buildForm(formBuilder: FormBuilder) {
		this.form = formBuilder.group({
			payButtontext: ['', [Validators.required]],
			currency: ['', [Validators.required]],
			companyBrandLogo: ['', [Validators.required]],
			publishableKey: ['', Validators.required],
			allowRememberMe: ['']
		});
	}
}
