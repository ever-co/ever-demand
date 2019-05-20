import { Component, Input } from '@angular/core';

@Component({
	selector: 'ea-payment-gateways',
	templateUrl: './payment-gateways.component.html'
})
export class PaymentGatewaysComponent {
	@Input()
	warehouseLogo: string;
}
