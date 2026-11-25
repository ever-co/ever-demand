import { Component, Input } from '@angular/core';

@Component({
	selector: 'ea-customer-email',
	standalone: false,
	styleUrls: ['./customer-email.component.scss'],
	templateUrl: './customer-email.component.html',
})
export class CustomerEmailComponent {
	@Input()
	rowData: any;

	constructor() {}
}
