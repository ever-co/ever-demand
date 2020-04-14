import {
	Component,
	Input,
	Output,
	EventEmitter,
	ViewChild,
	OnInit,
	OnDestroy,
} from '@angular/core';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import { Subject, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CarrierOrdersRouter } from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { CarriersService } from '@app/@core/data/carriers.service';
import { environment } from 'environments/environment';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { WarehousesService } from '@app/@core/data/warehouses.service';
import Carrier from '@modules/server.common/entities/Carrier';
import { ICarrierCreateObject } from '@modules/server.common/interfaces/ICarrier';
import { takeUntil } from 'rxjs/operators';

declare var google: any;
const directionsDisplay = new google.maps.DirectionsRenderer();
const directionsService = new google.maps.DirectionsService();

@Component({
	selector: 'ea-carrier-tracking',
	styleUrls: ['carrier-tracking.component.scss'],
	templateUrl: 'carrier-tracking.component.html',
})
export class CarrierTrackingComponent implements OnInit, OnDestroy {
	private ngDestroy$ = new Subject();
	public carrierId: string;

	@ViewChild('gmap', { static: true })
	gmapElement: any;
	map: google.maps.Map;
	carrierSub$: any;
	marker: any;
	userMarker: any;
	warehouseMarkers = [];
	interval: NodeJS.Timer;
	isReverted: boolean = true;
	params$: Subscription;
	selectedCarrier: Carrier;
	carriers: Carrier[] = [];
	selectedStore: Warehouse;
	filteredCarriersList: Carrier[] = [];

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private carrierRouter: CarrierRouter,
		private carrierOrdersRouter: CarrierOrdersRouter,
		private carriersService: CarriersService,
		private readonly _storesService: WarehousesService
	) {}

	ngOnInit(): void {
		this.showMap();
		this.getCarriers();
	}

	getCarriers() {
		this._storesService
			.getStores()
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((stores) => {
				this.stores = stores;
				this.carriersService
					.getAllCarriers()
					.pipe(takeUntil(this.ngDestroy$))
					.subscribe((carriers) => {
						this.carriers = carriers.filter(
							(carrier) => carrier.status === 0
						);
						this.filteredCarriersList = this.carriers;
						this.loadDataFromUrl();
					});
			});
	}

	public stores: Warehouse[] = [];
	@Output()
	selectedStoreEmitter = new EventEmitter<Warehouse>();

	selectNewStore(id) {
		this.selectedStore = this.stores.find((s) => s.id === id);
	}

	storeListener(e) {
		this.router.navigate([`carriers/track/${this.selectedStore.id}`]);
	}

	carrierListener(e) {
		if (this.selectedStore) {
			this.router.navigate([
				`carriers/track/${this.selectedStore.id}/${this.selectedCarrier.id}`,
			]);
		} else {
			this.router.navigate([
				`carriers/track/1/${this.selectedCarrier.id}`,
			]);
		}
	}

	loadDataFromUrl() {
		this.params$ = this.route.params.subscribe((res) => {
			if (!res.carrierId && res.storeId) {
				this.selectNewStore(res.storeId);
				this.filteredCarriersList = this.carriers.filter((x) =>
					this.selectedStore.usedCarriersIds.includes(x.id)
				);
				this.selectedCarrier = undefined;
				this.revertMap();
				this._subscribeCarrier(this.filteredCarriersList);
			} else if (res.carrierId) {
				this.selectNewStore(res.storeId);
				const filteredList = this.filteredCarriersList.filter(
					(carrier) => carrier._id === res.carrierId
				);
				this.selectedCarrier = filteredList[0];
				this.revertMap();
				this._subscribeCarrier(filteredList);
			} else if (!res.carrierId && !res.storeId) {
				this._subscribeCarrier(this.filteredCarriersList);
			}
		});
	}

	async _subscribeCarrier(carrierList: Carrier[]) {
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
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		};
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
	}

	addMarker(position, map, icon) {
		return new google.maps.Marker({
			position,
			map,
			icon,
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
