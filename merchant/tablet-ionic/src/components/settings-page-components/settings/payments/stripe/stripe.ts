import { Component, OnInit, Input, OnDestroy, Output } from '@angular/core';
import {
	FormGroup,
	AbstractControl,
	FormBuilder,
	Validators
} from '@angular/forms';
import { Subject } from 'rxjs';
import PaymentGateways from '@modules/server.common/enums/PaymentGateways';
import { IPaymentGatewayCreateObject } from '@modules/server.common/interfaces/IPaymentGateway';

@Component({
	selector: 'e-cu-stripe-gateway',
	templateUrl: './stripe.html',
	styleUrls: ['stripe.scss']
})
export class StripeGatewayComponent implements OnInit, OnDestroy {
	@Input()
	currenciesCodes: string[] = [];
	@Input()
	defaultCompanyBrandLogo: string;
	@Input()
	defaultCurrency: string;

	@Output()
	configureObject = new Subject();

	form: FormGroup;

	payButtontext: AbstractControl;
	currency: AbstractControl;
	companyBrandLogo: AbstractControl;
	publishableKey: AbstractControl;
	allowRememberMe: AbstractControl;

	invalidUrl: boolean;

	constructor(private formBuilder: FormBuilder) {}

	ngOnInit() {
		this.buildForm(this.formBuilder);
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

	ngOnDestroy(): void {
		this.configureObject.next(this.getConfigureObject());
	}

	private buildForm(formBuilder: FormBuilder) {
		console.log(this.defaultCompanyBrandLogo);

		this.form = formBuilder.group({
			payButtontext: ['', [Validators.required]],
			currency: [this.defaultCurrency, [Validators.required]],
			companyBrandLogo: [
				this.defaultCompanyBrandLogo,
				[Validators.required]
			],
			publishableKey: ['', Validators.required],
			allowRememberMe: ['']
		});
	}

	private getConfigureObject(): IPaymentGatewayCreateObject {
		return {
			paymentGateway: PaymentGateways.Stripe,
			configureObject: this.form.getRawValue()
		};
	}
}
