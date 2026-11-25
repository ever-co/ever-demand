import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'ea-customer-phone',
	standalone: false,
	styleUrls: ['./customer-phone.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './customer-phone.component.html',
})
export class CustomerPhoneComponent {
	@Input()
	rowData: any;

	constructor() {}
}
