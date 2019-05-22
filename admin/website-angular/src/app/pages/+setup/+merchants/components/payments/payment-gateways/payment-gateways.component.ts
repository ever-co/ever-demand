import { Component, Input } from '@angular/core';
import { Country } from '@modules/server.common/entities';

@Component({
	selector: 'ea-payment-gateways',
	templateUrl: './payment-gateways.component.html'
})
export class PaymentGatewaysComponent {
	@Input()
	warehouseLogo: string;
	@Input()
	warehouseCountry: Country;
}
