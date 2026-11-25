import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormWizardModule, WizardComponent } from './index';

@Component({
	standalone: false,
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `
		<form-wizard
			#wizard
			doneText="Finish"
			nextText="Forward"
			previousText="Back"
		>
			<wizard-step
				title="Basic"
				[isValid]="basicValid"
				(onNext)="log.push('next:basic')"
			>
				<p class="basic">basic</p>
			</wizard-step>
			<wizard-step title="Hidden" [hidden]="true"
				><p>hidden</p></wizard-step
			>
			<wizard-step
				title="Contact"
				(onPrev)="log.push('prev:contact')"
				(onNext)="log.push('next:contact')"
			>
				<p class="contact">contact</p>
			</wizard-step>
			<wizard-step title="Done" (onComplete)="log.push('complete')">
				<p class="done">done</p>
			</wizard-step>
		</form-wizard>
	`,
})
class HostComponent {
	@ViewChild('wizard', { static: true }) wizard: WizardComponent;
	basicValid = true;
	log: string[] = [];
}

describe('FormWizardModule (in-house angular2-wizard)', () => {
	let fixture: ComponentFixture<HostComponent>;
	let host: HostComponent;
	let el: HTMLElement;

	const buttons = () =>
		Array.from(
			el.querySelectorAll<HTMLButtonElement>('.card-footer button'),
		);
	const button = (text: string) =>
		buttons().find((b) => b.textContent!.trim() === text)!;
	const visible = (b: HTMLElement) => !b.hidden;
	const titles = () =>
		Array.from(el.querySelectorAll('.nav-item')).map((li) =>
			li.textContent!.trim(),
		);

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [FormWizardModule],
			declarations: [HostComponent],
		});
		fixture = TestBed.createComponent(HostComponent);
		host = fixture.componentInstance;
		el = fixture.nativeElement;
		fixture.detectChanges();
	});

	it('lists the visible steps and starts on the first one', () => {
		expect(titles()).toEqual(['Basic', 'Contact', 'Done']);
		expect(host.wizard.activeStepIndex).toBe(0);
		expect(el.querySelector('.nav-item.active')!.textContent!.trim()).toBe(
			'Basic',
		);
	});

	it('uses the custom button texts', () => {
		expect(buttons().map((b) => b.textContent!.trim())).toEqual([
			'Back',
			'Forward',
			'Finish',
		]);
		expect(visible(button('Back'))).toBe(false);
		expect(visible(button('Forward'))).toBe(true);
		expect(visible(button('Finish'))).toBe(false);
	});

	it('disables Next while the step is invalid', () => {
		host.basicValid = false;
		fixture.detectChanges();
		expect(button('Forward').disabled).toBe(true);

		host.basicValid = true;
		fixture.detectChanges();
		expect(button('Forward').disabled).toBe(false);
	});

	it('moves forward and back, emitting onNext / onPrev / onStepChanged', () => {
		const changed: string[] = [];
		host.wizard.onStepChanged.subscribe((s) => changed.push(s.title));

		button('Forward').click();
		fixture.detectChanges();
		expect(host.wizard.activeStep.title).toBe('Contact');
		expect(visible(button('Back'))).toBe(true);

		button('Back').click();
		fixture.detectChanges();
		expect(host.wizard.activeStep.title).toBe('Basic');

		expect(host.log).toEqual(['next:basic', 'prev:contact']);
		expect(changed).toEqual(['Contact', 'Basic']);
	});

	it('only lets the user jump to steps that were reached already', () => {
		const done = host.wizard.steps[2];
		host.wizard.goToStep(done);
		expect(host.wizard.activeStep.title).toBe('Basic');

		host.wizard.next();
		host.wizard.next();
		host.wizard.goToStep(host.wizard.steps[0]);
		expect(host.wizard.activeStep.title).toBe('Basic');
		host.wizard.goToStep(done);
		expect(host.wizard.activeStep.title).toBe('Done');
	});

	it('shows Done on the last step and completes', () => {
		host.wizard.next();
		host.wizard.next();
		fixture.detectChanges();
		expect(visible(button('Forward'))).toBe(false);
		expect(visible(button('Finish'))).toBe(true);

		button('Finish').click();
		fixture.detectChanges();

		expect(host.log).toEqual(['next:basic', 'next:contact', 'complete']);
		expect(host.wizard.isCompleted).toBe(true);
		expect((el.querySelector('.card-footer') as HTMLElement).hidden).toBe(
			true,
		);
	});

	it('next() is what screens call from code (warehouse order / product create)', () => {
		host.wizard.next();
		expect(host.wizard.activeStepIndex).toBe(1);
		expect(host.wizard.hasPrevStep).toBe(true);
		expect(host.wizard.hasNextStep).toBe(true);
	});

	it('reset() starts over', () => {
		host.wizard.next();
		host.wizard.next();
		host.wizard.complete();
		host.wizard.reset();
		expect(host.wizard.isCompleted).toBe(false);
		expect(host.wizard.activeStepIndex).toBe(0);
	});
});
