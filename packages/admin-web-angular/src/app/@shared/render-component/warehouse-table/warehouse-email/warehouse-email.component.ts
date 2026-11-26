import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'ea-warehouse-email',
	standalone: false,
	styleUrls: ['./warehouse-email.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './warehouse-email.component.html',
})
export class WarehouseEmailComponent {
	@Input()
	rowData: any;

	constructor() {}
}
