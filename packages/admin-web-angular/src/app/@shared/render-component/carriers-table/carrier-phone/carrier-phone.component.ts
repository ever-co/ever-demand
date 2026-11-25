import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	standalone: false,
	styleUrls: ['./carrier-phone.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './carrier-phone.component.html',
})
export class CarrierPhoneComponent {
	@Input()
	rowData: any;

	constructor() {}
}
