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
import { ToastController, ModalController } from '@ionic/angular';
import { DetailsInfoFormComponent } from '../promotion-forms/details-info/details-info-form.component';
import { PromotionService } from 'services/promotion.service';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';

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

	@Output()
	updateVisible = new EventEmitter<boolean>();

	form: FormGroup = this._formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this._formBuilder),
		detailsInfo: DetailsInfoFormComponent.buildForm(this._formBuilder),
	});

	@ViewChild('basicInfoForm')
	basicInfoForm: BasicInfoFormComponent;

	@ViewChild('promotionDetailsForm')
	detailsInfoForm: DetailsInfoFormComponent;

	private _ngDestroy$ = new Subject();

	readonly basicInfo = this.form.get('basicInfo') as FormGroup;
	readonly detailsInfo = this.form.get('detailsInfo') as FormGroup;

	isNextStepAvailable: boolean = true;

	constructor(
		private readonly _formBuilder: FormBuilder,
		private readonly toastrController: ToastController,
		private readonly modalController: ModalController,
		private readonly promotionService: PromotionService
	) {}

	ngOnInit(): void {}

	ngOnDestroy(): void {
		this._ngDestroy$.next();
		this._ngDestroy$.unsubscribe();
	}

	savePromotion() {
		let updatePromotionData = this.basicInfoForm.getValue();
	}

	createPromotion() {
		// const promotionCreateInput = {
		// 	...this.basicInfoForm.getValue(),
		// 	...this.detailsInfoForm.getValue(),
		// };

		let promotionCreateInput = {
			title: [],
			description: [],
			active: true,
			activeFrom: null,
			activeTo: null,
			purchasesCount: 12,
			image: null,
			product: null,
		};

		// delete promotionCreateInput.product;

		this.promotionService
			.create(promotionCreateInput)
			.pipe(first())
			.subscribe(
				(data) => {
					//tstodo
					console.log(data);
					this.presentToast('Successfully created promotion!');
				},
				(err) => {
					this.presentToast(err.message || 'Something went wrong!');
				},
				() => {
					this.updateVisible.emit(true);
					this.cancelModal();
				}
			);
	}

	private presentToast(message: string) {
		this.toastrController
			.create({
				message,
				duration: 2000,
			})
			.then((toast) => {
				toast.present();
			});
	}

	cancelModal() {
		this.modalController.dismiss();
	}
}
