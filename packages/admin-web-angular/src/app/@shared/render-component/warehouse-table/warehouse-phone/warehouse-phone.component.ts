import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'ea-warehouse-phone',
	standalone: false,
	styleUrls: ['./warehouse-phone.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './warehouse-phone.component.html',
})
export class WarehousePhoneComponent {
	@Input()
	rowData: any;

	constructor() {}
}
