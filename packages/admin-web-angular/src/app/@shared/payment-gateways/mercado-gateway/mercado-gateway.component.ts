import { Component, Input, ViewChild } from '@angular/core';
import PaymentGateways, {
	paymentGatewaysToString,
	paymentGatewaysLogo,
} from '@modules/server.common/enums/PaymentGateways';
import { Country } from '@modules/server.common/entities';
import { NgForm } from '@angular/forms';
import IPaymentGatewayCreateObject from '@modules/server.common/interfaces/IPaymentGateway';

@Component({
	selector: 'ea-mercado-gateway',
	templateUrl: './mercado-gateway.component.html',
})
export class MercadoGatewayComponent {
	@ViewChild('mercadoConfigForm', { static: true })
	mercadoConfigForm: NgForm;

	isMercadoEnabled: boolean;
	name = paymentGatewaysToString(PaymentGateways.MercadoPago);
	logo = paymentGatewaysLogo(PaymentGateways.MercadoPago);

	@Input()
	currenciesCodes: string[] = [];

	configModel = {
		currency: '',
		payButtontext: '',
		publishableKey: '',
		secretKey: '',
	};

	get isFormValid(): boolean {
		let isValid = false;

		if (this.mercadoConfigForm) {
			isValid =
				(this.mercadoConfigForm.touched ||
					this.mercadoConfigForm.dirty) &&
				this.mercadoConfigForm.valid;
		}

		return isValid;
	}

	get createObject(): IPaymentGatewayCreateObject | null {
		if (!this.isFormValid || !this.isMercadoEnabled) {
			return null;
		}

		return {
			paymentGateway: PaymentGateways.MercadoPago,
			configureObject: this.configModel,
		};
	}

	setValue(data) {
		this.isMercadoEnabled = true;
		this.configModel.currency = data['currency'] || '';
		this.configModel.payButtontext = data['payButtontext'] || '';
		this.configModel.publishableKey = data['publishableKey'] || '';
		this.configModel.secretKey = data['secretKey'] || '';
	}
}
