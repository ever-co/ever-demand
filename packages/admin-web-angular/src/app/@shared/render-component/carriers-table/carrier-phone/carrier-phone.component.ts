import { Component, Input } from '@angular/core';

@Component({
	standalone: false,
	styleUrls: ['./carrier-phone.component.scss'],
	templateUrl: './carrier-phone.component.html',
})
export class CarrierPhoneComponent {
	@Input()
	rowData: any;

	constructor() {}
}
