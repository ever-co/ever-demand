import { Component, Input } from '@angular/core';

@Component({
	styleUrls: ['./customer-phone.component.scss'],
	templateUrl: './customer-phone.component.html',
})
export class CustomerPhoneComponent {
	@Input()
	rowData: any;

	constructor() {}
}
