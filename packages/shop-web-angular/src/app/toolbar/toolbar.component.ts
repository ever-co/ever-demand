import { Component, NgZone, ViewChild, AfterViewInit } from '@angular/core';
import { SidenavService } from '../sidenav/sidenav.service';
import { styleVariables } from '../../styles/variables';
import { Store } from 'app/services/store';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import { Router } from '@angular/router';
import GeoLocation, {
	Country,
} from '@modules/server.common/entities/GeoLocation';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { first } from 'rxjs/operators';
import { GeoLocationService } from 'app/services/geo-location';
import { MatSearchComponent } from '@modules/material-extensions/search/mat-search.component';
import { MatDialog } from '@angular/material/dialog';
import { LocationPopupComponent } from 'app/shared/location-popup/location-popup.component';
import { environment } from 'environments/environment';

@Component({
	selector: 'toolbar',
	styleUrls: ['./toolbar.component.scss'],
	templateUrl: './toolbar.component.html',
})
export class ToolbarComponent implements AfterViewInit {
	styleVariables: typeof styleVariables = styleVariables;
	isDeliveryRequired: boolean;

	@ViewChild('matSearch')
	matSearch: MatSearchComponent;

	private initializedAddress: string;

	constructor(
		private readonly sidenavService: SidenavService,
		private readonly ngZone: NgZone,
		private readonly store: Store,
		private readonly router: Router,
		private readonly userRouter: UserRouter,
		private readonly geoLocationService: GeoLocationService,
		private dialog: MatDialog
	) {
		this.isDeliveryRequired =
			this.store.deliveryType === DeliveryType.Delivery;
		this.loadAddress();
		/*let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
			types: ["address"]
		});
		autocomplete.addListener("place_changed", () => {
			this.ngZone.run(() => {
				//get the place result
				let place: google.maps.places.PlaceResult = autocomplete.getPlace();

				//verify result
				if (place.geometry === undefined || place.geometry === null) {
					return;
				}

				//set latitude, longitude and zoom
				this.latitude = place.geometry.location.lat();
				this.longitude = place.geometry.location.lng();
				this.zoom = 12;
			});
		});*/
	}

	ngAfterViewInit(): void {
		this.initGoogleAutocompleteApi();
	}

	async toggleGetProductsType() {
		this.isDeliveryRequired = !this.isDeliveryRequired;

		this.store.deliveryType = this.isDeliveryRequired
			? DeliveryType.Delivery
			: DeliveryType.Takeaway;

		await this.reload();
	}

	private tryFindNewAddress(address: string) {
		const geocoder = new google.maps.Geocoder();

		geocoder.geocode(
			{
				address,
			},
			(results, status) => {
				if (status === google.maps.GeocoderStatus.OK) {
					const place: google.maps.GeocoderResult = results[0];

					this.applyNewPlaceOnTheMap(place);
				}
			}
		);
	}

	private async loadAddress(findNew: boolean = false) {
		let geoLocationForProducts: GeoLocation;

		const isProductionEnv = environment.production;

		if (this.store.userId && !findNew && isProductionEnv) {
			const user = await this.userRouter
				.get(this.store.userId)
				.pipe(first())
				.toPromise();

			geoLocationForProducts = user.geoLocation;
		} else {
			try {
				geoLocationForProducts = await this.geoLocationService.getCurrentGeoLocation();
			} catch (error) {
				console.warn(error);
			}
		}

		this.tryFindNewCoordinates(geoLocationForProducts, findNew);
	}

	private tryFindNewCoordinates(
		geoLocation: GeoLocation,
		findNew: boolean = false
	) {
		const lat = geoLocation.loc.coordinates[1];
		const lng = geoLocation.loc.coordinates[0];

		const geocoder = new google.maps.Geocoder();
		geocoder.geocode(
			{
				location: { lng: lng, lat: lat },
			},
			async (results, status) => {
				if (status === google.maps.GeocoderStatus.OK) {
					const formattedAddress = results[0].formatted_address;
					const place: google.maps.GeocoderResult = results[0];

					const userId = this.store.userId;

					if (findNew && userId) {
						const addressComponents = place.address_components;
						const city = addressComponents.find((a) =>
							a.types.includes('locality')
						).long_name;

						const streetAddress = addressComponents.find(
							(a) =>
								a.types.includes('route') ||
								a.types.includes('intersection')
						).long_name;

						const house = addressComponents.find((a) =>
							a.types.includes('street_number')
						).long_name;

						const country = addressComponents.find((a) =>
							a.types.includes('country')
						).short_name;

						await this.updateUser(userId, {
							countryId: Country[country],
							city,
							streetAddress,
							house,
							loc: {
								type: 'Point',
								coordinates: [lng, lat],
							},
						} as GeoLocation);

						this.reload();
					}

					this.applyFormattedAddress(formattedAddress);
				}
			}
		);
	}

	private applyFormattedAddress(address: string) {
		if (this.matSearch.input) {
			this.initializedAddress = address;
			this.matSearch.input.nativeElement.value = address;
		}
	}

	private initGoogleAutocompleteApi() {
		if (this.matSearch.input) {
			new google.maps.places.Autocomplete(
				this.matSearch.input.nativeElement
			);
		}
	}

	private applyNewPlaceOnTheMap(
		place: google.maps.places.PlaceResult | google.maps.GeocoderResult
	) {
		if (place.geometry === undefined || place.geometry === null) {
			// this._popInvalidAddressMessage();
			return;
		}
		const neededAddressTypes = [
			'country',
			'locality',
			'route',
			'street_number',
		];
		const existedTypes = place.address_components.map((ac) => ac.types[0]);

		for (const type of neededAddressTypes) {
			if (!existedTypes.includes(type)) {
				this.openLocationForm(place);
				return;
			}
		}

		if (
			this.initializedAddress &&
			this.initializedAddress !== place.formatted_address
		) {
			this.tryFindNewCoordinates(
				{
					loc: {
						type: 'Point',
						coordinates: [
							place.geometry.location.lng(),
							place.geometry.location.lat(),
						],
					},
				} as GeoLocation,
				true
			);
		}
		this.initializedAddress = place.formatted_address;
	}

	private async openLocationForm(place = null) {
		const locationPopup = await this.dialog.open(LocationPopupComponent, {
			width: '900px',
			data: {
				place,
			},
		});

		const res = await locationPopup
			.beforeClosed()
			.pipe(first())
			.toPromise();
		if (res !== '') {
			this.matSearch.input.nativeElement.value = res;
		} else if (this.initializedAddress) {
			this.matSearch.input.nativeElement.value = this.initializedAddress;
		}
	}

	private async reload() {
		await this.router.navigateByUrl('reload', {
			skipLocationChange: true,
		});
		await this.router.navigateByUrl('/products');
	}

	private async updateUser(userId, geoLocation: GeoLocation) {
		if (userId) {
			await this.userRouter.updateUser(userId, {
				geoLocation,
			});
		}
	}
}
