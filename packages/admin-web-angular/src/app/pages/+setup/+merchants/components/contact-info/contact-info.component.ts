import {
	Component,
	ViewChild,
	Output,
	EventEmitter,
	ChangeDetectionStrategy,
} from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
	standalone: false,
	selector: 'ea-merchants-setup-contact-info',
	templateUrl: './contact-info.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrls: ['./contact-info.component.scss'],
})
export class SetupMerchantContactInfoComponent {
	@ViewChild('contactInfoForm', { static: true })
	contactInfoForm: NgForm;

	@Output()
	previousStep: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output()
	nextStep: EventEmitter<boolean> = new EventEmitter<boolean>();

	forwardingEmail: boolean;
	forwardingPhone: boolean;
	contactInfoModel = {
		contactPhone: '',
		forwardOrdersUsing: [],
		ordersEmail: '',
		ordersPhone: '',
	};
}
