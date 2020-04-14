import _ from 'lodash';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { ICarrierCreateObject } from '@modules/server.common/interfaces/ICarrier';
import { ICarrierOrdersRouterGetOptions } from '@modules/server.common/routers/ICarrierOrdersRouter';
import Order from '@modules/server.common/entities/Order';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import Carrier from '@modules/server.common/entities/Carrier';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from 'angular2-toaster';
import { first } from 'rxjs/operators';
import { CarriersService } from '../../../@core/data/carriers.service';
import CarrierStatus from '@modules/server.common/enums/CarrierStatus';
import { CarrierOrdersComponent } from './carrier-orders/carrier-orders.component';

@Component({
	selector: 'ea-carrier',
	templateUrl: './carrier.component.html',
	styleUrls: ['./carrier.component.scss'],
})
export class CarrierComponent implements OnInit, OnDestroy {
	@ViewChild('carrierOrders', { static: true })
	public carrierOrders: CarrierOrdersComponent;

	private ngDestroy$ = new Subject();

	public carriers: ICarrierCreateObject[];
	protected selectedOrder: Order;

	carrierOrderOptions: ICarrierOrdersRouterGetOptions;

	public selectedOrdersId: string[] = [];

	private inDeliveryOrders: Order[] = [];
	private closeOrders: Order[] = [];

	protected selectedCarrier: ICarrierCreateObject;
	private carriers$: any;
	private currentTab: string;

	get showOrderStatus() {
		return (
			this.selectedOrder &&
			this.selectedOrder.carrierStatus <
				OrderCarrierStatus.CarrierPickedUpOrder &&
			this.selectedCarrier &&
			this.selectedCarrier.status === CarrierStatus.Online
		);
	}

	constructor(
		private readonly _route: ActivatedRoute,
		private readonly _router: Router,
		private readonly _toasterService: ToasterService,
		private carriersService: CarriersService
	) {}

	ngOnInit() {
		this.getAllCarriers();
	}

	public get isCarrierDelivering() {
		return this.inDeliveryOrders.length > 0;
	}

	public get currentOrders() {
		if (this.isCarrierDelivering) {
			return this.inDeliveryOrders;
		} else {
			return this.closeOrders;
		}
	}

	public get shouldShowOrdersStatusesControl() {
		return (
			this.selectedOrdersId.length > 0 &&
			_.find(
				this.currentOrders,
				(order) => order.id === this.selectedOrdersId[0]
			)!.carrierStatus <= OrderCarrierStatus.CarrierSelectedOrder
		);
	}

	getChangeOrder(order: Order) {
		this.selectedOrder = order;
	}

	getChangeCarrier(carrier: Carrier) {
		if (carrier.status === CarrierStatus.Offline) {
			this.carrierOrders.selectedOrder = null;
			this.selectedOrder = null;
		}
	}

	carrierSelect(newCarrier: Carrier) {
		this._router.navigate([`/carriers/${newCarrier.id}`]);

		this.selectedOrder = null;

		const objToCompare: ICarrierOrdersRouterGetOptions = {
			populateWarehouse: true,
			completion: 'not-completed',
		};

		this.carrierOrderOptions =
			this.carrierOrderOptions === objToCompare ? null : objToCompare;

		this.selectedCarrier =
			this.selectedCarrier === newCarrier ? null : newCarrier;
	}

	getAllCarriers() {
		this.carriers$ = this.carriersService.getCarriers().subscribe((c) => {
			this.carriers = c;
			this._selectCarrierIfIdExists();
		});
	}

	orderStatusShow(warehouseOrderProducts) {
		if (warehouseOrderProducts) {
			// TODO: next line is most probably a bug, because selectedOrdersId is array,
			// but warehouseOrderProducts.id is single value!
			this.selectedOrdersId = warehouseOrderProducts.id;
			this.selectedOrder = warehouseOrderProducts;
		} else {
			this.selectedOrder = null;
		}
	}

	selectTab(ev) {
		if (this.currentTab !== ev.tabTitle) {
			this.currentTab = ev.tabTitle;
			if (this.carrierOrders) {
				this.carrierOrders.selectedOrder = null;
			}
			this.selectedOrder = null;
		}
	}

	selectedOrdersChange(selectedOrdersIds: string[]) {
		this.selectedOrdersId = selectedOrdersIds;
	}

	private async _selectCarrierIfIdExists() {
		const p = await this._route.params.pipe(first()).toPromise();

		const carrierId = p.id;
		if (carrierId !== undefined) {
			const carrier = this.carriers.find(
				(c) => c._id.toString() === carrierId
			);
			if (carrier !== undefined) {
				this.carrierSelect(carrier as Carrier);
			} else {
				this._toasterService.pop(
					`warning`,
					`Carrier with id '${carrierId}' is not active!`
				);
			}
		}
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
		if (this.carriers$) {
			this.carriers$.unsubscribe();
		}
	}
}
