import { Component, Input } from '@angular/core';

@Component({
	styleUrls: ['./warehouse-phone.component.scss'],
	templateUrl: './warehouse-phone.component.html',
})
export class WarehousePhoneComponent {
	@Input()
	rowData: any;

	constructor() {}
}
