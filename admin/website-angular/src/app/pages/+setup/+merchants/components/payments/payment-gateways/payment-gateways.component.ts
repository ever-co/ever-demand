import { Component, Input, ViewChild } from '@angular/core';
import { Country } from '@modules/server.common/entities';
import { StripeGatewayComponent } from './stripe-gateway/stripe-gateway.component';
import { PayPalGatewayComponent } from './payPal-gateway/payPal-gateway.component';

@Component({
	selector: 'ea-payment-gateways',
	templateUrl: './payment-gateways.component.html'
})
export class PaymentGatewaysComponent {
	@ViewChild('stripeGateway')
	stripeGateway: StripeGatewayComponent;

	@ViewChild('payPalGateway')
	payPalGateway: PayPalGatewayComponent;

	@Input()
	warehouseLogo: string;
	@Input()
	warehouseCountry: Country;

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
}
