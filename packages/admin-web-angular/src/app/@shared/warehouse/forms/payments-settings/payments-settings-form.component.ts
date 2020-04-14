import { Component, ViewChild, Input } from '@angular/core';
import { PaymentGatewaysComponent } from '@app/@shared/payment-gateways/payment-gateways.component';
import IPaymentGatewayCreateObject from '@modules/server.common/interfaces/IPaymentGateway';
import Warehouse from '@modules/server.common/entities/Warehouse';

@Component({
	selector: 'ea-warehouse-payments-settings-form',
	templateUrl: './payments-settings-form.component.html',
})
export class PaymentsSettingsFormComponent {
	@ViewChild('paymentGateways', { static: true })
	paymentGateways: PaymentGatewaysComponent;

	@Input()
	warehouseLogo: string;
	@Input()
	warehouseCountry: string;
	@Input()
	isEdit: boolean;

	isPaymentEnabled: boolean = false;

	get isPaymentValid() {
		return !this.isPaymentEnabled || this.paymentGateways.isValid;
	}

	get paymentsGateways(): IPaymentGatewayCreateObject[] {
		return this.paymentGateways.paymentsGateways;
	}

	setValue(merchant: Warehouse) {
		this.isPaymentEnabled = merchant.isPaymentEnabled;
		this.paymentGateways.setValue(merchant);
	}
}
