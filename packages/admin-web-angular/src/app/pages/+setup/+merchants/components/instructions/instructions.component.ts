import { Component, Input } from '@angular/core';
import { NbStepperComponent } from '@nebular/theme';

@Component({
	standalone: false,
	selector: 'ea-merchants-setup-instructions',
	templateUrl: './instructions.component.html',
})
export class MerchantsSetupInstructionsComponent {
	@Input()
	stepper: NbStepperComponent;

	constructor() {}
}
