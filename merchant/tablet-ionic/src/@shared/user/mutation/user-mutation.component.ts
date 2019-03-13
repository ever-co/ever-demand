import { Component, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { UserAuthRouter } from '@modules/client.common.angular2/routers/user-auth-router.service';
import { BasicInfoFormComponent } from '../forms/basic-info/basic-info-form.component';
import { LocationFormComponent } from '../forms/location/location-form.component';
import { AlertController, ModalController } from '@ionic/angular';

@Component({
	selector: 'user-mutation',
	templateUrl: './user-mutation.component.html',
	styleUrls: ['/user-mutation.component.scss']
})
export class UserMutationComponent {
	readonly form: FormGroup = this._formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this._formBuilder),
		apartment: LocationFormComponent.buildApartmentForm(this._formBuilder),
		location: LocationFormComponent.buildForm(this._formBuilder)
	});

	readonly basicInfo = this.form.get('basicInfo') as FormGroup;
	readonly apartment = this.form.get('apartment') as FormGroup;
	readonly location = this.form.get('location') as FormGroup;

	@ViewChild('basicInfoForm')
	basicInfoForm: BasicInfoFormComponent;

	@ViewChild('locationForm')
	locationForm: LocationFormComponent;

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
		private readonly _alertController: AlertController,
		private readonly modalController: ModalController
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
		let alert: HTMLIonAlertElement;
		let userId: string;

		try {
			const userRegistrationInput = {
				user: {
					...this.basicInfoForm.getValue(),
					geoLocation: this.locationForm.getValue(),
					apartment: this.locationForm.getApartment()
				}
			};

			// We reverse coordinates before create new customer, because in geoJSON standart
			// the array of coordinates is in reverse order, instead of 'Lat' => 'Lng' the orders is 'Lng' => 'Lat'
			userRegistrationInput.user.geoLocation.loc.coordinates.reverse();

			const user = await this._userAuthRouter.register(
				userRegistrationInput
			);

			userId = user.id;

			this.broadcastCustomerId(user.id);

			alert = await this._alertController.create({
				message: `Customer with id '${user.id}' created.`,
				buttons: ['OK']
			});
		} catch (err) {
			alert = await this._alertController.create({
				message: `Error in creating customer: '${err.message}'!`,
				buttons: ['OK']
			});
		} finally {
			await alert.present();
			await this.modalController.dismiss(userId);
		}
	}
}
