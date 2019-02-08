import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import ForwardOrdersMethod from '@modules/server.common/enums/ForwardOrdersMethod';
import { IWarehouseCreateObject } from '@modules/server.common/interfaces/IWarehouse';
import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import { FormHelpers } from '../../../forms/helpers';

export type WarehouseContactInfo = Pick<
	IWarehouseCreateObject,
	| 'contactEmail'
	| 'contactPhone'
	| 'forwardOrdersUsing'
	| 'ordersEmail'
	| 'ordersPhone'
>;

@Component({
	selector: 'ea-warehouse-contact-info-form',
	templateUrl: 'contact-info-form.component.html'
})
export class ContactInfoFormComponent {
	@Input()
	readonly form: FormGroup;

	public ForwardOrdersMethod = ForwardOrdersMethod;

	readonly forwardOrdersOptions: IMultiSelectOption[] = [
		{ id: ForwardOrdersMethod['Unselected'], name: '' },
		{ id: ForwardOrdersMethod.Email, name: 'Email' },
		{ id: ForwardOrdersMethod.Phone, name: 'Phone' }
	];

	static buildForm(formBuilder: FormBuilder): FormGroup {
		// would be used in the parent component and injected into this.form

		const phoneNumberRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9x]*$/;

		return formBuilder.group(
			{
				contactPhone: ['', [Validators.pattern(phoneNumberRegex)]],
				contactEmail: ['', [Validators.email]],

				forwardOrdersUsing: [
					ForwardOrdersMethod['Unselected'],
					[Validators.required]
				],

				ordersPhone: ['', [Validators.pattern(phoneNumberRegex)]],
				ordersEmail: ['', [Validators.email]]
			},
			{
				validator: (form) => {
					switch (form.get('forwardOrdersUsing').value) {
						// case ForwardOrdersMethod[ 'Unselected' ]:
						// 	return true;
						case ForwardOrdersMethod.Phone:
							return form.get('ordersPhone').value
								? null
								: { ordersPhoneRequired: true };
						case ForwardOrdersMethod.Email:
							return form.get('ordersEmail').value
								? null
								: { ordersEmailRequired: true };
					}
				}
			}
		);
	}

	getValue() {
		const contactInfo = this.form.getRawValue() as {
			contactEmail: string;
			contactPhone: string;
			forwardOrdersUsing: ForwardOrdersMethod;
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
			forwardOrdersUsing: contactInfo.forwardOrdersUsing,
			...(contactInfo.ordersEmail
				? { ordersEmail: contactInfo.ordersEmail }
				: { ordersEmail: null }),
			...(contactInfo.ordersPhone
				? { ordersPhone: contactInfo.ordersPhone }
				: { ordersPhone: null })
		};
	}

	public setValue<T extends WarehouseContactInfo>(contactInfo: T) {
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
			ordersPhone: contactInfo.ordersPhone ? contactInfo.ordersPhone : ''
		});
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
}
