import { Component, EventEmitter } from '@angular/core';

@Component({
	selector: 'ea-warehouse-add-choice',
	styleUrls: ['./warehouse-add-choice.component.scss'],
	templateUrl: './warehouse-add-choice.component.html',
})
export class WarehouseAddChoiceComponent {
	public choice: EventEmitter<string> = new EventEmitter();

	choiceType: number;

	constructor() {}

	changeChoice(choiceType) {
		this.choiceType = choiceType === 'new' ? 2 : 1;
		this.choice.emit(choiceType);
	}
}
