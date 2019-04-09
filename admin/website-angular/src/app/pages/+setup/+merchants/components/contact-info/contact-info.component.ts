import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
	selector: 'ea-merchants-setup-contact-info',
	templateUrl: './contact-info.component.html',
	styleUrls: ['./contact-info.component.scss']
})
export class SetupMerchantContactInfoComponent {
	@ViewChild('contactInfoForm')
	contactInfoForm: NgForm;

	forwardingEmail: boolean;
	forwardingPhone: boolean;
	contactInfoModel = {
		contactPhone: '',
		forwardOrdersUsing: [],
		ordersEmail: '',
		ordersPhone: ''
	};
}
