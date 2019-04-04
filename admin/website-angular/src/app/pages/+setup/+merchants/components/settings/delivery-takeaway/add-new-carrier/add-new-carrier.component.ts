import { Component, ViewChild } from '@angular/core';
import { BasicInfoFormComponent } from 'app/@shared/carrier/forms/basic-info/basic-info-form.component';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

@Component({
	selector: 'ea-merchants-setup-add-new-carrier',
	templateUrl: './add-new-carrier.component.html'
})
export class SetupMerchantAddNewCarrierComponent {
	@ViewChild('basicInfoForm')
	basicInfoForm: BasicInfoFormComponent;

	readonly form: FormGroup = this.formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this.formBuilder),
		password: BasicInfoFormComponent.buildPasswordForm(this.formBuilder)
	});

	readonly basicInfo = this.form.get('basicInfo') as FormControl;
	readonly password = this.form.get('password') as FormControl;

	constructor(private readonly formBuilder: FormBuilder) {}
}
