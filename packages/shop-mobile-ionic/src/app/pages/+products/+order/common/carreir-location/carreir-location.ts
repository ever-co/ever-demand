import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	Input,
	OnDestroy,
} from '@angular/core';
import { environment } from 'environments/environment';
import GeoLocation from '@modules/server.common/entities/GeoLocation';

@Component({
	selector: 'e-cu-directions-location',
	template: ` <div style="height:100%" #gmap></div> `,
})
export class DirectionsLocationComponent implements OnInit, OnDestroy {
	@ViewChild('gmap', { static: true })
	gmapElement: ElementRef;
	public map: google.maps.Map;
	private directionsDisplay = new google.maps.DirectionsRenderer();
	private directionsService = new google.maps.DirectionsService();

	@Input()
	origin: GeoLocation;
	@Input()
	destination: GeoLocation;

	ngOnInit(): void {
		this.loadMap();
	}

	async loadMap() {
		const mapProp = {
			center: new google.maps.LatLng(
				environment.DEFAULT_LATITUDE,
				environment.DEFAULT_LONGITUDE
			),
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl: false,
			streetViewControl: false,
		};
		this.map = await new google.maps.Map(
			this.gmapElement.nativeElement,
			mapProp
		);
		this.loadRoot();
	}

	loadRoot() {
		if (this.origin && this.destination) {
			const [originLng, originLat] = this.origin.loc.coordinates;
			const [
				destinationLng,
				destinationLat,
			] = this.destination.loc.coordinates;
			const origin = new google.maps.LatLng(originLat, originLng);
			const destination = new google.maps.LatLng(
				destinationLat,
				destinationLng
			);

			const request = {
				origin,
				destination,
				travelMode: google.maps.TravelMode['DRIVING'],
			};

			this.directionsService.route(request, (res, stat: any) => {
				if (stat === 'OK') {
					this.directionsDisplay.setDirections(res);
				}
			});

			this.directionsDisplay.setMap(this.map);
		}
	}

	ngOnDestroy(): void {
		this.directionsDisplay.setMap(null);
	}
}
