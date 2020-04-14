import { Component, EventEmitter, ViewChild, Output } from '@angular/core';
import { LocationFormComponent } from '@app/@shared/forms/location';
import { FormBuilder } from '@angular/forms';

@Component({
	selector: 'ea-merchants-setup-location',
	templateUrl: './location.component.html',
	styleUrls: ['./location.component.scss'],
})
export class SetupMerchantLocationComponent {
	@ViewChild('locationForm', { static: true })
	locationForm: LocationFormComponent;

	@Output()
	previousStep: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output()
	nextStep: EventEmitter<boolean> = new EventEmitter<boolean>();

	location = LocationFormComponent.buildForm(this.formBuilder);

	mapCoordEmitter = new EventEmitter<number[]>();
	mapGeometryEmitter = new EventEmitter<any>();

	constructor(private readonly formBuilder: FormBuilder) {}
}
