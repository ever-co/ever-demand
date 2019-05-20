import { Component, Input } from '@angular/core';
import PaymentGateways, {
	paymentGatewaysToString
} from '@modules/server.common/enums/PaymentGateways';

@Component({
	selector: 'ea-stripe-gateway',
	templateUrl: './stripe-gateway.component.html'
})
export class StripeGatewayComponent {
	isStripeEnabled: boolean;
	name = paymentGatewaysToString(PaymentGateways.Stripe);
	logo = 'https://stripe.com/img/v3/home/twitter.png';
	invalidUrl: boolean;

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

	deleteImg() {
		this.configModel.companyBrandLogo = '';
	}
}
