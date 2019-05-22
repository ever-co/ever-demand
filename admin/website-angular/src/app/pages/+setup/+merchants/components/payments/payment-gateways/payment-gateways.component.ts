import { Component, Input, ViewChild } from '@angular/core';
import { Country } from '@modules/server.common/entities';
import { StripeGatewayComponent } from './stripe-gateway/stripe-gateway.component';

@Component({
	selector: 'ea-payment-gateways',
	templateUrl: './payment-gateways.component.html'
})
export class PaymentGatewaysComponent {
	@ViewChild('stripeGateway')
	stripeGateway: StripeGatewayComponent;

	@Input()
	warehouseLogo: string;
	@Input()
	warehouseCountry: Country;

	get isValid(): boolean {
		let valid = false;
		if (this.stripeGateway.isStripeEnabled) {
			if (this.stripeGateway.isStripeEnabled) {
				valid = this.stripeGateway.isFormValid;
			}
		}

		return valid;
	}
}
