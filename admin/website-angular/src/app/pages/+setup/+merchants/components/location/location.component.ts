import { Component, EventEmitter } from '@angular/core';
import { LocationFormComponent } from 'app/@shared/forms/location';
import { FormBuilder } from '@angular/forms';

@Component({
	selector: 'ea-merchants-setup-location',
	templateUrl: './location.component.html',
	styleUrls: ['./location.component.scss']
})
export class SetupMerchantLocationComponent {
	location = LocationFormComponent.buildForm(this.formBuilder);

	mapCoordEmitter = new EventEmitter<number[]>();
	mapGeometryEmitter = new EventEmitter<any>();

	constructor(private readonly formBuilder: FormBuilder) {}
}
