import { Component } from '@angular/core';
import OrderBarcodeTypes from '@modules/server.common/enums/OrderBarcodeTypes';

@Component({
	selector: 'ea-merchants-setup-orders-settings',
	templateUrl: './orders.component.html',
	styleUrls: ['./orders.component.scss']
})
export class SetupMerchantOrdersSettingsComponent {
	iorderBarcodeType: OrderBarcodeTypes = OrderBarcodeTypes.QR;

	orderBarcodeTypes = [
		{ label: 'QR', value: OrderBarcodeTypes.QR },
		{ label: 'CODE128', value: OrderBarcodeTypes.CODE128 },
		{ label: 'CODE39', value: OrderBarcodeTypes.CODE39 },
		{ label: 'pharmacode', value: OrderBarcodeTypes.pharmacode }
	];
}
