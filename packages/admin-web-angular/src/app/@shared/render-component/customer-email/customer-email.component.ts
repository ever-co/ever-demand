import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'ea-customer-email',
	standalone: false,
	styleUrls: ['./customer-email.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './customer-email.component.html',
})
export class CustomerEmailComponent {
	@Input()
	rowData: any;

	constructor() {}
}
