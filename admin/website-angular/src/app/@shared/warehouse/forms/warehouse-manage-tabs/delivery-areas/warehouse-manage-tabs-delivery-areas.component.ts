import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup, FormBuilder } from '@angular/forms';

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

	@Input()
	form: FormGroup;

	deliverForm: FormGroup;
	selectedShapeType: string;
	zonesData: any[] = []; // Used to be parsed to GeoJSON and sent to the database.
	// This will be dinamicly created when getting/adding/removing data

	// containing all shape objects with all properties
	zonesObjects: any[] = [];

	// Used to disable Add button, form and show the text to draw
	shapeReady: boolean = false;

	// Used to know when we're editing a zone
	isEditing: boolean = false;

	private _zoneNumber;

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

	private _ngDestroy$ = new Subject<void>();

	constructor(private fb: FormBuilder) {}

	ngOnInit() {
		this._setupGoogleMap();
		this._listenForMapCoordinates();
		this._initiliazeForm();
	}

	static buildForm(formBuilder: FormBuilder): FormGroup {
		// would be used in the parent component and injected into this.form
		return formBuilder.group({
			deliveryAreas: ''
		});
	}

	get deliveryZones() {
		return this.form.get('deliveryAreas').value;
	}

	set deliveryZones(zonesData) {
		this.form.get('deliveryAreas').setValue(zonesData);
	}

	testValues() {
		console.log('zoneObjects \r\n', this.zonesObjects);
		console.log('zoneData \r\n', this.zonesData);

		console.log('getGEOJSOn \r\n', this.getZonesGeoJSON());
	}

	getValue(): any {
		// add type
		return;
	}

	setValue(data) {
		// add type
		data.features.forEach((feature) => {
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

				/*

				this.zonesData.push({
					fee: feature.properties.fee,
					minimumAmount: feature.properties.minimumAmount,
					name: feature.properties.name,
					radius: feature.properties.radius,
					x: +feature.geometry.coordinates[1],
					y: +feature.geometry.coordinates[0]
				});

				*/
			} else {
				const polygon = new google.maps.Polygon({
					strokeWeight: 0.5,
					fillOpacity: 0.45,
					fillColor: '#1E90FF',
					paths: this._mapCoordinates(feature.geometry.coordinates)
				});

				polygon['properties'] = feature.properties;

				polygon.setMap(this._map);

				this._addZoneEventListeners(polygon);

				this.zonesObjects.push(polygon);

				/*

				this.zonesData.push({
					fee: feature.properties.fee,
					minimumAmount: feature.properties.minimumAmount,
					name: feature.properties.name,
					polygon: [...feature.geometry.coordinates[0]]
				});

				*/
			}
		});

		this._zoneNumber = data.features.length;
		this.deliveryZones = data;
	}

	getZonesGeoJSON() {
		const geoJSON = {
			type: 'FeatureCollection',
			features: []
		};

		const features = [];

		this.zonesObjects.forEach((o) => {
			if (o.type === 'circle') {
				const tempObj = {};

				const coordsArr = o
					.getCenter()
					.toUrlValue(7)
					.split(',');

				tempObj['properties'] = o.properties;
				tempObj['properties']['radius'] = o.radius;
				tempObj['type'] = 'Feature';
				tempObj['geometry'] = {
					type: 'Point',
					coodinates: [coordsArr[1], coordsArr[0]]
				};

				features.push(tempObj);
			} else {
				const tempObj = {};

				const coordinates = [[]];

				o.getPath().forEach((point) => {
					const mappedCoordinates = point
						.toUrlValue(7)
						.split(',')
						.map((p) => +p);

					coordinates[0].push(mappedCoordinates);
				});

				tempObj['properties'] = o.properties;
				tempObj['type'] = 'Feature';
				tempObj['geometry'] = {
					type: 'Polygon',
					coordinates
				};

				features.push(tempObj);
			}
		});

		geoJSON.features = features;

		return geoJSON;
	}

	addZone() {
		if (this.shapeReady && this.deliverForm.status === 'VALID') {
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
					name: this.deliverForm.get('name').value,
					minimumAmount: this.deliverForm.get('amount').value,
					fee: this.deliverForm.get('fee').value
				});

				this._selectedZone.properties = {
					name: this.deliverForm.get('name').value,
					minimumAmount: this.deliverForm.get('amount').value,
					fee: this.deliverForm.get('fee').value
				};

				this.zonesObjects.push(this._selectedZone);
			} else {
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
					name: this.deliverForm.get('name').value,
					minimumAmount: this.deliverForm.get('amount').value,
					fee: this.deliverForm.get('fee').value
				});

				this._selectedZone.properties = {
					name: this.deliverForm.get('name').value,
					minimumAmount: this.deliverForm.get('amount').value,
					fee: this.deliverForm.get('fee').value
				};

				this.zonesObjects.push(this._selectedZone);
			}

			console.log(this.zonesObjects);

			this._clearSelection();
			this._zoneNumber++;
			this.selectedShapeType = null;
			this._selectedZone = null;
			this.shapeReady = false;

			this.deliverForm
				.get('name')
				.setValue('Zone ' + this._zoneNumber || 0);
			this.deliverForm.get('fee').setValue('');
			this.deliverForm.get('amount').setValue('');
		}
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
		this.deliverForm.get('fee').setValue('');
		this.deliverForm.get('amount').setValue('');
		this.deliverForm.get('name').setValue('Zone ' + this._zoneNumber);
	}

	closeEdit() {
		this.isEditing = false;
		this._clearSelection();
		this.deliverForm.get('fee').setValue('');
		this.deliverForm.get('amount').setValue('');
		this.deliverForm.get('name').setValue('Zone ' + this._zoneNumber);
	}

	deleteSelectedShape() {
		if (this._selectedZone) {
			this._selectedZone.setMap(null);
			this.shapeReady = false;
			this.selectedShapeType = null;
		}
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

	editZone() {
		console.log(this._selectedZone);
		this._selectedZone.properties = {
			name: this.deliverForm.get('name').value,
			fee: this.deliverForm.get('fee').value,
			minimumAmount: this.deliverForm.get('amount').value
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
		this.deliverForm = this.fb.group({
			name: ['Zone ' + this._zoneNumber || 0],
			amount: '',
			fee: ''
		});
	}

	private _getShape() {
		if (this.selectedShapeType === 'circle') {
			return google.maps.drawing.OverlayType.CIRCLE;
		} else if (this.selectedShapeType === 'shape') {
			return google.maps.drawing.OverlayType.POLYGON;
		}
	}

	private _populateForm(zone) {
		this.isEditing = true;
		this.deliverForm.get('name').setValue(zone.properties.name);
		this.deliverForm.get('fee').setValue(zone.properties.fee);
		this.deliverForm.get('amount').setValue(zone.properties.minimumAmount);
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
				this._map.setCenter(location);

				this._mapMarker = new google.maps.Marker({
					map: this._map,
					position: location
				});
			});
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

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
