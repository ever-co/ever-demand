import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	Input,
	OnDestroy,
} from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import { environment } from 'environments/environment';

@Component({
	selector: 'ea-carrier-location',
	template: ` <div style="height:100%" #gmap></div> `,
})
export class CarrierLocationComponent implements OnInit, OnDestroy {
	@ViewChild('gmap', { static: true })
	gmapElement: ElementRef;
	public map: google.maps.Map;
	private directionsDisplay = new google.maps.DirectionsRenderer();
	private directionsService = new google.maps.DirectionsService();

	@Input()
	order: Order;

	ngOnInit(): void {
		this.loadMap();

		this.loadRoot();
	}

	loadMap() {
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
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
	}

	loadRoot() {
		if (this.order) {
			const [carrierLng, carrierLat] = this.order.carrier[
				'geoLocation'
			].loc.coordinates;
			const [userLng, userLat] = this.order.user[
				'geoLocation'
			].loc.coordinates;
			const origin = new google.maps.LatLng(carrierLat, carrierLng);
			const destination = new google.maps.LatLng(userLat, userLng);

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
