import { Component, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import QRCode from 'qrcode';

@Component({
	selector: 'ea-merchants-setup-basic-info',
	templateUrl: './basic-info.component.html',
	styleUrls: ['./basic-info.component.scss']
})
export class BasicInfoComponent {
	@ViewChild('basicInfoForm')
	basicInfoForm: NgForm;

	@ViewChild('name')
	name: NgModel;

	// TODO add translate
	uploaderPlaceholder: string = 'Photo (optional)';
	barcodetDataUrl: string;
	invalidUrl: boolean;
	basicInfoModel = {
		name: '',
		logo: '',
		barcodeData: ''
	};

	get formValid() {
		return (
			this.basicInfoForm.valid &&
			(this.basicInfoModel.logo === '' || !this.invalidUrl)
		);
	}

	deleteImg() {
		this.basicInfoModel.logo = '';
	}

	nameChange() {
		if (this.name.valid && this.basicInfoModel.barcodeData === '') {
			this.basicInfoModel.barcodeData = this.name.value;

			this.barcodeDataChange();
		}
	}

	async barcodeDataChange() {
		if (this.basicInfoModel.barcodeData) {
			this.barcodetDataUrl = await QRCode.toDataURL(
				this.basicInfoModel.barcodeData
			);
		} else {
			this.barcodetDataUrl = null;
		}
	}
}
