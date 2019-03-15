import {
	Component,
	ViewChild,
	ElementRef,
	OnDestroy,
	OnInit
} from '@angular/core';

import Carrier from '@modules/server.common/entities/Carrier';
import { CarrierService } from '../../../src/services/carrier.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { WarehouseCarriersRouter } from '@modules/client.common.angular2/routers/warehouse-carriers-router.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { IonicSelectableComponent } from 'ionic-selectable';
import { ActivatedRoute, Router } from '@angular/router';
import { WarehousesService } from 'services/warehouses.service';

declare var google: any;

@Component({
	selector: 'page-track',
	templateUrl: 'track.html',
	styleUrls: ['./track.scss']
})
export class TrackPage implements OnInit, OnDestroy {
	@ViewChild('gmap')
	gmapElement: ElementRef;
	map: google.maps.Map;

	selectedCarrier: Carrier;
	private carriers: Carrier[];
	private carriers$: Subscription;
	private warehouse$: Subscription;
	private params$: Subscription;
	private warehouseCoordinates: any;
	private _ngDestroy$ = new Subject<void>();
	@ViewChild('filterComponent') filterComponent: IonicSelectableComponent;

	constructor(
		private carrierService: CarrierService,
		private route: ActivatedRoute,
		private router: Router,
		private warehouseService: WarehousesService
	) {}

	openModal() {
		this.filterComponent.close();
	}

	navigationHandler(event: {
		component: IonicSelectableComponent;
		value: any;
	}) {
		this.carriers$.unsubscribe();
		this.params$.unsubscribe();
		this.warehouse$.unsubscribe();
		this.router.navigate([`track/${event.value.id}`]);
	}

	ngOnInit(): void {
		this.warehouse$ = this.warehouseService
			.getStoreById(this.warehouseId)
			.subscribe((warehouse) => {
				this.warehouseCoordinates = {
					lat: warehouse.geoLocation.loc.coordinates[1],
					lng: warehouse.geoLocation.loc.coordinates[0]
				};

				this.carriers$ = this.carrierService
					.getAllCarriers()
					.subscribe((carriers) => {
						this.carriers = carriers.filter(
							(car) =>
								car.status === 0 &&
								warehouse.usedCarriersIds.includes(car.id)
						);
						this.params$ = this.route.params.subscribe((res) => {
							if (res.id) {
								const selected = this.carriers.filter(
									(car) => car.id === res.id
								)[0];
								this.loadMap([selected]);
							} else {
								this.loadMap(this.carriers);
							}
						});
					});
			});
	}

	get warehouseId() {
		return localStorage.getItem('_warehouseId');
	}

	async loadMap(carriers: Carrier[]) {
		const mapProp = {
			center: new google.maps.LatLng(42.6559136, 23.358273599999997),
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		const storeIcon = 'http://maps.google.com/mapfiles/kml/pal3/icon21.png';

		const userIcon = 'http://maps.google.com/mapfiles/kml/pal3/icon48.png';

		const carrierIcon =
			'http://maps.google.com/mapfiles/kml/pal4/icon54.png';

		const routeCoordinates = [];
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
		carriers.forEach(async (carrier) => {
			const mylatLng = {
				lat: carrier.geoLocation.loc.coordinates[1],
				lng: carrier.geoLocation.loc.coordinates[0]
			};
			const order = await await this.carrierService.getCarrierCurrentOrder(
				carrier.id
			);
			this.addMarker(this.warehouseCoordinates, this.map, storeIcon);

			if (order) {
				this.addMarker(
					{
						lat: order.user.geoLocation.loc.coordinates[1],
						lng: order.user.geoLocation.loc.coordinates[0]
					},
					this.map,
					userIcon
				);
				const request = {
					origin: new google.maps.LatLng(
						carrier.geoLocation.loc.coordinates[1],
						carrier.geoLocation.loc.coordinates[0]
					),
					destination: new google.maps.LatLng(
						order.user.geoLocation.loc.coordinates[1],
						order.user.geoLocation.loc.coordinates[0]
					),
					travelMode: 'DRIVING'
				};
				routeCoordinates.push(request);
				const directionsDisplay = new google.maps.DirectionsRenderer();
				const directionsService = new google.maps.DirectionsService();
				directionsService.route(request, function(res, stat) {
					if (stat === 'OK') {
						directionsDisplay.setDirections(res);
					}
				});

				directionsDisplay.setOptions({
					suppressMarkers: true
				});

				directionsDisplay.setMap(this.map);
			}

			this.addMarker(mylatLng, this.map, carrierIcon);
		});
	}

	addMarker(
		position: { lat: number; lng: number },
		map: google.maps.Map,
		icon: string
	) {
		return new google.maps.Marker({
			position,
			map,
			icon
		});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
		if (this.carriers$) {
			this.carriers$.unsubscribe();
		}
		if (this.params$) {
			this.params$.unsubscribe();
		}
	}
}
