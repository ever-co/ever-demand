import { Component, EventEmitter } from '@angular/core';

@Component({
	selector: 'add-choice',
	templateUrl: 'add-choice.html',
	styleUrls: ['./add-choice.scss'],
})
export class AddChoiceComponent {
	choice: EventEmitter<string> = new EventEmitter();

	choiceType: number;

	constructor() {}

	changeChoice(choiceType) {
		this.choiceType = choiceType === 'new' ? 2 : 1;
		this.choice.emit(choiceType);
	}
}
