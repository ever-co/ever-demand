import {
	Component,
	ElementRef,
	OnInit,
	ViewChild,
	ChangeDetectionStrategy,
} from '@angular/core';

export interface MapPoint {
	lat: number;
	lng: number;
}

/** The Google Maps JS API is loaded at runtime (see `googleMapsInitializer`); it may be absent. */
function mapsApi(): typeof google.maps | null {
	return typeof google !== 'undefined' && google.maps ? google.maps : null;
}

/**
 * The carrier map, on the Google Maps JavaScript API. Every method is a no-op when the API is
 * not loaded (no `GOOGLE_MAPS_API_KEY`), so the delivery flow keeps working without a map.
 */
@Component({
	selector: 'carrier-map',
	templateUrl: 'map.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class MapComponent implements OnInit {
	@ViewChild('map', { static: true })
	mapElement: ElementRef;

	map: google.maps.Map;

	private directionsRenderer: google.maps.DirectionsRenderer;
	private directionsService: google.maps.DirectionsService;

	ngOnInit(): void {
		this.showMap();
	}

	showMap() {
		const maps = mapsApi();
		if (!maps) {
			return;
		}
		this.map = new maps.Map(this.mapElement.nativeElement, { zoom: 17 });
	}

	setCenter(position: MapPoint) {
		if (this.map) {
			this.map.setCenter(position);
		}
	}

	addMarker(position: MapPoint) {
		const maps = mapsApi();
		if (this.map && maps) {
			return new maps.Marker({ position, map: this.map });
		}
	}

	drawRoute(origin: MapPoint, destination: MapPoint) {
		const maps = mapsApi();
		if (!this.map || !maps) {
			return;
		}
		this.directionsRenderer ??= new maps.DirectionsRenderer();
		this.directionsService ??= new maps.DirectionsService();
		this.directionsRenderer.setMap(this.map);

		this.directionsService.route(
			{ origin, destination, travelMode: maps.TravelMode.DRIVING },
			(res, status) => {
				if (status === maps.DirectionsStatus.OK) {
					this.directionsRenderer.setDirections({
						routes: [],
					} as any);
					this.directionsRenderer.setDirections(res);
				}
			},
		);
	}
}
