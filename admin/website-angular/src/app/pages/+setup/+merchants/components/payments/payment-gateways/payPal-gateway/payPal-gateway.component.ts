import { Component } from '@angular/core';
import PaymentGateways, {
	paymentGatewaysToString
} from '@modules/server.common/enums/PaymentGateways';

@Component({
	selector: 'ea-payPal-gateway',
	templateUrl: './payPal-gateway.component.html'
})
export class PayPalGatewayComponent {
	isPayPalEnabled: boolean;
	name = paymentGatewaysToString(PaymentGateways.PayPal);
	logo = 'https://avatars1.githubusercontent.com/u/476675?s=200&v=4';
}
