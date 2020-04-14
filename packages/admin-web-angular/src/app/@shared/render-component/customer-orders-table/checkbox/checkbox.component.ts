import { Component, Input, EventEmitter, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
	templateUrl: './checkbox.component.html',
})
export class CheckboxComponent implements ViewCell, OnInit {
	@Input()
	value: string | number;

	@Input()
	rowData: any;

	checked: boolean;
	type: 'takeaway' | 'delivery';

	takeProductDelivery: boolean;
	takeProductTakeaway: boolean;

	newValue: EventEmitter<any> = new EventEmitter();
	id: EventEmitter<string> = new EventEmitter();

	constructor() {}

	onChange() {
		this.newValue.emit({
			type: this.type,
			checked: this.checked,
			id: this.rowData.id,
		});
	}

	ngOnInit() {
		this.id.emit(this.rowData.id);

		this.checked =
			this.type === 'takeaway'
				? this.rowData.takeProductTakeaway
				: this.rowData.takeProductDelivery;
	}
}
