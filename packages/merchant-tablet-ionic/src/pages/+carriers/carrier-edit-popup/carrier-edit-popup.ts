import {
	Component,
	OnDestroy,
	OnInit,
	Output,
	EventEmitter,
	Input,
	ViewChild,
	OnChanges,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FileUploader } from 'ng2-file-upload';
import { BasicInfoFormComponent } from './basic-info/basic-info-form.component';
import { AccountFormComponent } from './account/account-form.component';
import { Subject } from 'rxjs';
import { LocationFormComponent } from './location/location-form.component';
import { CarrierService } from '../../../services/carrier.service';
import { ModalController } from '@ionic/angular';
import Carrier from '@modules/server.common/entities/Carrier';
import { WarehouseCarriersRouter } from '@modules/client.common.angular2/routers/warehouse-carriers-router.service';

@Component({
	selector: 'carrier-edit-popup',
	templateUrl: 'carrier-edit-popup.html',
	styleUrls: ['./carrier-edit-popup.scss'],
})
export class CarrierEditPopupPage implements OnInit, OnDestroy, OnChanges {
	uploader: FileUploader;
	emptyLogo: boolean = false;

	private _ngDestroy$ = new Subject<void>();

	@Output()
	buttonClickEvent = new EventEmitter();

	@Output()
	onCompleteEvent = new EventEmitter();

	@Input()
	isDone: boolean;

	@Input()
	carrier: Carrier;

	@ViewChild('basicInfoForm', { static: true })
	basicInfoForm: BasicInfoFormComponent;

	@ViewChild('accountForm', { static: true })
	accountForm: AccountFormComponent;

	@ViewChild('locationForm', { static: true })
	locationForm: LocationFormComponent;

	isNextStepOneAvailable: boolean = true;
	isNextStepTwoAvailable: boolean = false;
	isNextStepThreeAvailable: boolean = false;
	backToPrevPage: boolean = false;

	$password: any;

	constructor(
		public modalCtrl: ModalController,
		private _carrierService: CarrierService,
		private warehouseCarriersRouter: WarehouseCarriersRouter
	) {}

	ngOnInit(): void {}

	ngOnChanges() {}

	async _updateCarrier() {
		const basic = {
			firstName: this.basicInfoForm.firstName.value,
			lastName: this.basicInfoForm.lastName.value,
			phone: this.basicInfoForm.phone.value,
			logo: this.basicInfoForm.logo.value,
			email: this.basicInfoForm.email.value,
		};

		const geoLocation = {
			countryId: Number(this.locationForm.country.value),
			city: this.locationForm.city.value,
			streetAddress: this.locationForm.street.value,
			postcode: this.locationForm.postcode.value,
			house: this.locationForm.house.value,
			loc: {
				type: 'Point',
				coordinates: [
					Number(this.locationForm.lng.value),
					Number(this.locationForm.lat.value),
				],
			},
		};

		const account = {
			isActive: this.accountForm.isActive.value,
			isSharedCarrier: this.accountForm.isSharedCarrier.value,
			username: this.accountForm.userName.value,
			password: this.accountForm.password.value,
			repeatPassword: this.accountForm.repeatPassword.value,
		};

		const carrier = this.carrier;

		const carrierCreateObj = {
			firstName: basic.firstName,
			lastName: basic.lastName,
			phone: basic.phone,
			email: basic.email,
			logo: basic.logo,

			username: account.username,
			isActive: account.isActive,
			isSharedCarrier: account.isSharedCarrier,

			geoLocation,
		};

		if (account.password) {
			await this.warehouseCarriersRouter.updatePassword(
				carrier.id,
				account.password
			);
		}

		const id = await this._carrierService
			.updateCarrier(carrier.id, carrierCreateObj)
			.toPromise();

		this.cancelModal();
	}

	get password() {
		return this.accountForm.password.value;
	}

	backToStep1() {
		this.isNextStepOneAvailable = true;
		this.isNextStepTwoAvailable = false;
		this.isNextStepThreeAvailable = false;
	}

	toStep2event($event) {
		this.isNextStepOneAvailable = false;
		this.isNextStepTwoAvailable = true;
		this.isNextStepThreeAvailable = false;
	}

	nextToStep2() {
		this.isNextStepOneAvailable = false;
		this.isNextStepTwoAvailable = true;
		this.isNextStepThreeAvailable = false;
	}

	nextToStep3() {
		this.isNextStepOneAvailable = false;
		this.isNextStepTwoAvailable = false;
		this.isNextStepThreeAvailable = true;
	}

	cancelModal() {
		this.modalCtrl.dismiss();
	}

	clickPrevOrComplete(data) {
		const prevOrComplete = data;
		this.buttonClickEvent.emit(prevOrComplete);
	}

	onClickComplete(data) {
		this._updateCarrier();
	}

	ngOnDestroy(): void {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
