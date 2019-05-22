import { Component, Input, OnChanges } from '@angular/core';
import PaymentGateways, {
	paymentGatewaysToString
} from '@modules/server.common/enums/PaymentGateways';
import { CurrenciesService } from 'app/@core/data/currencies.service';
import { first } from 'rxjs/operators';
import { Country } from '@modules/server.common/entities';
import { countriesDefaultCurrencies } from '@modules/server.common/entities/Currency';

@Component({
	selector: 'ea-stripe-gateway',
	templateUrl: './stripe-gateway.component.html'
})
export class StripeGatewayComponent implements OnChanges {
	isStripeEnabled: boolean;
	name = paymentGatewaysToString(PaymentGateways.Stripe);
	logo = 'https://stripe.com/img/v3/home/twitter.png';
	invalidUrl: boolean;
	currenciesCodes: string[] = [];

	@Input()
	warehouseCountry: Country;
	@Input()
	set companyBrandLogo(logo: string) {
		this.configModel.companyBrandLogo = logo;
	}

	configModel = {
		payButtontext: '',
		currency: '',
		companyBrandLogo: '',
		allowRememberMe: true
	};

	constructor(private currenciesService: CurrenciesService) {
		this.loadCurrenciesCodes();
	}

	ngOnChanges(): void {
		const cefaultCurrency =
			countriesDefaultCurrencies[
				Country[this.warehouseCountry].toString()
			] || '';

		this.configModel.currency = cefaultCurrency;
	}

	deleteImg() {
		this.configModel.companyBrandLogo = '';
	}

	private async loadCurrenciesCodes() {
		const res = await this.currenciesService
			.getCurrencies()
			.pipe(first())
			.toPromise();

		if (res) {
			this.currenciesCodes = res.map((r) => r.currencyCode);
		}
	}
}
