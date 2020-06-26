import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IPromotion } from '@modules/server.common/interfaces/IPromotion';
import { Subject } from 'rxjs';

@Component({
	selector: 'basic-info-form',
	styleUrls: ['./basic-info-form.component.scss'],
	templateUrl: 'basic-info-form.component.html',
})
export class BasicInfoFormComponent implements OnInit, OnDestroy {
	@Input()
	readonly form: FormGroup;

	@Input()
	promotionData: IPromotion;

	private _promotion: IPromotion;

	get title() {
		return this.form.get('title');
	}

	get activeFrom() {
		return this.form.get('activeFrom');
	}

	get activeTo() {
		return this.form.get('activeTo');
	}

	get product() {
		return this.form.get('product');
	}

	get active() {
		return this.form.get('active');
	}

	get purchasesCount() {
		return this.form.get('purchasesCount');
	}

	private _ngDestroy$ = new Subject<void>();

	constructor() {}

	ngOnInit(): void {
		this._promotion = this.promotionData;
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	static buildForm(formBuilder: FormBuilder): FormGroup {
		return formBuilder.group({
			title: [''],
			activeFrom: [null],
			activeTo: [null],
			product: [null],
			active: [true],
			purchasesCount: [0, Validators.min(0)],
		});
	}

	getValue() {
		return this.form.getRawValue();
	}
}
