import { Component, Input } from '@angular/core';
import PaymentGateways, {
	paymentGatewaysToString
} from '@modules/server.common/enums/PaymentGateways';
import { CurrenciesService } from 'app/@core/data/currencies.service';
import { first } from 'rxjs/operators';

@Component({
	selector: 'ea-stripe-gateway',
	templateUrl: './stripe-gateway.component.html'
})
export class StripeGatewayComponent {
	isStripeEnabled: boolean;
	name = paymentGatewaysToString(PaymentGateways.Stripe);
	logo = 'https://stripe.com/img/v3/home/twitter.png';
	invalidUrl: boolean;
	currenciesCodes: string[] = [];

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
