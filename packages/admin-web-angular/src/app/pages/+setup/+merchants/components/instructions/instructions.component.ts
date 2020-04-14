import { Component, Input } from '@angular/core';
import { NbStepperComponent } from '@nebular/theme';

@Component({
	selector: 'ea-merchants-setup-instructions',
	templateUrl: './instructions.component.html',
})
export class MerchantsSetupInstructionsComponent {
	@Input()
	stepper: NbStepperComponent;

	constructor() {}
}
