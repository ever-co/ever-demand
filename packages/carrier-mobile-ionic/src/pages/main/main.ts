import {
	Component,
	ViewChild,
	ElementRef,
	OnInit,
	OnDestroy,
} from '@angular/core';

import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import CarrierStatus from '@modules/server.common/enums/CarrierStatus';
import { generateObjectIdString } from '@modules/server.common/utils';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { Store } from '../../services/store.service';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import { GeoLocationService } from '../../services/geo-location.service';
import { Platform } from '@ionic/angular';
import IOrder from '@modules/server.common/interfaces/IOrder';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'page-main',
	templateUrl: 'main.html',
	styleUrls: ['main.scss'],
})
export class MainPage implements OnInit, OnDestroy {
	selectedOrder: IOrder;

	private watch: any;
	private isOnline: boolean;
	private isMapRendered: boolean;
	private destroy$ = new Subject<void>();

	constructor(
		private platform: Platform,
		private carrierRouter: CarrierRouter,
		private geolocation: Geolocation,
		private geoLocationService: GeoLocationService,
		private store: Store
	) {}

	ngOnInit(): void {
		this.platform.ready().then(() => {
			console.warn('MainPage Loaded');
			this.watchLocation();
			this.watchOrderStatus();
		});
	}

	watchLocation() {
		setInterval(() => {
			if (this.isOnline) {
				const carrier$ = this.carrierRouter
					.get(this.store.carrierId)
					.pipe(takeUntil(this.destroy$))
					.subscribe(async (carrier) => {
						if (carrier.status === CarrierStatus.Online) {
							this.geolocation
								.getCurrentPosition()
								.then((position) => {
									const carrierLong =
										carrier.geoLocation.coordinates.lng;
									const carrierLat =
										carrier.geoLocation.coordinates.lat;

									const currentLong =
										position.coords.longitude;
									const currentLat = position.coords.latitude;

									if (
										carrierLong !== currentLong ||
										carrierLat !== currentLat
									) {
										this.carrierRouter
											.updateGeoLocation(
												carrier.id,
												new GeoLocation({
													_createdAt: new Date().toString(),
													_updatedAt: new Date().toString(),
													_id: generateObjectIdString(),
													city:
														carrier.geoLocation
															.city,
													countryId:
														carrier.geoLocation
															.countryId,
													streetAddress:
														carrier.geoLocation
															.streetAddress,
													house:
														carrier.geoLocation
															.house,
													postcode: carrier
														.geoLocation.postcode
														? carrier.geoLocation
																.postcode
														: '',
													loc: {
														type: 'Point',
														coordinates: [
															currentLong,
															currentLat,
														],
													},
												})
											)
											.then(() => {
												console.log(
													'User location updated.'
												);
												carrier$.unsubscribe();
											});
									} else {
										carrier$.unsubscribe();
									}
								})
								.catch((error) => {
									console.log(
										'Error getting location',
										error
									);
									carrier$.unsubscribe();
								});
						}
					});
			}
		}, 3000);
	}

	watchOrderStatus() {
		this.store.selectedOrder$
			.pipe(takeUntil(this.destroy$))
			.subscribe((o) => (this.selectedOrder = o));
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
