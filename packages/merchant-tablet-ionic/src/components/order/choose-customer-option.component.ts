import {
	Component,
	EventEmitter,
	Output,
	ChangeDetectionStrategy,
} from '@angular/core';

@Component({
	standalone: false,
	selector: 'choose-customer-option',
	styles: [
		'button { padding: 3.5%; margin-top: 2%; background: none; border: 1px solid; margin-left: 2%; } button:hover { color: #bd4742; border-color: #bd4742; } .customer{ text-align: center; }',
	],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './choose-customer-option.component.html',
})
export class ChooseCustomerOptionComponent {
	@Output()
	optionEmitter = new EventEmitter<number>();

	chooseOption(optionBit: number) {
		this.optionEmitter.emit(optionBit);
	}
}
