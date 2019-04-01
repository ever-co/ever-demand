import { Component, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';

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

	basicInfoModel = {
		name: '',
		logo: '',
		barcodeData: ''
	};

	invalidUrl: boolean;

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
		}
	}
}
