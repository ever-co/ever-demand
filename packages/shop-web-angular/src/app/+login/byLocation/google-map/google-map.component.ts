import { ViewChild, Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'ngx-google-map',
	styles: [
		`
			.g-map {
				height: 100%;
				min-height: 250px;
				min-width: 300px !important;
				opacity: 0.8;
			}
		`,
	],
	template: ` <div #gmap class="g-map"></div> `,
})
export class GoogleMapComponent implements OnInit, OnDestroy {
	@ViewChild('gmap', { static: true })
	public mapElement: any;

	@Input()
	public mapTypeEvent: Observable<string>;
	@Input()
	public mapCoordEvent: Observable<
		google.maps.LatLng | google.maps.LatLngLiteral
	>;
	@Input()
	public mapGeometryEvent: Observable<
		google.maps.places.PlaceGeometry | google.maps.GeocoderGeometry
	>;

	public map: google.maps.Map;

	private _mapMarker: google.maps.Marker;

	private _ngDestroy$ = new Subject<void>();

	ngOnInit() {
		this._setupGoogleMap();
		this._listenForMapType();
		this._listenForMapCoordinates();
		this._listenForMapGeometry();
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	private _navigateTo(
		location: google.maps.LatLng | google.maps.LatLngLiteral
	) {
		this.map.setCenter(location);
	}

	private _listenForMapGeometry() {
		if (this.mapGeometryEvent) {
			this.mapGeometryEvent
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((geometry) => {
					if (geometry.viewport) {
						this.map.fitBounds(geometry.viewport);
					} else {
						this.map.setCenter(geometry.location);
						this.map.setZoom(17);
					}
				});
		}
	}

	private _listenForMapType() {
		if (this.mapTypeEvent) {
			this.mapTypeEvent
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((mapType: string) => {
					this.map.setMapTypeId(mapType);
				});
		}
	}

	private _listenForMapCoordinates() {
		if (this.mapCoordEvent) {
			this.mapCoordEvent
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((location) => {
					this._navigateTo(location);
					this._addMapMarker(location);
				});
		}
	}

	private _setupGoogleMap() {
		const optionsMap = {
			center: new google.maps.LatLng(0, 0),
			zoom: 14,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		};

		this.map = new google.maps.Map(
			this.mapElement.nativeElement,
			optionsMap
		);
	}

	private _addMapMarker(
		location: google.maps.LatLng | google.maps.LatLngLiteral
	) {
		this._clearMarker();

		this._mapMarker = new google.maps.Marker({
			map: this.map,
			position: location,
			// icon: 'assets/images/google-map-customer-marker.png'
		});
	}

	private _clearMarker() {
		if (this._mapMarker) {
			this._mapMarker.setMap(null);
		}
	}
}
