import { Component, ViewChild, Input } from '@angular/core';
import { PaymentGatewaysComponent } from 'app/@shared/payment-gateways/payment-gateways.component';
import IPaymentGatewayCreateObject from '@modules/server.common/interfaces/IPaymentGateway';

@Component({
	selector: 'ea-warehouse-payments-settings-form',
	templateUrl: './payments-settings-form.component.html'
})
export class PaymentsSettingsFormComponent {
	@ViewChild('paymentGateways', { static: true })
	paymentGateways: PaymentGatewaysComponent;

	@Input()
	warehouseLogo: string;
	@Input()
	warehouseCountry: string;

	isPaymentEnabled: boolean;

	get isPaymentValid() {
		return !this.isPaymentEnabled || this.paymentGateways.isValid;
	}

	get paymentsGateways(): IPaymentGatewayCreateObject[] {
		return this.paymentGateways.paymentsGateways;
	}
}
