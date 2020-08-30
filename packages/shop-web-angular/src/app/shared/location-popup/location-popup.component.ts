import {
	Component,
	OnInit,
	Inject,
	EventEmitter,
	AfterViewInit,
	ViewChild,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';
import { LocationFormComponent } from 'app/+login/byLocation/location/location.component';
import { environment } from 'environments/environment';
import { Store } from 'app/services/store';
import GeoLocation, {
	getCountryName,
} from '@modules/server.common/entities/GeoLocation';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';

@Component({
	styleUrls: ['./location-popup.component.scss'],
	templateUrl: './location-popup.component.html',
})
export class LocationPopupComponent implements OnInit, AfterViewInit {
	@ViewChild('locationForm')
	locationForm: LocationFormComponent;

	place: google.maps.places.PlaceResult;
	coordinates: ILocation;

	mapCoordEmitter = new EventEmitter<number[]>();
	mapGeometryEmitter = new EventEmitter<any>();

	constructor(
		private dialogRef: MatDialogRef<LocationPopupComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private router: Router,
		private store: Store,
		private userRouter: UserRouter
	) {}
	ngOnInit(): void {
		this.place = this.data.place;

		this.coordinates = {
			type: 'Point',
			coordinates: [
				this.place
					? this.place.geometry.location.lat()
					: environment.DEFAULT_LATITUDE || 0,
				this.place
					? this.place.geometry.location.lng()
					: environment.DEFAULT_LONGITUDE || 0,
			],
		};

		console.warn('LocationPopupComponent loaded');
	}

	ngAfterViewInit(): void {
		if (this.place) {
			this.onCoordinatesChanges(this.place.geometry.location);
			this.onGeometrySend(this.place.geometry);
		}
	}

	onCoordinatesChanges(coords) {
		this.mapCoordEmitter.emit(coords);
	}

	onGeometrySend(geometry: any) {
		this.mapGeometryEmitter.emit(geometry);
	}

	async updateLocation() {
		if (this.locationForm) {
			const isValid = this.locationForm.statusForm;
			if (isValid) {
				const userId = this.store.userId;
				await this.updateUser(
					userId,
					this.locationForm.getCreateUserInfo().geoLocation
				);
				const address = this.locationForm.searchElement.nativeElement
					.value;

				this.close(address);
			}
		}
		console.warn('TODO update');
	}

	async close(text = '') {
		await this.dialogRef.close(text);
		await this.reload();
	}

	private async reload() {
		await this.router.navigateByUrl('reload', {
			skipLocationChange: true,
		});
		await this.router.navigateByUrl('/products');
	}

	private async updateUser(userId, geoLocation) {
		if (userId) {
			await this.userRouter.updateUser(userId, {
				geoLocation,
			});
		}
	}
}
