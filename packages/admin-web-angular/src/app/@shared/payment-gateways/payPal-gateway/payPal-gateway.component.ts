import { Component, Input, ViewChild } from '@angular/core';
import PaymentGateways, {
	paymentGatewaysToString,
	paymentGatewaysLogo,
} from '@modules/server.common/enums/PaymentGateways';
import { Country } from '@modules/server.common/entities';
import { NgForm } from '@angular/forms';
import IPaymentGatewayCreateObject from '@modules/server.common/interfaces/IPaymentGateway';

@Component({
	selector: 'ea-payPal-gateway',
	templateUrl: './payPal-gateway.component.html',
})
export class PayPalGatewayComponent {
	@ViewChild('payPalConfigForm', { static: true })
	payPalConfigForm: NgForm;

	isPayPalEnabled: boolean;
	name = paymentGatewaysToString(PaymentGateways.PayPal);
	logo = paymentGatewaysLogo(PaymentGateways.PayPal);

	@Input()
	currenciesCodes: string[] = [];
	@Input()
	warehouseCountry: Country;

	configModel = {
		currency: '',
		mode: '',
		publishableKey: '',
		secretKey: '',
		description: '',
	};

	payPalTypes = ['sandbox', 'live'];

	get isFormValid(): boolean {
		let isValid = false;

		if (this.payPalConfigForm) {
			isValid =
				(this.payPalConfigForm.touched ||
					this.payPalConfigForm.dirty) &&
				this.payPalConfigForm.valid;
		}

		return isValid;
	}

	get createObject(): IPaymentGatewayCreateObject | null {
		if (!this.isFormValid || !this.isPayPalEnabled) {
			return null;
		}

		return {
			paymentGateway: PaymentGateways.PayPal,
			configureObject: this.configModel,
		};
	}

	setValue(data) {
		this.isPayPalEnabled = true;
		this.configModel.currency = data['currency'] || '';
		this.configModel.mode = data['mode'] || '';
		this.configModel.publishableKey = data['publishableKey'] || '';
		this.configModel.secretKey = data['secretKey'] || '';
		this.configModel.description = data['description'] || '';
	}
}
