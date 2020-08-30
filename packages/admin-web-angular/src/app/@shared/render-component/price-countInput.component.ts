import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
	template: `
		<input
			class="form-control ng-pristine ng-valid"
			type="number"
			[placeholder]="placeholder"
			[(ngModel)]="value"
			(keyup)="valueChange($event)"
			(change)="valueChange($event)"
		/>
	`,
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
