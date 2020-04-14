import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'ngx-switcher',
	styleUrls: ['./switcher.component.scss'],
	templateUrl: './switcher.component.html',
})
export class SwitcherComponent {
	@Input()
	firstValue: any;
	@Input()
	secondValue: any;

	@Input()
	firstValueLabel: string;
	@Input()
	secondValueLabel: string;

	@Input()
	vertical: boolean;

	@Input()
	value: any;
	@Output()
	valueChange = new EventEmitter<any>();

	isFirstValue() {
		return this.value === this.firstValue;
	}

	isSecondValue() {
		return this.value === this.secondValue;
	}

	currentValueLabel() {
		return this.isFirstValue()
			? this.firstValueLabel
			: this.secondValueLabel;
	}

	changeValue() {
		this.value = this.isFirstValue() ? this.secondValue : this.firstValue;

		this.valueChange.emit(this.value);
	}
}
