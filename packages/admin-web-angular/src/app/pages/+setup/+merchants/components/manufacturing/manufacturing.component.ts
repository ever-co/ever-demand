import {
	Component,
	Output,
	EventEmitter,
	ChangeDetectionStrategy,
} from '@angular/core';

@Component({
	standalone: false,
	selector: 'ea-merchants-setup-manufacturing',
	templateUrl: './manufacturing.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrls: ['./manufacturing.component.scss'],
})
export class SetupMerchantManufacturingComponent {
	@Output()
	previousStep: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output()
	nextStep: EventEmitter<boolean> = new EventEmitter<boolean>();

	isManufacturing: boolean;
}
