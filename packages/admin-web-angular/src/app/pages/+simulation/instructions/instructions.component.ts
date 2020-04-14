import { Component, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';

export enum Step {
	One,
	Two,
	Three,
}

@Component({
	selector: 'ea-simulation-instructions',
	templateUrl: './instructions.component.html',
	styleUrls: ['./instructions.component.scss'],
})
export class SimulationInstructionsComponent implements OnDestroy {
	@Input()
	public inviteSystem: boolean;

	public step: Step;

	public stepTypes = {
		one: Step.One,
		two: Step.Two,
		three: Step.Three,
	};

	public inviteCode: string;

	private _ngDestroy$ = new Subject<void>();

	constructor() {}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
