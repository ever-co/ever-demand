import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import PaymentGateways, {
	paymentGatewaysToString,
	paymentGatewaysLogo,
} from '@modules/server.common/enums/PaymentGateways';
import { Country } from '@modules/server.common/entities';
import { NgForm } from '@angular/forms';
import IPaymentGatewayCreateObject from '@modules/server.common/interfaces/IPaymentGateway';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
	selector: 'ea-stripe-gateway',
	templateUrl: './stripe-gateway.component.html',
})
export class StripeGatewayComponent {
	@ViewChild('stripeConfigForm', { static: true })
	stripeConfigForm: NgForm;

	isStripeEnabled: boolean;
	name = paymentGatewaysToString(PaymentGateways.Stripe);
	logo = paymentGatewaysLogo(PaymentGateways.Stripe);
	invalidUrl: boolean;

	private _ngDestroy$ = new Subject<void>();

	COMPANY_BRAND_LOGO =
		'FAKE_DATA.SETUP_MERCHANTS.PAYMENTS.STRIPE.COMPANY_BRAND_LOGO';

	@Input()
	currenciesCodes: string[] = [];
	@Input()
	warehouseCountry: Country;
	@Input()
	set companyBrandLogo(logo: string) {
		if (!this.configModel.companyBrandLogo) {
			this.configModel.companyBrandLogo = logo;
		}
	}

	constructor(private translateService: TranslateService) {
		// https://github.com/ngx-translate/core/issues/835
		// see how to translate words in the component(.ts) file

		translateService
			.stream(this.COMPANY_BRAND_LOGO)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((text: string) => {
				this.COMPANY_BRAND_LOGO = text;
			});
	}

	configModel = {
		payButtontext: '',
		currency: '',
		companyBrandLogo: '',
		publishableKey: '',
		allowRememberMe: true,
	};

	get isFormValid(): boolean {
		let isValid = false;

		if (this.stripeConfigForm) {
			isValid =
				(this.stripeConfigForm.touched ||
					this.stripeConfigForm.dirty) &&
				this.stripeConfigForm.valid &&
				!this.invalidUrl &&
				this.configModel.companyBrandLogo !== '';
		}

		return isValid;
	}

	get createObject(): IPaymentGatewayCreateObject | null {
		if (!this.isFormValid || !this.isStripeEnabled) {
			return null;
		}

		return {
			paymentGateway: PaymentGateways.Stripe,
			configureObject: this.configModel,
		};
	}

	deleteImg() {
		this.configModel.companyBrandLogo = '';
	}

	setValue(data) {
		this.isStripeEnabled = true;
		this.configModel.payButtontext = data['payButtontext'] || '';
		this.configModel.currency = data['currency'] || '';
		this.configModel.companyBrandLogo = data['companyBrandLogo'] || '';
		this.configModel.publishableKey = data['publishableKey'] || '';
		this.configModel.allowRememberMe = data['allowRememberMe'];
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
