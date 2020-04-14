import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
} from '@angular/core';
import OrderStatus from '@modules/server.common/enums/OrderStatus';
import Order from '@modules/server.common/entities/Order';
import Warehouse from '@modules/server.common/entities/Warehouse';
import _ from 'lodash';
import { Store } from '../../../services/store.service';
import { environment } from '../../../environments/environment';
import Carrier from '@modules/server.common/entities/Carrier';
import OrderProduct from '@modules/server.common/entities/OrderProduct';
import { getCountryName } from '@modules/server.common/entities/GeoLocation';

@Component({
	selector: 'e-cu-order',
	templateUrl: 'order.component.html',
	styleUrls: ['./order.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderComponent implements OnInit {
	carrierAddress: string;
	createOrderdAt: any;
	deliveryOrderTime: any;

	customerDefaultLogo: string = environment.DEFAULT_CUSTOMER_LOGO;
	orderProductsToShow: OrderProduct[] = [];

	@Input()
	productsMaxAmountToShow: number;
	carrier: Carrier;

	@Input()
	order: Order;

	@Input()
	showDetailsButton: boolean = false;

	constructor(private readonly store: Store) {}

	get carrierId(): string {
		return this.store.carrierId;
	}

	get customerLogo() {
		return this.order.user['image'] || this.customerDefaultLogo;
	}

	get id() {
		return this.order.id;
	}

	get warehouseLogo() {
		return (this.order.warehouse as Warehouse).logo;
	}

	get warehouseName() {
		return (this.order.warehouse as Warehouse).name;
	}

	get customerBasicInfo() {
		const firstName = this.order.user.firstName;
		const lastName = this.order.user.lastName;

		return _.isEmpty(firstName) || _.isEmpty(lastName)
			? this.order.user._id
			: `${firstName} ${lastName}`;
	}

	get customerAddress() {
		const countryName = getCountryName(
			this.order.user.geoLocation.countryId
		);

		return `${countryName} ${this.order.user.geoLocation.postcode}, ${this.order.user.geoLocation.city}`;
	}

	get warehouseAddress() {
		const warehouse = this.order.warehouse as Warehouse;
		const countryName = getCountryName(warehouse.geoLocation.countryId);

		return `${countryName} ${warehouse.geoLocation.postcode}, ${warehouse.geoLocation.city}`;
	}

	get totalPrice() {
		return _.chain(this.order.products)
			.map((p) => p.count * p.price)
			.reduce((p1, p2) => p1 + p2)
			.value();
	}

	get createdAt() {
		return this.order._createdAt;
	}

	get deliveryTime() {
		const createOrderAtDate = this.order._createdAt;
		this.createOrderdAt = new Date(createOrderAtDate.toString()).getTime();
		const deliveryOrderDate =
			this.order.deliveryTime !== null
				? this.order.deliveryTime
				: this.createOrderdAt;
		this.deliveryOrderTime = new Date(deliveryOrderDate).getTime();
		const time = this.deliveryOrderTime - this.createOrderdAt;
		return this.order.deliveryTime !== undefined
			? this._millisToMinutes(time) + ' min'
			: 'In Delivery';
	}

	get statusText() {
		return this.order.getStatusText(this.store.language);
	}

	get badgeClass() {
		switch (this.order.status) {
			case OrderStatus.CanceledWhileInDelivery:
			case OrderStatus.CanceledWhileWarehousePreparation:
				return 'badge-energized';
			case OrderStatus.CarrierIssue:
			case OrderStatus.WarehouseIssue:
				return 'badge-assertive';
			default:
				return 'badge-balanced';
		}
	}

	get showMoreIcon() {
		return this.productsMaxAmountToShow < this.order.products.length;
	}

	ngOnInit() {
		this._sliceOrderProducts();
	}

	toggleOrderProducts() {
		if (this.orderProductsToShow.length > this.productsMaxAmountToShow) {
			this._sliceOrderProducts();
		} else {
			this.orderProductsToShow = this.order.products;
		}
	}

	private _sliceOrderProducts() {
		this.orderProductsToShow = this.order.products.slice(
			0,
			this.productsMaxAmountToShow
		);
	}

	private _millisToMinutes(ms) {
		const minutes = Math.floor(ms / 60000);
		const seconds = ((ms % 60000) / 1000).toFixed(0);
		return minutes + ':' + (+seconds < 10 ? '0' : '') + seconds;
	}
}
