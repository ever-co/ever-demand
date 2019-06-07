import { Component, Input, ViewChild } from '@angular/core';
import { Country } from '@modules/server.common/entities';
import { StripeGatewayComponent } from './stripe-gateway/stripe-gateway.component';
import { PayPalGatewayComponent } from './payPal-gateway/payPal-gateway.component';
import IPaymentGatewayCreateObject from '@modules/server.common/interfaces/IPaymentGateway';
import { CurrenciesService } from 'app/@core/data/currencies.service';
import { first } from 'rxjs/operators';

@Component({
	selector: 'ea-payment-gateways',
	templateUrl: './payment-gateways.component.html'
})
export class PaymentGatewaysComponent {
	@ViewChild('stripeGateway', { static: true })
	stripeGateway: StripeGatewayComponent;

	@ViewChild('payPalGateway', { static: true })
	payPalGateway: PayPalGatewayComponent;

	@Input()
	warehouseLogo: string;
	@Input()
	warehouseCountry: Country;

	currenciesCodes: string[] = [];

	constructor(private currenciesService: CurrenciesService) {
		this.loadCurrenciesCodes();
	}

	get isValid(): boolean {
		let valid = false;
		if (
			this.stripeGateway.isStripeEnabled ||
			this.payPalGateway.isPayPalEnabled
		) {
			if (this.stripeGateway.isStripeEnabled) {
				valid = this.stripeGateway.isFormValid;

				if (!valid) {
					return;
				}
			}

			if (this.payPalGateway.isPayPalEnabled) {
				valid = this.payPalGateway.isFormValid;

				if (!valid) {
					return;
				}
			}
		}

		return valid;
	}

	get paymentsGateways(): IPaymentGatewayCreateObject[] {
		const paymentsGateways = [];

		const stripeGatewayCreateObject = this.stripeGateway.createObject;
		const payPalGatewayCreateObject = this.payPalGateway.createObject;

		if (stripeGatewayCreateObject) {
			paymentsGateways.push(stripeGatewayCreateObject);
		}

		if (payPalGatewayCreateObject) {
			paymentsGateways.push(payPalGatewayCreateObject);
		}

		return paymentsGateways;
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
