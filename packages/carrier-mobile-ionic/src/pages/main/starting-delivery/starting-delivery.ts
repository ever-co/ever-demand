import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MapComponent } from '../common/map/map.component';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import IOrder from '@modules/server.common/interfaces/IOrder';
import { Router } from '@angular/router';
import { first, takeUntil } from 'rxjs/operators';
import { GeoLocationService } from 'services/geo-location.service';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import Utils from '@modules/server.common/utils';
import { CarrierOrdersRouter } from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { Store } from 'services/store.service';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { Subject } from 'rxjs';

@Component({
	selector: 'page-starting-delivery',
	templateUrl: 'starting-delivery.html',
})
export class StartingDeliveryPage implements AfterViewInit, OnDestroy {
	@ViewChild('map')
	carrierMap: MapComponent;

	selectedOrder: IOrder;
	carrierUserDistance: string;
	disabledButtons: boolean = true;

	private destroy$ = new Subject<void>();

	constructor(
		private orderRouter: OrderRouter,
		private carrierOrdersRouter: CarrierOrdersRouter,
		private geoLocationService: GeoLocationService,
		private geolocation: Geolocation,
		private router: Router,
		private store: Store
	) {}

	ngAfterViewInit(): void {
		this.loadData();
	}

	ionViewWillEnter() {
		this.loadData();
	}

	async startDelivery() {
		this.disabledButtons = true;
		await this.carrierOrdersRouter.updateStatus(
			this.store.carrierId,
			OrderCarrierStatus.CarrierStartDelivery
		);

		this.router.navigateByUrl('/main/delivery', {
			skipLocationChange: false,
		});
		this.disabledButtons = false;
	}

	returnProduct() {
		this.disabledButtons = true;
		this.store.returnProductFrom = 'startingDelivery';

		this.router.navigateByUrl('/product/return', {
			skipLocationChange: false,
		});
		this.disabledButtons = false;
	}

	private loadData() {
		this.orderRouter
			.get(localStorage.getItem('orderId'), { populateWarehouse: true })
			.pipe(takeUntil(this.destroy$))
			.subscribe(async (order) => {
				this.selectedOrder = order;
				this.store.selectedOrder = order;

				const position = this.geoLocationService.defaultLocation()
					? this.geoLocationService.defaultLocation()
					: await this.geolocation.getCurrentPosition();

				// MongoDb store coordinates lng => lat
				const dbGeoInput = {
					loc: {
						type: 'Point',
						coordinates: [
							position.coords.longitude,
							position.coords.latitude,
						],
					},
				} as IGeoLocation;

				const origin = new google.maps.LatLng(
					position.coords.latitude,
					position.coords.longitude
				);

				const userGeo = this.selectedOrder.user['geoLocation'];

				this.carrierUserDistance = Utils.getDistance(
					userGeo as GeoLocation,
					dbGeoInput as GeoLocation
				).toFixed(2);

				const destination = new google.maps.LatLng(
					userGeo.loc.coordinates[1],
					userGeo.loc.coordinates[0]
				);

				this.carrierMap.setCenter(origin);
				this.carrierMap.drawRoute(origin, destination);

				this.disabledButtons = false;
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
