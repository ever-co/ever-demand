import { Component } from '@angular/core';
import PaymentGateways, {
	paymentGatewaysToString
} from '@modules/server.common/enums/PaymentGateways';

@Component({
	selector: 'ea-stripe-gateway',
	templateUrl: './stripe-gateway.component.html'
})
export class StripeGatewayComponent {
	name = paymentGatewaysToString(PaymentGateways.Stripe);
	logo =
		'https://www.chargekeep.com/wp-content/uploads/2018/02/stripe-logo.png';
}
