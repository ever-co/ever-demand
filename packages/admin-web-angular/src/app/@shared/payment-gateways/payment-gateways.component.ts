import { Component, Input, ViewChild, OnChanges } from '@angular/core';
import { Country } from '@modules/server.common/entities';
import { StripeGatewayComponent } from './stripe-gateway/stripe-gateway.component';
import { PayPalGatewayComponent } from './payPal-gateway/payPal-gateway.component';
import IPaymentGatewayCreateObject from '@modules/server.common/interfaces/IPaymentGateway';
import { CurrenciesService } from '@app/@core/data/currencies.service';
import { first } from 'rxjs/operators';
import Warehouse from '@modules/server.common/entities/Warehouse';
import PaymentGateways from '@modules/server.common/enums/PaymentGateways';
import { countriesDefaultCurrencies } from '@modules/server.common/entities/Currency';

@Component({
	selector: 'ea-payment-gateways',
	templateUrl: './payment-gateways.component.html',
})
export class PaymentGatewaysComponent implements OnChanges {
	@ViewChild('stripeGateway')
	stripeGateway: StripeGatewayComponent;

	@ViewChild('payPalGateway')
	payPalGateway: PayPalGatewayComponent;

	@Input()
	warehouseLogo: string;
	@Input()
	warehouseCountry: Country;
	@Input()
	isEdit: boolean;

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

	ngOnChanges(): void {
		const merchantCountry = Country[this.warehouseCountry];

		if (merchantCountry) {
			const defaultCurrency =
				countriesDefaultCurrencies[merchantCountry.toString()] || '';

			if (
				this.stripeGateway &&
				(!this.isEdit || !this.stripeGateway.configModel.currency)
			) {
				this.stripeGateway.configModel.currency = defaultCurrency;
			}

			if (
				this.payPalGateway &&
				(!this.isEdit || !this.payPalGateway.configModel.currency)
			) {
				this.payPalGateway.configModel.currency = defaultCurrency;
			}
		}
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

	setValue(merchant: Warehouse) {
		if (merchant.paymentGateways) {
			const stripeConfigObj = merchant.paymentGateways.find(
				(g) => g.paymentGateway === PaymentGateways.Stripe
			);

			if (stripeConfigObj) {
				this.stripeGateway.setValue(stripeConfigObj.configureObject);
			}

			const payPalConfigObj = merchant.paymentGateways.find(
				(g) => g.paymentGateway === PaymentGateways.PayPal
			);

			if (payPalConfigObj) {
				this.payPalGateway.setValue(payPalConfigObj.configureObject);
			}
		}
	}
}
