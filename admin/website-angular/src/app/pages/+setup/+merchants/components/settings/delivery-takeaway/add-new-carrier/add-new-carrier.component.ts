import { Component, ViewChild, Input, AfterViewInit } from '@angular/core';
import { BasicInfoFormComponent } from 'app/@shared/carrier/forms/basic-info/basic-info-form.component';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import Carrier from '@modules/server.common/entities/Carrier';

@Component({
	selector: 'ea-merchants-setup-add-new-carrier',
	templateUrl: './add-new-carrier.component.html'
})
export class SetupMerchantAddNewCarrierComponent implements AfterViewInit {
	@ViewChild('basicInfoForm')
	basicInfoForm: BasicInfoFormComponent;

	@Input()
	carrier: Carrier;

	readonly form: FormGroup = this.formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this.formBuilder),
		password: BasicInfoFormComponent.buildPasswordForm(this.formBuilder)
	});

	readonly basicInfo = this.form.get('basicInfo') as FormControl;
	readonly password = this.form.get('password') as FormControl;

	constructor(private readonly formBuilder: FormBuilder) {}

	ngAfterViewInit(): void {
		if (this.carrier) {
			this.basicInfoForm.setValue(this.carrier);
		}
	}
}
