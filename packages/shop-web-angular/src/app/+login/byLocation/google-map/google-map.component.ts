import {
	Component,
	Input,
	NgZone,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * The address map of the location forms (login by address, change address popup):
 * follows the coordinates and geometry the form emits and marks the chosen place.
 * Built on `@angular/google-maps` (the Maps JS API itself is loaded by `GoogleMapsLoader`).
 */
@Component({
	standalone: false,
	selector: 'ngx-google-map',
	styles: [
		`
			:host {
				display: block;
				height: 100%;
			}

			.g-map {
				display: block;
				height: 100%;
				min-height: 250px;
				min-width: 300px !important;
				opacity: 0.8;
			}
		`,
	],
	template: `
		<google-map
			class="g-map"
			width="100%"
			height="100%"
			[center]="center"
			[zoom]="zoom"
			[mapTypeId]="mapTypeId"
		>
			@if (markerPosition) {
				<map-marker [position]="markerPosition"></map-marker>
			}
		</google-map>
	`,
})
export class GoogleMapComponent implements OnInit, OnDestroy {
	@ViewChild(GoogleMap, { static: true })
	public map: GoogleMap;

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

	public center: google.maps.LatLng | google.maps.LatLngLiteral = {
		lat: 0,
		lng: 0,
	};
	public zoom = 14;
	public mapTypeId: string = 'roadmap';
	public markerPosition:
		| google.maps.LatLng
		| google.maps.LatLngLiteral
		| null = null;

	private _ngDestroy$ = new Subject<void>();

	constructor(private readonly ngZone: NgZone) {}

	ngOnInit() {
		this._listenForMapType();
		this._listenForMapCoordinates();
		this._listenForMapGeometry();
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	private _listenForMapGeometry() {
		if (this.mapGeometryEvent) {
			this.mapGeometryEvent
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((geometry) =>
					// Geocoder and autocomplete callbacks may run outside the Angular zone
					this.ngZone.run(() => {
						if (geometry.viewport) {
							this.map.fitBounds(geometry.viewport);
						} else {
							this.center = geometry.location;
							this.zoom = 17;
						}
					})
				);
		}
	}

	private _listenForMapType() {
		if (this.mapTypeEvent) {
			this.mapTypeEvent
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((mapType: string) =>
					this.ngZone.run(() => (this.mapTypeId = mapType))
				);
		}
	}

	private _listenForMapCoordinates() {
		if (this.mapCoordEvent) {
			this.mapCoordEvent
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((location) =>
					this.ngZone.run(() => {
						this.center = location;
						this.markerPosition = location;
					})
				);
		}
	}
}
