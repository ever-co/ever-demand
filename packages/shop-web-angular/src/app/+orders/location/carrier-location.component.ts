import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { MapDirectionsService } from '@angular/google-maps';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { first } from 'rxjs/operators';

interface Coordinates {
	lat: number;
	lng: number;
}

/** Something with a `geoLocation` (carrier, store, customer) as the orders view passes it. */
interface Located {
	geoLocation: { coordinates: Coordinates; streetAddress?: string };
	[key: string]: any;
}

export interface CarrierLocationDialogData {
	carrier: Located;
	merchant: Located;
	userOrder: Located;
}

const ICONS = {
	warehouse: 'https://maps.google.com/mapfiles/kml/pal3/icon21.png',
	user: 'https://maps.google.com/mapfiles/kml/pal3/icon48.png',
	carrier: 'https://maps.google.com/mapfiles/kml/pal4/icon54.png',
};

/**
 * Dialog map of an order on its way: the carrier, the store and the customer, with the
 * driving route between the customer and the store. Built on `@angular/google-maps`.
 */
@Component({
	standalone: false,
	selector: 'ea-carrier-location',
	styleUrls: ['./carrier-location.component.scss'],
	templateUrl: './carrier-location.component.html',
})
export class CarrierLocationComponent implements OnInit {
	readonly defaultCenter: Coordinates = { lat: 42.642941, lng: 23.334149 };
	readonly userIcon = ICONS.user;
	readonly warehouseIcon = ICONS.warehouse;
	readonly carrierIcon = ICONS.carrier;

	carrierLoc: Located;
	storeLoc: Located;
	userOrder: Located;

	carrierPosition: Coordinates | null = null;
	warehousePosition: Coordinates | null = null;
	userPosition: Coordinates | null = null;
	directions: google.maps.DirectionsResult | null = null;

	constructor(
		@Inject(MAT_DIALOG_DATA) data: CarrierLocationDialogData,
		private readonly directionsService: MapDirectionsService,
		private readonly ngZone: NgZone
	) {
		this.carrierLoc = data.carrier;
		this.storeLoc = data.merchant;
		this.userOrder = data.userOrder;
	}

	ngOnInit(): void {
		this.carrierPosition = toLatLng(this.carrierLoc);
		this.warehousePosition = toLatLng(this.storeLoc);
		this.userPosition = toLatLng(this.userOrder);

		this.showRoute();
	}

	private showRoute() {
		if (!this.userPosition || !this.warehousePosition) {
			return;
		}

		this.directionsService
			.route({
				origin: this.userPosition,
				destination: this.warehousePosition,
				travelMode: google.maps.TravelMode.DRIVING,
			})
			.pipe(first())
			.subscribe(({ result, status }) =>
				this.ngZone.run(() => {
					if (status === google.maps.DirectionsStatus.OK) {
						this.directions = result;
					}
				})
			);
	}
}

function toLatLng(located: Located | null | undefined): Coordinates | null {
	const coordinates = located?.geoLocation?.coordinates;
	return coordinates ? { lat: coordinates.lat, lng: coordinates.lng } : null;
}
