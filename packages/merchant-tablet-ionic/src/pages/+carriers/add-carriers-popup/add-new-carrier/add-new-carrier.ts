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
import { ICarrierCreateObject } from '@modules/server.common/interfaces/ICarrier';
import { getDummyImage } from '@modules/server.common/utils';
import { FileUploader } from 'ng2-file-upload';
import { BasicInfoFormComponent } from './basic-info/basic-info-form.component';
import { AccountFormComponent } from './account/account-form.component';
import { Subject } from 'rxjs';
import { LocationFormComponent } from './location/location-form.component';

@Component({
	selector: 'add-new-carrier',
	templateUrl: './add-new-carrier.html',
	styleUrls: ['./add-new-carrier.scss'],
})
export class AddNewCarrierComponent implements OnInit, OnDestroy, OnChanges {
	uploader: FileUploader;
	emptyLogo: boolean = false;

	private _ngDestroy$ = new Subject<void>();

	@Output()
	buttonClickEvent = new EventEmitter();

	@Output()
	onCompleteEvent = new EventEmitter();

	@Input()
	isDone: boolean;

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

	constructor() {}

	ngOnInit(): void {}

	ngOnChanges() {}

	get password() {
		return this.accountForm.password.value;
	}

	getCarrierCreateObject(): ICarrierCreateObject {
		const letter = this.basicInfoForm.firstName.value
			.charAt(0)
			.toUpperCase();

		let logo = '';

		this.basicInfoForm.logo.value === ''
			? (logo = getDummyImage(300, 300, letter))
			: (logo = this.basicInfoForm.logo.value);

		const CarrierCreateObject: ICarrierCreateObject = {
			firstName: this.basicInfoForm.firstName.value,
			lastName: this.basicInfoForm.lastName.value,
			email: this.basicInfoForm.email.value,
			logo,
			phone: this.basicInfoForm.phone.value,

			username: this.accountForm.userName.value,
			isSharedCarrier: this.accountForm.isSharedCarrier.value,

			geoLocation: {
				city: this.locationForm.city.value,
				streetAddress: this.locationForm.street.value,
				house: this.locationForm.house.value,
				loc: {
					type: 'Point',
					coordinates: [
						this.locationForm.lng.value,
						this.locationForm.lat.value,
					],
				},
				countryId: this.locationForm.country.value,
				postcode: this.locationForm.postcode.value,
			},
		};

		return CarrierCreateObject;
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

	clickPrevOrComplete(data) {
		const prevOrComplete = data;
		this.buttonClickEvent.emit(prevOrComplete);
	}

	onClickComplete(data) {
		this.onCompleteEvent.emit(data);
	}

	ngOnDestroy(): void {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
