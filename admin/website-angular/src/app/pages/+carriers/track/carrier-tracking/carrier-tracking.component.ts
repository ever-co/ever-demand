import {
	Component,
	Input,
	Output,
	EventEmitter,
	ViewChild,
	OnInit,
	OnDestroy
} from '@angular/core';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CarrierOrdersRouter } from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { CarriersService } from 'app/@core/data/carriers.service';
import { environment } from 'environments/environment';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { WarehousesService } from 'app/@core/data/warehouses.service';
import Carrier from '@modules/server.common/entities/Carrier';
import { ICarrierCreateObject } from '@modules/server.common/interfaces/ICarrier';

declare var google: any;
const directionsDisplay = new google.maps.DirectionsRenderer();
const directionsService = new google.maps.DirectionsService();

@Component({
	selector: 'ea-carrier-tracking',
	styleUrls: ['carrier-tracking.component.scss'],
	templateUrl: 'carrier-tracking.component.html'
})
export class CarrierTrackingComponent implements OnInit, OnDestroy {
	private ngDestroy$ = new Subject();
	public carrierId: string;

	@ViewChild('gmap')
	gmapElement: any;
	map: google.maps.Map;
	carrierSub$: any;
	marker: any;
	userMarker: any;
	warehouseMarkers = [];
	interval: NodeJS.Timer;
	isReverted: boolean = true;
	params$: any;
	selectedCarrierName: string;
	selectedCarrier: Carrier;
	hasFilteredByMerchant = false;
	carriers: Carrier[] = [];
	selectedStore: Warehouse;
	selectedStoreId: string;
	filteredCarriersList: Carrier[] = [];

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private carrierRouter: CarrierRouter,
		private carrierOrdersRouter: CarrierOrdersRouter,
		private carriersService: CarriersService,
		private readonly _storesService: WarehousesService
	) {
		this._listenTotalStores();
	}

	ngOnInit(): void {
		this.showMap();
		this.getCarriers();
	}

	getCarriers() {
		this.carriersService.getAllCarriers().subscribe((carriers) => {
			this.carriers = carriers.filter((carrier) => carrier.status === 0);
			this._subscribeCarrier(this.carriers);
			this.filteredCarriersList = this.carriers;
		});
	}
	public stores: Warehouse[] = [];
	@Output()
	selectedStoreEmitter = new EventEmitter<Warehouse>();
	selectNewStore(ev) {
		let storeId;
		if (ev) {
			storeId = ev.id;
			this.selectedStore = this.stores.find((s) => s.id === storeId);
			this.filterCarriers();
		} else {
			this.selectedStore = null;
		}
	}
	urlChanger(e) {
		//	this.router.navigate([`carriers/track/${this.selectedStore.id}`]);
	}
	filterCarriers() {
		this.revertMap();
		this.filteredCarriersList = this.carriers.filter((x) =>
			this.selectedStore.usedCarriersIds.includes(x.id)
		);
		this.hasFilteredByMerchant = true;
		this.selectedCarrierName = undefined;
		this._subscribeCarrier(this.filteredCarriersList);
	}
	filterByCarrierId() {
		if (this.selectedCarrierName !== undefined) {
			this.revertMap();

			const FilteredList = this.filteredCarriersList.filter(
				(x) => x.fullName === this.selectedCarrierName
			);
			this.selectedCarrier = FilteredList[0];
			this._subscribeCarrier(FilteredList);
		}
	}

	async _subscribeCarrier(carrierList: any[]) {
		this.params$ = this.route.params.subscribe((res) => {
			this.selectedStoreId = res.id;
			const idArray = carrierList.map((carrier) => carrier._id);
			idArray.forEach((c) => {
				const carrierId = c.toString();
				this.carrierSub$ = this.carrierRouter
					.get(carrierId)
					.subscribe(async (carrier) => {
						if (this.interval) {
							clearInterval(this.interval);
						}
						const newCoordinates = new google.maps.LatLng(
							carrier.geoLocation.coordinates.lat,
							carrier.geoLocation.coordinates.lng
						);
						this.map.setCenter(newCoordinates);
						const carierIcon = environment.MAP_CARRIER_ICON_LINK;

						const marker = this.addMarker(
							newCoordinates,
							this.map,
							carierIcon
						);
						this.warehouseMarkers.push(marker);
					});
			});
		});
	}

	revertMap() {
		if (this.warehouseMarkers.length > 0) {
			this.warehouseMarkers.forEach((x) => {
				x.setMap(null);
			});
			this.warehouseMarkers = [];
		}
	}

	showMap() {
		const mapProp = {
			center: new google.maps.LatLng(42.642941, 23.334149),
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
	}

	addMarker(position, map, icon) {
		return new google.maps.Marker({
			position,
			map,
			icon
		});
	}

	private _listenTotalStores() {
		this._storesService
			.getStores()
			.takeUntil(this.ngDestroy$)
			.subscribe((stores) => {
				this.stores = stores;
			});
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
		this.carriers = [];

		if (this.interval) {
			clearInterval(this.interval);
		}

		if (this.carrierSub$) {
			this.carrierSub$.unsubscribe();
		}

		if (this.params$) {
			this.params$.unsubscribe();
		}
	}
}
