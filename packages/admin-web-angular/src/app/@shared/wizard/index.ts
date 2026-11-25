import {
	AfterContentInit,
	Component,
	ContentChildren,
	EventEmitter,
	Input,
	NgModule,
	Output,
	QueryList,
	ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * In-house replacement for `@ever-co/angular2-wizard` (a View Engine only fork of
 * angular2-wizard). Same selectors, inputs and outputs, so the setup and create/edit screens
 * keep their templates:
 *
 * ```html
 * <form-wizard [doneText]="..." [nextText]="..." [previousText]="...">
 *   <wizard-step [title]="..." [isValid]="form.valid" (onNext)="..." (onComplete)="...">
 * ```
 */
@Component({
	selector: 'wizard-step',
	standalone: false,
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `
		<div [hidden]="!isActive">
			<ng-content></ng-content>
		</div>
	`,
})
export class WizardStepComponent {
	@Input() title: string;
	@Input() hidden = false;
	@Input() isValid = true;
	@Input() showNext = true;
	@Input() showPrev = true;

	@Output() onNext = new EventEmitter<any>();
	@Output() onPrev = new EventEmitter<any>();
	@Output() onComplete = new EventEmitter<any>();

	isDisabled = true;
	private _isActive = false;

	@Input('isActive')
	set isActive(isActive: boolean) {
		this._isActive = isActive;
		this.isDisabled = false;
	}

	get isActive(): boolean {
		return this._isActive;
	}
}

@Component({
	selector: 'form-wizard',
	standalone: false,
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
							completed: isCompleted,
						}"
					>
						<a (click)="goToStep(step)">{{ step.title }}</a>
					</li>
				</ul>
			</div>
			<div class="card-body card-body">
				<ng-content></ng-content>
			</div>
			<div class="card-footer" [hidden]="isCompleted">
				<button
					type="button"
					class="btn btn-secondary float-start"
					(click)="previous()"
					[hidden]="!hasPrevStep || !activeStep?.showPrev"
				>
					{{ previousText }}
				</button>
				<button
					type="button"
					class="btn btn-secondary float-end"
					(click)="next()"
					[disabled]="!activeStep?.isValid"
					[hidden]="!hasNextStep || !activeStep?.showNext"
				>
					{{ nextText }}
				</button>
				<button
					type="button"
					class="btn btn-secondary float-end"
					(click)="complete()"
					[disabled]="!activeStep?.isValid"
					[hidden]="hasNextStep"
				>
					{{ doneText }}
				</button>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.Eager,
	styles: [
		`
			.card {
				height: 100%;
			}
			.card-header {
				background-color: transparent;
				padding: 0;
				font-size: 1.25rem;
			}
			.card-block {
				overflow-y: auto;
			}
			.card-footer {
				background-color: transparent;
				border-top: 0 none;
			}
			.nav-item {
				padding: 1rem 0;
				border-bottom: 0.5rem solid #ccc;
			}
			.active {
				font-weight: bold;
				border-bottom-color: #1976d2 !important;
			}
			.enabled {
				cursor: pointer;
				border-bottom-color: rgb(88, 162, 234);
			}
			.disabled {
				color: #ccc;
			}
			.completed {
				cursor: default;
			}
		`,
	],
})
export class WizardComponent implements AfterContentInit {
	@ContentChildren(WizardStepComponent)
	wizardSteps: QueryList<WizardStepComponent>;

	@Input() previousText = 'Previous';
	@Input() nextText = 'Next';
	@Input() doneText = 'Done';

	@Output() onStepChanged = new EventEmitter<WizardStepComponent>();

	private _steps: WizardStepComponent[] = [];
	private _isCompleted = false;

	ngAfterContentInit(): void {
		this._steps = this.wizardSteps.toArray();
		if (this.steps.length) {
			this.steps[0].isActive = true;
		}
		this.wizardSteps.changes.subscribe(() => {
			this._steps = this.wizardSteps.toArray();
		});
	}

	get steps(): WizardStepComponent[] {
		return this._steps.filter((step) => !step.hidden);
	}

	get isCompleted(): boolean {
		return this._isCompleted;
	}

	get activeStep(): WizardStepComponent {
		return this.steps.find((step) => step.isActive);
	}

	set activeStep(step: WizardStepComponent) {
		if (step !== this.activeStep && !step.isDisabled) {
			if (this.activeStep) {
				this.activeStep.isActive = false;
			}
			step.isActive = true;
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

	goToStep(step: WizardStepComponent): void {
		if (!this.isCompleted) {
			this.activeStep = step;
		}
	}

	next(): void {
		if (this.hasNextStep) {
			const nextStep = this.steps[this.activeStepIndex + 1];
			this.activeStep.onNext.emit();
			nextStep.isDisabled = false;
			this.activeStep = nextStep;
		}
	}

	previous(): void {
		if (this.hasPrevStep) {
			const prevStep = this.steps[this.activeStepIndex - 1];
			this.activeStep.onPrev.emit();
			prevStep.isDisabled = false;
			this.activeStep = prevStep;
		}
	}

	complete(): void {
		this.activeStep.onComplete.emit();
		this._isCompleted = true;
	}

	/** Lets a screen start over (the original kept `_isCompleted` private with no reset). */
	reset(): void {
		this._isCompleted = false;
		this._steps.forEach((step, index) => {
			step.isActive = index === 0;
			step.isDisabled = index !== 0;
		});
	}
}

@NgModule({
	imports: [CommonModule],
	declarations: [WizardComponent, WizardStepComponent],
	exports: [WizardComponent, WizardStepComponent],
})
export class FormWizardModule {}
