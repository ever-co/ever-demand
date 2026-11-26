import {
	AfterContentInit,
	ChangeDetectionStrategy,
	Component,
	ContentChildren,
	EventEmitter,
	Input,
	NgModule,
	Output,
	QueryList,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * One step of a <form-wizard>. In-house replacement for `@ever-co/angular2-wizard` (unmaintained,
 * View Engine only) with the same selectors, inputs, outputs and markup, so templates and
 * styles keep working.
 */
@Component({
	selector: 'wizard-step',
	template: `<div [hidden]="!isActive"><ng-content></ng-content></div>`,
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class WizardStepComponent {
	@Input() title: string;
	@Input() hidden = false;
	@Input() isValid = true;
	@Input() showNext = true;
	@Input() showPrev = true;

	@Output() onNext = new EventEmitter<void>();
	@Output() onPrev = new EventEmitter<void>();
	@Output() onComplete = new EventEmitter<void>();

	isActive = false;
	isDisabled = true;
}

@Component({
	selector: 'form-wizard',
	template: `
		<div class="card">
			<div class="card-header">
				<ul class="nav nav-justified">
					<li
						class="nav-item"
						*ngFor="let step of steps"
						[ngClass]="{
							active: step.isActive,
							enabled: !step.isDisabled,
							disabled: step.isDisabled,
							completed: isCompleted
						}"
					>
						<a (click)="goToStep(step)">{{ step.title }}</a>
					</li>
				</ul>
			</div>
			<div class="card-block">
				<ng-content></ng-content>
			</div>
			<div class="card-footer" [hidden]="isCompleted">
				<button
					type="button"
					class="btn btn-secondary float-left"
					(click)="previous()"
					[hidden]="!hasPrevStep || !activeStep?.showPrev"
				>
					Previous
				</button>
				<button
					type="button"
					class="btn btn-secondary float-right"
					(click)="next()"
					[disabled]="!activeStep?.isValid"
					[hidden]="!hasNextStep || !activeStep?.showNext"
				>
					Next
				</button>
				<button
					type="button"
					class="btn btn-secondary float-right"
					(click)="complete()"
					[disabled]="!activeStep?.isValid"
					[hidden]="hasNextStep"
				>
					Done
				</button>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class FormWizardComponent implements AfterContentInit {
	@ContentChildren(WizardStepComponent)
	wizardSteps: QueryList<WizardStepComponent>;

	@Output() onStepChanged = new EventEmitter<WizardStepComponent>();

	steps: WizardStepComponent[] = [];
	isCompleted = false;

	private _activeStep: WizardStepComponent;

	ngAfterContentInit() {
		this.steps = this.wizardSteps.filter((step) => !step.hidden);
		if (this.steps.length) {
			this.activeStep = this.steps[0];
		}
	}

	get activeStep(): WizardStepComponent {
		return this._activeStep;
	}

	set activeStep(step: WizardStepComponent) {
		if (step !== this._activeStep && !step.isDisabled) {
			if (this._activeStep) {
				this._activeStep.isActive = false;
			}
			step.isActive = true;
			this._activeStep = step;
			this.onStepChanged.emit(step);
		} else if (!this._activeStep && step) {
			step.isDisabled = false;
			step.isActive = true;
			this._activeStep = step;
			this.onStepChanged.emit(step);
		}
	}

	get activeStepIndex(): number {
		return this.steps.indexOf(this.activeStep);
	}

	get hasNextStep(): boolean {
		return this.activeStepIndex < this.steps.length - 1;
	}

	get hasPrevStep(): boolean {
		return this.activeStepIndex > 0;
	}

	goToStep(step: WizardStepComponent) {
		if (!this.isCompleted) {
			this.activeStep = step;
		}
	}

	next() {
		if (this.hasNextStep) {
			const nextStep = this.steps[this.activeStepIndex + 1];
			this.activeStep.onNext.emit();
			nextStep.isDisabled = false;
			this.activeStep = nextStep;
		}
	}

	previous() {
		if (this.hasPrevStep) {
			const prevStep = this.steps[this.activeStepIndex - 1];
			this.activeStep.onPrev.emit();
			prevStep.isDisabled = false;
			this.activeStep = prevStep;
		}
	}

	complete() {
		this.activeStep.onComplete.emit();
		this.isCompleted = true;
	}
}

@NgModule({
	declarations: [FormWizardComponent, WizardStepComponent],
	imports: [CommonModule],
	exports: [FormWizardComponent, WizardStepComponent],
})
export class FormWizardModule {}
