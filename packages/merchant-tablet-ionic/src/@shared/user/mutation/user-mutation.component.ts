import {
	Component,
	ViewChild,
	EventEmitter,
	Output,
	Input,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { UserAuthRouter } from '@modules/client.common.angular2/routers/user-auth-router.service';
import { BasicInfoFormComponent } from '../forms/basic-info/basic-info-form.component';
import { LocationFormComponent } from '../forms/location/location-form.component';
import { ModalController, ToastController } from '@ionic/angular';
import User from '@modules/server.common/entities/User';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { getDummyImage } from '@modules/server.common/utils';

@Component({
	selector: 'user-mutation',
	templateUrl: './user-mutation.component.html',
	styleUrls: ['./user-mutation.component.scss'],
})
export class UserMutationComponent {
	readonly form: FormGroup = this._formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this._formBuilder),
		apartment: LocationFormComponent.buildApartmentForm(this._formBuilder),
		location: LocationFormComponent.buildForm(this._formBuilder),
	});

	readonly basicInfo = this.form.get('basicInfo') as FormGroup;
	readonly apartment = this.form.get('apartment') as FormGroup;
	readonly location = this.form.get('location') as FormGroup;

	@ViewChild('basicInfoForm')
	basicInfoForm: BasicInfoFormComponent;

	@ViewChild('locationForm')
	locationForm: LocationFormComponent;

	@Input()
	user: User;

	@Output()
	customerIdEmitter = new EventEmitter<string>();

	mapCoordinatesEmitter = new EventEmitter<
		google.maps.LatLng | google.maps.LatLngLiteral
	>();

	mapGeometryEmitter = new EventEmitter<
		google.maps.places.PlaceGeometry | google.maps.GeocoderGeometry
	>();

	isNextStepAvailable: boolean = false;

	constructor(
		private readonly _userAuthRouter: UserAuthRouter,
		private readonly _formBuilder: FormBuilder,
		private readonly modalController: ModalController,
		private readonly userRouter: UserRouter,
		private readonly toastController: ToastController
	) {}

	onCoordinatesChanges(
		coords: google.maps.LatLng | google.maps.LatLngLiteral
	) {
		this.mapCoordinatesEmitter.emit(coords);
	}

	onGeometrySend(
		geometry:
			| google.maps.places.PlaceGeometry
			| google.maps.GeocoderGeometry
	) {
		this.mapGeometryEmitter.emit(geometry);
	}

	broadcastCustomerId(customerId: string) {
		this.customerIdEmitter.emit(customerId);
	}

	async createCustomer() {
		let userId: string;
		let message: string;
		try {
			const userRegistrationInput = {
				user: {
					...this.basicInfoForm.getValue(),
					geoLocation: this.locationForm.getValue(),
					apartment: this.locationForm.getApartment(),
				},
			};

			const userData = userRegistrationInput.user;
			if (userData) {
				userRegistrationInput.user = this.getDefaultImage(userData);
			}

			// We reverse coordinates before create new customer, because in geoJSON standart
			// the array of coordinates is in reverse order, instead of 'Lat' => 'Lng' the orders is 'Lng' => 'Lat'
			userRegistrationInput.user.geoLocation.loc.coordinates.reverse();

			const user = await this._userAuthRouter.register(
				userRegistrationInput
			);

			userId = user.id;

			this.broadcastCustomerId(user.id);
			const firstName = user.firstName;
			const lastName = user.lastName;

			message = `Customer ${firstName ? firstName + ' ' : ''} ${
				lastName ? lastName + ' ' : ''
			}(${user.id}) Created`;
		} catch (err) {
			message = `Error in creating customer: '${err.message}'!`;
		} finally {
			await this.presentToast(message);
			await this.modalController.dismiss(userId);
		}
	}

	async saveCustomer() {
		const geoLocation = this.locationForm.getValue();
		geoLocation.loc.coordinates.reverse();

		let updateUpdateData = {
			...this.basicInfoForm.getValue(),
			geoLocation,
			apartment: this.locationForm.getApartment(),
		};

		if (updateUpdateData) {
			updateUpdateData = this.getDefaultImage(updateUpdateData);
		}

		await this.userRouter.updateUser(this.user.id, updateUpdateData);
		await this.modalController.dismiss();
	}

	cancelModal() {
		this.modalController.dismiss();
	}

	private async presentToast(message: string) {
		const toast = await this.toastController.create({
			message,
			duration: 2000,
		});
		toast.present();
	}

	private getDefaultImage(user) {
		if (user && !user.image) {
			const firstNameLetter = user.firstName
				? user.firstName.charAt(0).toUpperCase()
				: '';

			const lastNameLetter = user.lastName
				? user.lastName.charAt(0).toUpperCase()
				: '';

			if (firstNameLetter || lastNameLetter) {
				user.image = getDummyImage(
					300,
					300,
					firstNameLetter + lastNameLetter
				);
			} else {
				const firstCityLetter = user.geoLocation.city
					.charAt(0)
					.toUpperCase();

				user.image = getDummyImage(300, 300, firstCityLetter);
			}
		}

		return user;
	}
}
