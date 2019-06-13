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
	@ViewChild('gmap', { static: false })
	mapElement: any;

	@Input()
	mapCoordEvent: Observable<google.maps.LatLng | google.maps.LatLngLiteral>;

	form: FormGroup;
	selectedShape: string;

	shapeReady: boolean = false;

	private _zoneNumber: number = 1; // || this.shapes.lenght(); zoneNumber++ once a zone is added!

	private _map: google.maps.Map;
	private _drawingManager: google.maps.drawing.DrawingManager;
	private _polyOptions: any = {
		strokeWeight: 0,
		fillOpacity: 0.45,
		editable: true,
		fillColor: '#1E90FF'
	};
	private _mapMarker: google.maps.Marker;
	private _selectedShapeType: any;

	private _ngDestroy$ = new Subject<void>();

	constructor(private fb: FormBuilder) {}

	ngOnInit() {
		this._setupGoogleMap();
		this._listenForMapCoordinates();
		this._initiliazeForm();
	}

	startDrawing() {
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
			(e) => {
				console.log(e);
				if (e.type !== google.maps.drawing.OverlayType.MARKER) {
					// Switch back to non-drawing mode after drawing a shape.
					this._drawingManager.setDrawingMode(null);
					// Set state to ready so the Add button is enabled
					this.shapeReady = true;

					// Add an event listener that selects the newly-drawn shape when the user
					// mouses down on it.
					const newShape = e.overlay;
					newShape.type = e.type;
					google.maps.event.addListener(newShape, 'click', () => {
						this._setSelection(newShape);
					});
					this._setSelection(newShape);
				}
			}
		);
	}

	cancel() {
		this.deleteSelectedShape();
		this.form.get('fee').setValue('');
		this.form.get('amount').setValue('');
	}

	deleteSelectedShape() {
		if (this._selectedShapeType) {
			this._selectedShapeType.setMap(null);
			this.shapeReady = false;
			this.selectedShape = null;
		}
	}

	private _initiliazeForm() {
		this.form = this.fb.group({
			name: ['Zone ' + this._zoneNumber, [Validators.required]],
			amount: ['', [Validators.required]],
			fee: ['', [Validators.required]]
		});
	}

	private _getShape() {
		if (this.selectedShape === 'circle') {
			return google.maps.drawing.OverlayType.CIRCLE;
		} else if (this.selectedShape === 'shape') {
			return google.maps.drawing.OverlayType.POLYGON;
		}
	}

	private _setupGoogleMap() {
		const optionsMap = {
			center: new google.maps.LatLng(0, 0),
			zoom: 14,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: true
		};

		this._map = new google.maps.Map(
			this.mapElement.nativeElement,
			optionsMap
		);
	}

	private _setSelection(shape) {
		this._clearSelection();
		this._selectedShapeType = shape;
		shape.setEditable(true);

		console.log(
			'here we should call the function, which populates the form'
		);
	}

	private _clearSelection() {
		if (this._selectedShapeType) {
			this._selectedShapeType.setEditable(false);
			this._selectedShapeType = null;
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
		this._clearMarker();

		this._mapMarker = new google.maps.Marker({
			map: this._map,
			position: location
		});
	}

	private _clearMarker() {
		if (this._mapMarker) {
			this._mapMarker.setMap(null);
		}
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
