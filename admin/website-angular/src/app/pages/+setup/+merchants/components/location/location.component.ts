import { Component } from '@angular/core';
import { LocationFormComponent } from 'app/@shared/forms/location';
import { FormBuilder } from '@angular/forms';

@Component({
	selector: 'ea-merchants-setup-location',
	templateUrl: './location.component.html'
})
export class SetupMerchantLocationComponent {
	location = LocationFormComponent.buildForm(this.formBuilder);

	constructor(private readonly formBuilder: FormBuilder) {}
}
