import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NbStepperComponent } from '@nebular/theme';

@Component({
	standalone: false,
	selector: 'ea-merchants-setup-instructions',
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './instructions.component.html',
})
export class MerchantsSetupInstructionsComponent {
	@Input()
	stepper: NbStepperComponent;

	constructor() {}
}
