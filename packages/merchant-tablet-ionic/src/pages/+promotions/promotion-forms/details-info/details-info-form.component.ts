import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
	IPromotion,
	IPromotionCreateObject,
} from '@modules/server.common/interfaces/IPromotion';

@Component({
	selector: 'details-info-form',
	styleUrls: ['./details-info-form.component.scss'],
	templateUrl: 'details-info-form.component.html',
})
export class DetailsInfoFormComponent implements OnInit {
	@Input()
	readonly form: FormGroup;

	@Input()
	promotionData: IPromotion;

	promotionDetails: Partial<IPromotion>;

	constructor() {}

	ngOnInit(): void {
		this.promotionDetails =
			this.promotionData || this._initPromotionDetails();

		this.setValue();
	}

	get image() {
		return this.form.get('image');
	}

	static buildForm(formBuilder: FormBuilder): FormGroup {
		return formBuilder.group({
			image: [''],
			active: [true],
			purchasesCount: [0, Validators.min(0)],
			promoPrice: [0, Validators.min(0)],
		});
	}

	getValue() {
		return this.form.value as IPromotionCreateObject;
	}

	setValue() {
		if (!this.promotionDetails) return;

		const promotionFormValue = {
			image: this.promotionDetails.image || '',
			active: this.promotionDetails.active || true,
			purchasesCount: this.promotionDetails.purchasesCount || 0,
			promoPrice: this.promotionData.promoPrice || 0,
		};

		this.form.patchValue(promotionFormValue);
	}

	private _initPromotionDetails() {
		return {
			image: null,
			active: true,
			purchasesCount: 0,
			promoPrice: 0,
		};
	}
}
