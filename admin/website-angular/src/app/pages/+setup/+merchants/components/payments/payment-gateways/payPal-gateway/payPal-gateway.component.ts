import { Component } from '@angular/core';
import PaymentGateways, {
	paymentGatewaysToString
} from '@modules/server.common/enums/PaymentGateways';

@Component({
	selector: 'ea-payPal-gateway',
	templateUrl: './payPal-gateway.component.html'
})
export class PayPalGatewayComponent {
	name = paymentGatewaysToString(PaymentGateways.PayPal);
	logo: 'https://www.worldlandtrust.org/wp-content/uploads/2019/03/PayPal_logo-385.jpg';
}
