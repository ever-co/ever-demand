import { Component } from '@angular/core';

@Component({
	selector: 'ea-merchants-setup-delivery-takeaway',
	templateUrl: './delivery-takeaway.component.html',
	styleUrls: ['./delivery-takeaway.component.scss']
})
export class SetupMerchantDeliveryAndTakeawayComponent {
	isCarrierRequired: boolean;
	productsDelivery: boolean;
	productsTakeaway: boolean;
}
