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
	barcodetData: string;
	barcodetDataUrl: string;
	isQRCode: boolean = true;

	orderBarcodeTypes = [
		{ label: 'QR', value: OrderBarcodeTypes.QR },
		{ label: 'CODE128', value: OrderBarcodeTypes.CODE128 },
		{ label: 'CODE39', value: OrderBarcodeTypes.CODE39 },
		{ label: 'pharmacode', value: OrderBarcodeTypes.pharmacode }
	];

	constructor() {
		this.loadBarcodetDataUrl();
	}

	async loadBarcodetDataUrl() {
		const dummyId = Date.now();
		this.barcodetDataUrl = await QRCode.toDataURL(dummyId.toString());
		this.barcodetData = dummyId.toString();
	}

	typeChange(type) {
		this.isQRCode = type === OrderBarcodeTypes.QR;
	}
}
