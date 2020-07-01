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
		return this.form.get('image');
	}

	static buildForm(formBuilder: FormBuilder): FormGroup {
		return formBuilder.group({
			description: [''],
			image: [null],
			locale: ['en-US'],
		});
	}

	getValue() {
		return this.form.getRawValue();
	}
}
