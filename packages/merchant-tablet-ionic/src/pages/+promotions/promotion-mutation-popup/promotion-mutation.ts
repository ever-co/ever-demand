import {
	OnDestroy,
	Component,
	ViewChild,
	Input,
	EventEmitter,
	Output,
	OnInit,
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
export class PromotionMutation implements OnDestroy {
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

	ngOnDestroy(): void {
		this._ngDestroy$.next(true);
		this._ngDestroy$.unsubscribe();
	}

	savePromotion() {
		let promotionUserInput = {
			...this.basicInfoForm.getValue(),
			...this.detailsInfoForm.getValue(),
		};

		if (!this.form.valid) {
			this.presentToast('Please fill in valid data.');
			return;
		}

		if (!this.promotion) {
			this.promotionService
				.create(promotionUserInput)
				.pipe(first())
				.subscribe(
					(data) => {
						this.presentToast('Successfully created promotion!');
					},
					(err) => {
						this.presentToast(
							err.message || 'Something went wrong!'
						);
					},
					() => {
						this.updateVisible.emit(true);
						this.cancelModal();
					}
				);
		} else {
			this.promotionService
				.update(this.promotion._id.toString(), promotionUserInput)
				.pipe(first())
				.subscribe(
					(data) => {
						this.presentToast('Successfully updated promotion!');
					},
					(err) => {
						this.presentToast(
							err.message || 'Something went wrong!'
						);
					},
					() => {
						this.updateVisible.emit(true);
						this.cancelModal();
					}
				);
		}
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
