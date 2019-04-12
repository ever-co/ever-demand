import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
	selector: 'ea-warehouse-manage-tabs-delivery-areas',
	styleUrls: ['./warehouse-manage-tabs-delivery-areas.component.scss'],
	templateUrl: './warehouse-manage-tabs-delivery-areas.component.html'
})
export class WarehouseManageTabsDeliveryAreasComponent
	implements OnInit, OnDestroy {
	@ViewChild('gmap')
	mapElement: any;

	@Input()
	mapCoordEvent: Observable<google.maps.LatLng | google.maps.LatLngLiteral>;

	form: FormGroup;
	selectedShapeType: string;
	zonesData: any[] = []; // Used to be parsed to GeoJSON and sent to the database.
	// This will be dinamicly created when adding and removing data

	zonesObjects: any[] = [];

	// Used to disable Add button, form and show the text to draw
	shapeReady: boolean = false;

	// Used to know when we're editing a zone
	isEditing: boolean = false;

	private _zoneNumber: number = 1;

	private _map: google.maps.Map;
	private _drawingManager: google.maps.drawing.DrawingManager;
	private _polyOptions: any = {
		strokeWeight: 0.5,
		fillOpacity: 0.45,
		editable: true,
		fillColor: '#1E90FF'
	};
	private _selectedZone: any;
	private _mapMarker: google.maps.Marker;

	private _fakeData = {
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [23.3575917, 42.669069]
				},
				properties: {
					fee: 2.99,
					minimumAmount: 10,
					name: 'Fake Circle #1',
					radius: 1311.0525309481147
				}
			},
			{
				type: 'Feature',
				geometry: {
					type: 'Polygon',
					coordinates: [
						[
							[42.6718458, 23.2726193],
							[42.6654086, 23.2872106],
							[42.6776514, 23.2981969],
							[42.6796706, 23.2865239]
						]
					]
				},
				properties: {
					fee: 4.99,
					minimumAmount: 20,
					name: 'Fake Polygon #1'
				}
			}
		]
	};

	private _ngDestroy$ = new Subject<void>();

	constructor(private fb: FormBuilder) {}

	ngOnInit() {
		this._setupGoogleMap();
		this._listenForMapCoordinates();
		this._loadFakeData();
		this._initiliazeForm();
	}

	private _loadFakeData() {
		this._fakeData.features.forEach((feature) => {
			if (feature.geometry.type === 'Point') {
				// Point = Circle
				const circle = new google.maps.Circle({
					center: {
						// Point coodinates are reversed: lng => lat
						lng: +feature.geometry.coordinates[0],
						lat: +feature.geometry.coordinates[1]
					},
					radius: feature.properties['radius'],
					strokeWeight: 0.5,
					fillOpacity: 0.45,
					fillColor: '#1E90FF',
					map: this._map
				});

				circle['properties'] = feature.properties;

				this._addZoneEventListeners(circle);

				this.zonesObjects.push(circle);
			} else {
				const polygon = new google.maps.Polygon({
					strokeWeight: 0.5,
					fillOpacity: 0.45,
					fillColor: '#1E90FF',
					paths: this._mapCoordinates(feature.geometry.coordinates)
				});

				polygon['properties'] = feature.properties;

				this._addZoneEventListeners(polygon);

				this.zonesObjects.push(polygon);

				polygon.setMap(this._map);
			}
		});
	}

	private _mapCoordinates(coordinates) {
		const tempArr = [];

		coordinates[0].forEach((c) => {
			tempArr.push({
				lat: c[0],
				lng: c[1]
			});
		});

		return tempArr;
	}

	startDrawing() {
		this._clearSelection();

		this._drawingManager = new google.maps.drawing.DrawingManager({
			drawingMode: this._getShape(),
			drawingControl: false,
			circleOptions: this._polyOptions,
			polygonOptions: this._polyOptions,
			map: this._map
		});

		google.maps.event.addListener(
			this._drawingManager,
			'overlaycomplete',
			(zoneObject) => {
				// Switch back to non-drawing mode after drawing a shape.
				this._drawingManager.setDrawingMode(null);
				// Set state to ready so the Add button is enabled
				this.shapeReady = true;

				// Add an event listener that selects the newly-drawn shape when the user
				// mouses down on it.
				const newZone = zoneObject.overlay;
				newZone.type = zoneObject.type;

				this._addZoneEventListeners(newZone);

				this.setSelection(newZone);
			}
		);

		google.maps.event.addListener(
			this._drawingManager,
			'drawingmode_changed',
			this._clearSelection
		);
	}

	cancelAdd() {
		this.deleteSelectedShape();
		this.form.get('fee').setValue('');
		this.form.get('amount').setValue('');
	}

	closeEdit() {
		this.isEditing = false;
		this._clearSelection();
	}

	addZone() {
		if (this.shapeReady && this.form.status === 'VALID') {
			if (
				this._selectedZone.type ===
				google.maps.drawing.OverlayType.POLYGON
			) {
				const coordinates = [[]];

				this._selectedZone.getPath().forEach((point) => {
					const mappedCoordinates = point
						.toUrlValue(7)
						.split(',')
						.map((p) => +p);

					coordinates[0].push(mappedCoordinates);
				});

				this.zonesData.push({
					polygon: coordinates,
					name: this.form.get('name').value,
					minimumAmount: this.form.get('amount').value,
					fee: this.form.get('fee').value
				});

				this._selectedZone.properties = {
					name: this.form.get('name').value,
					minimumAmount: this.form.get('amount').value,
					fee: this.form.get('fee').value
				};

				this.zonesObjects.push(this._selectedZone);
			} else {
				// Shape must be circle, because drawingManager is initialized with only two shapes

				/* Since GeoJSON doesn't support circle shape types, we will add it as a point and later use that as the center
				of the circle
				We will save the radius as a property and will have our full circle */

				const coordsArr = this._selectedZone
					.getCenter()
					.toUrlValue(7)
					.split(',');

				const radius = this._selectedZone.getRadius();

				this.zonesData.push({
					x: coordsArr[0],
					y: coordsArr[1],
					radius,
					name: this.form.get('name').value,
					minimumAmount: this.form.get('amount').value,
					fee: this.form.get('fee').value
				});

				this._selectedZone.properties = {
					name: this.form.get('name').value,
					minimumAmount: this.form.get('amount').value,
					fee: this.form.get('fee').value
				};

				this.zonesObjects.push(this._selectedZone);
			}

			console.log(this.zonesObjects);

			this._clearSelection();
			this._zoneNumber++;
			this.selectedShapeType = null;
			this._selectedZone = null;
			this.shapeReady = false;

			this.form.get('name').setValue('Zone ' + this._zoneNumber);
			this.form.get('fee').setValue('');
			this.form.get('amount').setValue('');
		}
	}

	deleteSelectedShape() {
		if (this._selectedZone) {
			this._selectedZone.setMap(null);
			this.shapeReady = false;
			this.selectedShapeType = null;
		}
	}

	private _addZoneEventListeners(zone) {
		google.maps.event.addListener(zone, 'click', () => {
			if (!this.selectedShapeType) {
				// if selectedShapeType we're adding a zone, so we shoudn't be able to select other zone
				this.setSelection(zone);
			}
		});

		google.maps.event.addListener(zone, 'mouseover', () => {
			this.highlightZone(zone);
		});

		google.maps.event.addListener(zone, 'mouseout', () => {
			this.removeHighlight(zone);
		});
	}

	private _initiliazeForm() {
		this.form = this.fb.group({
			name: ['Zone ' + this._zoneNumber],
			amount: [''],
			fee: ['']
		});
	}

	private _getShape() {
		if (this.selectedShapeType === 'circle') {
			return google.maps.drawing.OverlayType.CIRCLE;
		} else if (this.selectedShapeType === 'shape') {
			return google.maps.drawing.OverlayType.POLYGON;
		}
	}

	private _setupGoogleMap() {
		const optionsMap = {
			center: new google.maps.LatLng(0, 0),
			zoom: 13,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: true
		};

		this._map = new google.maps.Map(
			this.mapElement.nativeElement,
			optionsMap
		);

		google.maps.event.addListener(this._map, 'click', this._clearSelection);
	}

	setSelection(zone) {
		this._clearSelection();
		this._selectedZone = zone;
		zone.setEditable(true);
		this.highlightZone(zone);

		if (!this.isEditing && !this.selectedShapeType) {
			this._populateForm(zone);
		}
	}

	private _populateForm(zone) {
		this.isEditing = true;
		this.form.get('name').setValue(zone.properties.name);
		this.form.get('fee').setValue(zone.properties.fee);
		this.form.get('amount').setValue(zone.properties.minimumAmount);
	}

	editZone() {
		console.log(this._selectedZone);
		this._selectedZone.properties = {
			name: this.form.get('name').value,
			fee: this.form.get('fee').value,
			minimumAmount: this.form.get('amount').value
		};

		this.closeEdit();
		// Change properties; think of a way to update coordinates or something!
	}

	highlightZone(zone) {
		zone.set('fillColor', '#FF8C00');
	}

	removeHighlight(zone) {
		zone.set('fillColor', '#1E90FF');
	}

	deleteZone(zone) {
		zone.setMap(null);
		const index = this.zonesObjects.indexOf(zone);
		this.zonesObjects.splice(index, 1);
		this._zoneNumber = this.zonesObjects.length;
	}

	private _clearSelection() {
		if (this._selectedZone) {
			this.isEditing = false;
			this._selectedZone.set('fillColor', '#1E90FF');
			this._selectedZone.setEditable(false);
			this._selectedZone = null;
		} else {
			console.warn("there's no zone selected");
		}
	}

	private _listenForMapCoordinates() {
		this.mapCoordEvent
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((location) => {
				this._navigateTo(location);
				this._addMapMarker(location);
			});
	}

	private _navigateTo(
		location: google.maps.LatLng | google.maps.LatLngLiteral
	) {
		this._map.setCenter(location);
	}

	private _addMapMarker(
		location: google.maps.LatLng | google.maps.LatLngLiteral
	) {
		// TODO: Intead of adding a marker at the adress we can get just the city from coodinates
		// and set the map there, zoomed out
		// console.log(location)
		this._mapMarker = new google.maps.Marker({
			map: this._map,
			position: location
		});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
