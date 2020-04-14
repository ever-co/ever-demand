import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, takeUntil, first } from 'rxjs/operators';
import Order from '@modules/server.common/entities/Order';
import { Subject } from 'rxjs';
import Warehouse from '@modules/server.common/entities/Warehouse';
import User from '@modules/server.common/entities/User';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import Carrier from '@modules/server.common/entities/Carrier';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderProduct from '@modules/server.common/entities/OrderProduct';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { TranslateService } from '@ngx-translate/core';
import { getIdFromTheDate } from '@modules/server.common/utils';

const service = new google.maps.DistanceMatrixService();

@Component({
	selector: 'ea-order',
	templateUrl: './order.component.html',
	styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnDestroy {
	public orderId: string;
	public order$;
	public distance: string;

	public PREFIX: string = 'ORDER_VIEW.ORDER_SIDEBAR.';
	public WAREHOUSE_TITLE: string = 'WAREHOUSE';
	public CUSTOMER_TITLE: string = 'CUSTOMER';
	public CARRIER_TITLE: string = 'CARRIER';

	private ngDestroy$ = new Subject();

	constructor(
		private readonly _router: ActivatedRoute,
		private readonly orderRouter: OrderRouter,
		private readonly translateService: TranslateService
	) {
		this.order$ = this._router.params.pipe(
			switchMap((params) => {
				return this.orderRouter.get(params.id, {
					populateWarehouse: true,
					populateCarrier: true,
				});
			}),
			takeUntil(this.ngDestroy$)
		);
	}

	get titleWarehouse() {
		const titleForTr = this.PREFIX + this.WAREHOUSE_TITLE;
		return this._translate(titleForTr);
	}

	get titleCustomer() {
		const titleForTr = this.PREFIX + this.CUSTOMER_TITLE;
		return this._translate(titleForTr);
	}

	get titleCarrier() {
		const titleForTr = this.PREFIX + this.CARRIER_TITLE;
		return this._translate(titleForTr);
	}

	getTotalPrice(order) {
		if (order && order.products.length > 0) {
			return order.products
				.map((p: OrderProduct) => p.price * p.count)
				.reduce((a, b) => a + b, 0);
		} else {
			return 0;
		}
	}

	getWarehouseContactDetails(warehouse: Warehouse) {
		const details = [];
		if (warehouse) {
			details.push(warehouse.name);
			details.push(warehouse.contactPhone);
			details.push(warehouse.contactEmail);
		}
		if (warehouse.geoLocation) {
			details.push(this.getFullAddress(warehouse.geoLocation));
		}
		return details.filter((d) => d);
	}

	getCustomerContactDetails(user: User) {
		const details = [];
		if (user) {
			let name = '';
			if (user.firstName) {
				name += user.firstName;
			}
			if (user.lastName) {
				name += ' ' + user.lastName;
			}
			details.push(name);
			details.push(user.phone);
			details.push(user.email);
		}
		if (user.geoLocation) {
			details.push(user.fullAddress);
		}
		return details.filter((d) => d);
	}

	getCarrierContactDetails(carrier: Carrier) {
		const details = [];
		if (carrier) {
			details.push(
				carrier.firstName
					? carrier.firstName + ' ' + carrier.lastName
					: carrier.username
			);
			details.push(carrier.phone);
		}
		if (carrier.geoLocation) {
			details.push(this.getFullAddress(carrier.geoLocation));
		}
		return details.filter((d) => d);
	}

	getOrderName(order: Order) {
		if (order) {
			return getIdFromTheDate(order);
		}
	}

	isCarrierCurrent(order) {
		return (
			order.carrierStatus >= OrderCarrierStatus.CarrierPickedUpOrder &&
			!order['isCompleted']
		);
	}

	getDistance(geoLocation1: GeoLocation, geoLocation2: GeoLocation) {
		if (!this.distance && geoLocation1 && geoLocation2) {
			this.distance = '0';
			service.getDistanceMatrix(
				{
					origins: [
						new google.maps.LatLng(
							geoLocation1.coordinates.lat,
							geoLocation1.coordinates.lng
						),
					],
					destinations: [
						new google.maps.LatLng(
							geoLocation2.coordinates.lat,
							geoLocation2.coordinates.lng
						),
					],
					travelMode: google.maps.TravelMode.DRIVING,
					unitSystem: google.maps.UnitSystem.METRIC,
					avoidHighways: false,
					avoidTolls: false,
				},
				(response, status) => {
					if (status === google.maps.DistanceMatrixStatus.OK) {
						this.distance =
							response.rows[0].elements[0].distance['text'];
					}
				}
			);
		}

		return this.distance;
	}

	private getFullAddress(geoLocation: GeoLocation) {
		return (
			`${geoLocation.city}, ${geoLocation.streetAddress} ` +
			`${geoLocation.house}`
		);
	}

	private _translate(key: string): string {
		let translationResult = '';

		this.translateService.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
