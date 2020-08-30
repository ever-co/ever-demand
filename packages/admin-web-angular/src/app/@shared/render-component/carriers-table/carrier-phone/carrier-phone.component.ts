import { Component, Input } from '@angular/core';

@Component({
	styleUrls: ['./carrier-phone.component.scss'],
	templateUrl: './carrier-phone.component.html',
})
export class CarrierPhoneComponent {
	@Input()
	rowData: any;

	constructor() {}
}
