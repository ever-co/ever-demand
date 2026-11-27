import {
	Component,
	ViewChild,
	AfterViewInit,
	OnDestroy,
	ChangeDetectionStrategy,
} from '@angular/core';
import IOrder from '@modules/server.common/interfaces/IOrder';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { AnalyticsService } from '../../../services/native/analytics.service';
import Utils from '@modules/server.common/utils';
import { CurrentPositionService } from '../../../services/native/current-position.service';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { GeoLocationService } from '../../../services/geo-location.service';
import { MapComponent } from '../common/map/map.component';
import { Router } from '@angular/router';
import { Store } from '../../../services/store.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
	standalone: false,
	selector: 'page-delivery',
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: 'delivery.html',
})
export class DeliveryPage implements AfterViewInit, OnDestroy {
	@ViewChild('map')
	carrierMap: MapComponent;

	selectedOrder: IOrder;
	carrierUserDistance: string;
	disabledButtons: boolean = true;

	private destroy$ = new Subject<void>();

	get fullAddress() {
		return this.selectedOrder.user.fullAddress;
	}

	constructor(
		private orderRouter: OrderRouter,
		private analytics: AnalyticsService,
		private geoLocationService: GeoLocationService,
		private geolocation: CurrentPositionService,
		private router: Router,
		private store: Store,
		private translate: TranslateService,
	) {}

	async delivered() {
		this.disabledButtons = true;
		if (this.selectedOrder) {
			this.router.navigateByUrl('/main/home', {
				skipLocationChange: false,
			});

			this.unselectOrder();

			await this.orderRouter.updateCarrierStatus(
				this.selectedOrder['id'],
				OrderCarrierStatus.DeliveryCompleted,
			);

			this.analytics.track('Order Delivered');
		} else {
			alert(this.translate.instant('COMMON.TRY_AGAIN'));
		}
		this.disabledButtons = false;
	}

	cancel() {
		this.disabledButtons = true;
		this.store.driveToWarehouseFrom = 'delivery';
		this.router.navigateByUrl('/main/drive-to-warehouse', {
			skipLocationChange: false,
		});
	}

	ngAfterViewInit(): void {
		this.loadData();
	}

	ionViewWillEnter() {}

	ionViewWillLeave() {}

	private unselectOrder() {
		localStorage.removeItem('orderId');
		this.store.selectedOrder = null;
	}

	private loadData() {
		this.orderRouter
			.get(localStorage.getItem('orderId'), { populateWarehouse: true })
			.pipe(takeUntil(this.destroy$))
			.subscribe(async (order) => {
				this.selectedOrder = order;
				this.store.selectedOrder = order;
				// const carrier = await this.carrierRouter
				// 	.get(order.carrierId)
				// 	.pipe(first())
				// 	.toPromise();

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

				const origin = {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				};
				const userGeo = order.user['geoLocation'];

				this.carrierUserDistance = Utils.getDistance(
					userGeo,
					dbGeoInput as GeoLocation,
				).toFixed(2);

				const destination = {
					lat: userGeo.loc.coordinates[1],
					lng: userGeo.loc.coordinates[0],
				};

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
