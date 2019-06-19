import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import PaymentGateways, {
	paymentGatewaysToString
} from '@modules/server.common/enums/PaymentGateways';
import { Country } from '@modules/server.common/entities';
import { countriesDefaultCurrencies } from '@modules/server.common/entities/Currency';
import { NgForm } from '@angular/forms';
import IPaymentGatewayCreateObject from '@modules/server.common/interfaces/IPaymentGateway';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
	selector: 'ea-stripe-gateway',
	templateUrl: './stripe-gateway.component.html'
})
export class StripeGatewayComponent implements OnChanges {
	@ViewChild('stripeConfigForm', { static: true })
	stripeConfigForm: NgForm;

	isStripeEnabled: boolean;
	name = paymentGatewaysToString(PaymentGateways.Stripe);
	logo = 'https://stripe.com/img/v3/home/twitter.png';
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
		this.configModel.companyBrandLogo = logo;
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
		allowRememberMe: true
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
			configureObject: this.configModel
		};
	}

	ngOnChanges(): void {
		const merchantCountry = Country[this.warehouseCountry];

		if (merchantCountry) {
			const defaultCurrency =
				countriesDefaultCurrencies[merchantCountry.toString()] || '';

			this.configModel.currency = defaultCurrency;
		}
	}

	deleteImg() {
		this.configModel.companyBrandLogo = '';
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
