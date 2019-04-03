import { Component } from '@angular/core';

@Component({
	selector: 'ea-merchants-setup-delivery-takeaway',
	templateUrl: './delivery-takeaway.component.html',
	styleUrls: ['./delivery-takeaway.component.scss']
})
export class SetupMerchantDeliveryAndTakeawayComponent {
	componentViews = {
		main: 'main',
		carriersTable: 'carriersTable'
	};
	currentView = this.componentViews.main;

	isCarrierRequired: boolean;
	productsDelivery: boolean;
	productsTakeaway: boolean;

	add() {
		if (this.currentView === this.componentViews.carriersTable) {
		}
		this.currentView = this.componentViews.main;
	}

	back() {
		this.currentView = this.componentViews.main;
	}
}
