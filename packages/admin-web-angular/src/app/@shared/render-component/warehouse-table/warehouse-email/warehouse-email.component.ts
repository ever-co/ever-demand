import { Component, Input } from '@angular/core';

@Component({
	styleUrls: ['./warehouse-email.component.scss'],
	templateUrl: './warehouse-email.component.html',
})
export class WarehouseEmailComponent {
	@Input()
	rowData: any;

	constructor() {}
}
