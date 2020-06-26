import {
	OnInit,
	OnDestroy,
	Component,
	ViewChild,
	Input,
	EventEmitter,
	Output,
} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IPromotion } from '@modules/server.common/interfaces/IPromotion';
import { BasicInfoFormComponent } from '../promotion-forms/basic-info/basic-info-form.component';
import { ToastController } from '@ionic/angular';
import { DetailsInfoFormComponent } from '../promotion-forms/details-info/details-info-form.component';

@Component({
	selector: 'promotion-mutation',
	templateUrl: 'promotion-mutation.html',
	styleUrls: ['./promotion-mutation.scss'],
})
export class PromotionMutation implements OnInit, OnDestroy {
	@Input()
	promotion: IPromotion;

	@Input()
	visible: boolean = true;

	// @Output()
	// updateVisible = new EventEmitter<boolean>();

	form: FormGroup = this._formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this._formBuilder),
	});

	@ViewChild('basicInfoForm')
	basicInfoForm: BasicInfoFormComponent;

	@ViewChild('promotionDetailsForm')
	locationForm: DetailsInfoFormComponent;

	readonly basicInfo = this.form.get('basicInfo') as FormGroup;
	readonly detailsInfo = this.form.get('locationForm') as FormGroup;

	isNextStepAvailable: boolean = false;

	constructor(
		private readonly _formBuilder: FormBuilder,
		private readonly toastrController: ToastController
	) {}

	ngOnInit(): void {}

	ngOnDestroy(): void {}

	savePromotion() {
		let updatePromotionData = this.basicInfoForm.getValue();
	}

	createPromotion() {}
}
