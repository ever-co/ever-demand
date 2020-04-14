import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	Output,
	AfterViewInit,
} from '@angular/core';

import { BasicInfoFormComponent } from '../../../../../@shared/user/forms';
import { LocationFormComponent } from '../../../../../@shared/forms/location';
import { UsersService } from '../../../../../@core/data/users.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToasterService } from 'angular2-toaster';

@Component({
	selector: 'ea-warehouse-order-create-user',
	styleUrls: ['./warehouse-order-create-user.component.scss'],
	templateUrl: './warehouse-order-create-user.component.html',
})
export class WarehouseOrderCreateUserComponent
	implements OnDestroy, AfterViewInit {
	readonly form: FormGroup = this._formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this._formBuilder),
		apartment: LocationFormComponent.buildApartmentForm(this._formBuilder),
		location: LocationFormComponent.buildForm(this._formBuilder),
	});

	readonly basicInfo = this.form.get('basicInfo') as FormControl;
	readonly apartment = this.form.get('apartment') as FormControl;
	readonly location = this.form.get('location') as FormControl;

	@Input()
	createUserEvent: Observable<void>;

	mapCoordEmitter = new EventEmitter<
		google.maps.LatLng | google.maps.LatLngLiteral
	>();

	mapGeometryEmitter = new EventEmitter<
		google.maps.places.PlaceGeometry | google.maps.GeocoderGeometry
	>();

	@Output()
	newUserEmitter = new EventEmitter<any>();

	private readonly _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly _formBuilder: FormBuilder,
		private readonly _usersService: UsersService,
		private readonly _toasterService: ToasterService
	) {}

	ngAfterViewInit() {
		this._listenForNewUser();
	}

	onCoordinatesChanges(
		location: google.maps.LatLng | google.maps.LatLngLiteral
	) {
		this.mapCoordEmitter.emit(location);
	}

	onGeometrySend(
		geometry:
			| google.maps.places.PlaceGeometry
			| google.maps.GeocoderGeometry
	) {
		this.mapGeometryEmitter.emit(geometry);
	}

	private _listenForNewUser() {
		this.createUserEvent.pipe(takeUntil(this._ngDestroy$)).subscribe(() => {
			if (this.form.valid) {
				this._registerNewUser();
			}
		});
	}

	private async _registerNewUser() {
		const rawData = {
			...this.basicInfo.value,
			apartment: this.apartment.value,
			geoLocation: this.location.value,
		};

		// GeoJSON use reversed order for coordinates from our implementation.
		// we use lat => lng but GeoJSON use lng => lat.
		this.location.value.loc.coordinates.reverse();

		try {
			const user = await this._usersService.registerUser({
				user: rawData,
			});
			const userFirstname = user.firstName;
			this.newUserEmitter.emit(user);
			this.form.reset();
			this._toasterService.pop(
				'success',
				`User "${userFirstname}" was added successfully`
			);
		} catch (error) {
			this._toasterService.pop(
				'error',
				`Error in creating customer: "${error.message}"`
			);
		}
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
