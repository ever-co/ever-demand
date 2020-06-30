import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
	selector: 'details-info-form',
	styleUrls: ['./details-info-form.component.scss'],
	templateUrl: 'details-info-form.component.html',
})
export class DetailsInfoFormComponent {
	@Input()
	readonly form: FormGroup;

	constructor() {}

	get image() {
		return this.form.get('imageUrl');
	}

	static buildForm(formBuilder: FormBuilder): FormGroup {
		return formBuilder.group({
			description: [''],
			imageUrl: [null],
		});
	}

	getValue() {
		return this.form.getRawValue();
	}
}
