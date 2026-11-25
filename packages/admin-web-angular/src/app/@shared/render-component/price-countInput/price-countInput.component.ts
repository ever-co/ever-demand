import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';

@Component({
	standalone: false,
	templateUrl: './price-countInput.component.html',
})
export class PriceCountInputComponent implements ViewCell, OnInit {
	value: string | number;

	newValue: EventEmitter<string | number> = new EventEmitter();
	id: EventEmitter<string> = new EventEmitter();
	placeholder: string;

	@Input()
	rowData: any;

	ngOnInit() {
		this.id.emit(this.rowData.id);
		if (this.placeholder === 'Count') {
			this.value = 1;
		}
	}

	valueChange(e) {
		this.newValue.emit(this.value);
	}
}
