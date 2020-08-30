import { Component, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'ea-merchants-setup-manufacturing',
	templateUrl: './manufacturing.component.html',
	styleUrls: ['./manufacturing.component.scss'],
})
export class SetupMerchantManufacturingComponent {
	@Output()
	previousStep: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output()
	nextStep: EventEmitter<boolean> = new EventEmitter<boolean>();

	isManufacturing: boolean;
}
