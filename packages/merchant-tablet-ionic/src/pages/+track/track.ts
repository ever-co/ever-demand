import {
	Component,
	ViewChild,
	ElementRef,
	OnDestroy,
	OnInit,
} from '@angular/core';

import Carrier from '@modules/server.common/entities/Carrier';
import { CarrierService } from '../../../src/services/carrier.service';
import { Subject, Subscription } from 'rxjs';
import { IonicSelectableComponent } from 'ionic-selectable';
import { ActivatedRoute, Router } from '@angular/router';
import { WarehousesService } from 'services/warehouses.service';
import { WarehouseOrdersService } from '../../services/warehouse-orders.service';

declare var google: any;

@Component({
	selector: 'page-track',
	templateUrl: 'track.html',
	styleUrls: ['./track.scss'],
})
export class TrackPage implements OnInit, OnDestroy {
	private carriersOnDisplay: Carrier[];
	private carriers$: Subscription;
	private warehouse$: Subscription;
	private params$: Subscription;
	private warehouseCoordinates: any;
	private orders$: Subscription;
	private _ngDestroy$ = new Subject<void>();

	map: google.maps.Map;
	selectedCarrier: Carrier;
	carriers: Carrier[];
	markers: google.maps.Marker[] = [];
	totalDeliveries = 0;
	totalCarriers = 0;
	totalActiveCarriers = 0;
	showAssignedOnly = true;
	showActiveOnly = true;
	showCheckboxFilters = true;
	loadingMap = false;
	listOfOrders: any;
	storeIcon = 'http://maps.google.com/mapfiles/kml/pal3/icon21.png';
	sharedCarrierIcon = 'http://maps.google.com/mapfiles/kml/pal4/icon23.png';
	userIcon = 'http://maps.google.com/mapfiles/kml/pal3/icon48.png';
	carrierIcon = 'http://maps.google.com/mapfiles/kml/pal4/icon54.png';
	carrierListDropdown: Carrier[];
	sharedCarrierListId: string[];

	@ViewChild('gmap', { static: true })
	gmapElement: ElementRef;

	@ViewChild('filterComponent', { static: true })
	filterComponent: IonicSelectableComponent;

	constructor(
		private carrierService: CarrierService,
		private route: ActivatedRoute,
		private router: Router,
		private warehouseService: WarehousesService,
		private warehouseOrderService: WarehouseOrdersService
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
			.getAllStores()
			.subscribe((warehouse) => {
				const currentWarehouse = warehouse.find(
					(wh) => wh.id === this.warehouseId
				);
				const allAssignedCarriers = warehouse
					.filter((wh) => wh.id !== this.warehouseId)
					.map((wh) => wh.usedCarriersIds);

				this.warehouseCoordinates = {
					lat: currentWarehouse.geoLocation.loc.coordinates[1],
					lng: currentWarehouse.geoLocation.loc.coordinates[0],
				};
				this.totalCarriers = currentWarehouse.usedCarriersIds.length;
				this.carriers$ = this.carrierService
					.getAllCarriers()
					.subscribe((carriers) => {
						this.loadGoogleMaps();
						this.carriers = carriers.filter((car) => {
							if (
								currentWarehouse.usedCarriersIds.includes(
									car.id
								)
							) {
								car.shared = false;
								return true;
							} else {
								if (
									allAssignedCarriers.every(
										(arr) => !arr.includes(car.id)
									)
								) {
									car.shared = true;
									return true;
								} else {
									return false;
								}
							}
						});
						let total = 0;

						this.carriers.forEach((car) => {
							total += car.numberOfDeliveries;
						});

						this.totalDeliveries = total;

						this.params$ = this.route.params.subscribe((res) => {
							this.totalActiveCarriers = this.carriers.filter(
								(car) => car.status === 0
							).length;

							if (res.id) {
								this.selectedCarrier = this.carriers.filter(
									(car) => car.id === res.id
								)[0];
								this.showCheckboxFilters = false;
								this.carriersOnDisplay = [this.selectedCarrier];
								this.renderCarriers([this.selectedCarrier]);
							} else {
								this.filterDisplayedCarriers();
								this.renderCarriers(this.carriersOnDisplay);
							}
						});
					});
			});
	}

	get warehouseId() {
		return localStorage.getItem('_warehouseId');
	}

	drawOrderRoutes() {
		this.warehouseOrderService
			.getOrdersInDelivery(this.warehouseId)
			.then((orderList) => {
				this.listOfOrders = orderList;
				this.listOfOrders.forEach((order) => {
					const carrier = this.carriersOnDisplay.find(
						(x) => x.id === order.carrier.id
					);

					if (carrier && carrier.shared) {
						this.addMarker(
							{
								lat:
									order.carrier.geoLocation.loc
										.coordinates[1],
								lng:
									order.carrier.geoLocation.loc
										.coordinates[0],
							},
							this.map,
							this.sharedCarrierIcon
						);
					}

					const carriersWithOrders = orderList.map(
						(o) => o.carrier.id
					);
					this.carriers = this.carriers.filter((car) => {
						if (
							!carriersWithOrders.includes(car.id) &&
							car.shared
						) {
							return false;
						} else {
							return true;
						}
					});
					this.carrierListDropdown = this.carriers;

					if (
						this.carriersOnDisplay
							.map((car) => car.id)
							.includes(order.carrier.id)
					) {
						this.addMarker(
							{
								lat: order.user.geoLocation.loc.coordinates[1],
								lng: order.user.geoLocation.loc.coordinates[0],
							},
							this.map,
							this.userIcon
						);

						const request = {
							origin: new google.maps.LatLng(
								order.carrier.geoLocation.loc.coordinates[1],
								order.carrier.geoLocation.loc.coordinates[0]
							),
							destination: new google.maps.LatLng(
								order.user.geoLocation.loc.coordinates[1],
								order.user.geoLocation.loc.coordinates[0]
							),
							travelMode: 'DRIVING',
						};
						const directionsDisplay = new google.maps.DirectionsRenderer(
							{
								polylineOptions: {
									strokeColor: `hsl(${Math.floor(
										Math.random() * 320
									)},100%,50%)`,
								},
							}
						);
						const directionsService = new google.maps.DirectionsService();
						directionsService.route(request, function (res, stat) {
							if (stat === 'OK') {
								directionsDisplay.setDirections(res);
							}
						});

						directionsDisplay.setOptions({
							suppressMarkers: true,
						});

						directionsDisplay.setMap(this.map);
					}
				});
			});
	}

	renderCarriers(carriers: Carrier[]) {
		if (this.markers.length > 0) {
			this.markers.forEach((m) => {
				m.setMap(null);
			});
			this.markers = [];
		}
		carriers.forEach((carrier) => {
			const mylatLng = {
				lat: carrier.geoLocation.loc.coordinates[1],
				lng: carrier.geoLocation.loc.coordinates[0],
			};
			this.addMarker(this.warehouseCoordinates, this.map, this.storeIcon);

			if (!carrier.shared) {
				this.addMarker(mylatLng, this.map, this.carrierIcon);
			}
		});
		this.drawOrderRoutes();
	}

	filterDisplayedCarriers() {
		let filteredCarriers = this.carriers;
		if (this.showActiveOnly && this.carriers.length > 1) {
			filteredCarriers = filteredCarriers.filter(
				(car) => car.status === 0
			);
		}

		if (this.showAssignedOnly && this.carriers.length > 1) {
			filteredCarriers = filteredCarriers.filter(
				(car) => car.shared === false
			);
		}
		this.carrierListDropdown = filteredCarriers;
		this.carriersOnDisplay = filteredCarriers;
	}

	loadGoogleMaps() {
		this.loadingMap = true;
		const initialCoords = new google.maps.LatLng(42.7089136, 23.3702736);

		const mapProp = {
			center: initialCoords,
			zoom: 13,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		};

		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
		this.loadingMap = false;
	}

	addMarker(
		position: { lat: number; lng: number },
		map: google.maps.Map,
		icon: string
	) {
		const marker = new google.maps.Marker({
			position,
			map,
			icon,
		});
		this.markers.push(marker);
	}

	refreshMap() {
		this.filterDisplayedCarriers();
		this.renderCarriers(this.carriersOnDisplay);
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
