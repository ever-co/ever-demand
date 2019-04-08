import { Component } from '@angular/core';
import OrderBarcodeTypes from '@modules/server.common/enums/OrderBarcodeTypes';
import QRCode from 'qrcode';
import { Types } from 'mongoose';

@Component({
	selector: 'ea-merchants-setup-orders-settings',
	templateUrl: './orders.component.html',
	styleUrls: ['./orders.component.scss']
})
export class SetupMerchantOrdersSettingsComponent {
	iorderBarcodeType: OrderBarcodeTypes = OrderBarcodeTypes.QR;
	barcodetDataUrl: string;

	orderBarcodeTypes = [
		{ label: 'QR', value: OrderBarcodeTypes.QR },
		{ label: 'CODE128', value: OrderBarcodeTypes.CODE128 },
		{ label: 'CODE39', value: OrderBarcodeTypes.CODE39 },
		{ label: 'pharmacode', value: OrderBarcodeTypes.pharmacode }
	];

	constructor() {
		this.loadBarcodetDataUrl(OrderBarcodeTypes.QR);
	}

	async loadBarcodetDataUrl(type: OrderBarcodeTypes) {
		const dummyId = Date.now();
		switch (type) {
			case OrderBarcodeTypes.QR:
				this.barcodetDataUrl = await QRCode.toDataURL(
					dummyId.toString()
				);
				break;

			default:
				this.barcodetDataUrl = await QRCode.toDataURL(
					dummyId.toString()
				);
				break;
		}
	}
}
