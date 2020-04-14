import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import ForwardOrdersMethod from '@modules/server.common/enums/ForwardOrdersMethod';
import { IWarehouseCreateObject } from '@modules/server.common/interfaces/IWarehouse';
import { FormHelpers } from '../../../forms/helpers';

export type WarehouseContactInfo = Pick<
	IWarehouseCreateObject,
	| 'contactEmail'
	| 'contactPhone'
	| 'forwardOrdersUsing'
	| 'ordersEmail'
	| 'ordersPhone'
>;

const phoneNumberRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9x]*$/;

@Component({
	selector: 'ea-warehouse-contact-info-form',
	templateUrl: 'contact-info-form.component.html',
})
export class ContactInfoFormComponent {
	@Input()
	readonly form: FormGroup;

	forwardingEmail: boolean;
	forwardingPhone: boolean;

	static buildForm(formBuilder: FormBuilder): FormGroup {
		// would be used in the parent component and injected into this.form

		return formBuilder.group({
			contactPhone: ['', [Validators.pattern(phoneNumberRegex)]],
			contactEmail: ['', [Validators.email]],

			forwardOrdersUsing: [],

			ordersPhone: ['', [Validators.pattern(phoneNumberRegex)]],
			ordersEmail: ['', [Validators.email]],
		});
	}

	getValue() {
		const contactInfo = this.form.getRawValue() as {
			contactEmail: string;
			contactPhone: string;
			forwardOrdersUsing: ForwardOrdersMethod[];
			ordersEmail: string;
			ordersPhone: string;
		};

		return {
			...(contactInfo.contactEmail
				? { contactEmail: contactInfo.contactEmail }
				: { contactEmail: null }),
			...(contactInfo.contactPhone
				? { contactPhone: contactInfo.contactPhone }
				: { contactPhone: null }),
			forwardOrdersUsing: this.getForwardOrdersUsing(),
			...(contactInfo.ordersEmail
				? { ordersEmail: contactInfo.ordersEmail }
				: { ordersEmail: null }),
			...(contactInfo.ordersPhone
				? { ordersPhone: contactInfo.ordersPhone }
				: { ordersPhone: null }),
		};
	}

	setValue<T extends WarehouseContactInfo>(contactInfo: T) {
		FormHelpers.deepMark(this.form, 'dirty');

		this.form.setValue({
			contactEmail: contactInfo.contactEmail
				? contactInfo.contactEmail
				: '',
			contactPhone: contactInfo.contactPhone
				? contactInfo.contactPhone
				: '',
			forwardOrdersUsing: contactInfo.forwardOrdersUsing,
			ordersEmail: contactInfo.ordersEmail ? contactInfo.ordersEmail : '',
			ordersPhone: contactInfo.ordersPhone ? contactInfo.ordersPhone : '',
		});

		if (contactInfo.forwardOrdersUsing) {
			this.forwardingEmail = contactInfo.forwardOrdersUsing.includes(
				ForwardOrdersMethod.Email
			);
			this.forwardingPhone = contactInfo.forwardOrdersUsing.includes(
				ForwardOrdersMethod.Phone
			);
		}
	}

	get contactEmail() {
		return this.form.get('contactEmail');
	}

	get contactPhone() {
		return this.form.get('contactPhone');
	}

	get forwardOrdersUsing() {
		return this.form.get('forwardOrdersUsing');
	}

	get ordersEmail() {
		return this.form.get('ordersEmail');
	}

	get ordersPhone() {
		return this.form.get('ordersPhone');
	}

	get validForm() {
		return (
			this.form &&
			this.form.valid &&
			(this.forwardingEmail ? this.ordersEmail.value !== '' : true) &&
			(this.forwardingPhone ? this.ordersPhone.value !== '' : true)
		);
	}

	forwardingPhoneChange() {
		this.forwardingPhone = !this.forwardingPhone;
		let forwardOrdersUsingArr = this.forwardOrdersUsing.value || [];

		forwardOrdersUsingArr = forwardOrdersUsingArr.filter(
			(v) => v !== ForwardOrdersMethod.Phone
		);

		if (this.forwardingPhone) {
			forwardOrdersUsingArr.push(ForwardOrdersMethod.Phone);
		} else {
			this.ordersPhone.setValue('');
		}

		this.forwardOrdersUsing.setValue(forwardOrdersUsingArr);
	}

	forwardingEmailChange() {
		this.forwardingEmail = !this.forwardingEmail;
		let forwardOrdersUsingArr = this.forwardOrdersUsing.value || [];

		forwardOrdersUsingArr = forwardOrdersUsingArr.filter(
			(v) => v !== ForwardOrdersMethod.Email
		);

		if (this.forwardingEmail) {
			forwardOrdersUsingArr.push(ForwardOrdersMethod.Email);
		} else {
			this.ordersEmail.setValue('');
		}

		this.forwardOrdersUsing.setValue(forwardOrdersUsingArr);
	}

	private getForwardOrdersUsing() {
		const forwardOrdersUsing = [];

		if (this.forwardingEmail) {
			forwardOrdersUsing.push(ForwardOrdersMethod.Email);
		}

		if (this.forwardingPhone) {
			forwardOrdersUsing.push(ForwardOrdersMethod.Phone);
		}

		if (!this.forwardingEmail && !this.forwardingPhone) {
			forwardOrdersUsing.push(ForwardOrdersMethod.Unselected);
		}

		return forwardOrdersUsing;
	}
}
