import { Component, Input, OnChanges } from '@angular/core';
import PaymentGateways, {
	paymentGatewaysToString
} from '@modules/server.common/enums/PaymentGateways';
import { Country } from '@modules/server.common/entities';
import { countriesDefaultCurrencies } from '@modules/server.common/entities/Currency';

@Component({
	selector: 'ea-payPal-gateway',
	templateUrl: './payPal-gateway.component.html'
})
export class PayPalGatewayComponent implements OnChanges {
	isPayPalEnabled: boolean;
	name = paymentGatewaysToString(PaymentGateways.PayPal);
	logo = 'https://avatars1.githubusercontent.com/u/476675?s=200&v=4';

	@Input()
	currenciesCodes: string[] = [];
	@Input()
	warehouseCountry: Country;

	configModel = {
		currency: '',
		mode: '',
		publishableKey: '',
		secretKey: '',
		description: ''
	};

	payPalTypes = ['sandbox', 'live'];

	get isFormValid(): boolean {
		let isValid = false;

		return isValid;
	}

	ngOnChanges(): void {
		const defaultCurrency =
			countriesDefaultCurrencies[
				Country[this.warehouseCountry].toString()
			] || '';

		this.configModel.currency = defaultCurrency;
	}
}
