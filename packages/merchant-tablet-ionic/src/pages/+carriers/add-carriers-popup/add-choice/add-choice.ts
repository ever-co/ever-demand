import {
	Component,
	EventEmitter,
	ChangeDetectionStrategy,
} from '@angular/core';

@Component({
	standalone: false,
	selector: 'add-choice',
	templateUrl: 'add-choice.html',
	changeDetection: ChangeDetectionStrategy.Eager,
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
