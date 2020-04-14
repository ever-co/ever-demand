import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	AfterViewInit,
} from '@angular/core';

import Order from '@modules/server.common/entities/Order';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { ICarrierOrdersRouterGetOptions } from '@modules/server.common/routers/ICarrierOrdersRouter';
import Carrier from '@modules/server.common/entities/Carrier';
import { CarrierOrdersRouter } from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import CarrierStatus from '@modules/server.common/enums/CarrierStatus';
import _ from 'lodash';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject, Observable } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Subscription } from 'rxjs';
import { CreatedComponent } from '../../../../@shared/render-component/created/created.component';
import { CarriersService } from '@app/@core/data/carriers.service';
import { GeoLocationOrdersService } from '@app/@core/data/geo-location-orders.service';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { StoreOrderComponent } from '@app/@shared/render-component/carrier-orders-table/store-order.component';
import { UserOrderComponent } from '@app/@shared/render-component/carrier-orders-table/user-order-component';
import { takeUntil } from 'rxjs/operators';

const perPage = 3;
let searchCustomer: boolean;
let oldSearch = '';

@Component({
	selector: 'ea-carrier-orders',
	templateUrl: '/carrier-orders.component.html',
	styleUrls: ['./carrier-orders.component.scss'],
})
export class CarrierOrdersComponent
	implements OnDestroy, OnChanges, AfterViewInit {
	private ngDestroy$ = new Subject<void>();

	@Input()
	protected carrierOrderOptions: ICarrierOrdersRouterGetOptions;
	@Input()
	protected selectedCarrier: Carrier;

	@Output()
	protected selectedOrderEvent = new EventEmitter<Order>();

	public selectedOrder: Order;
	protected currentOrders: Order[];
	protected settingsSmartTable: object;
	protected sourceSmartTable: LocalDataSource = new LocalDataSource();
	protected enumOrderCarrierStatus: typeof OrderCarrierStatus = OrderCarrierStatus;

	private _isWork: boolean;
	private dataCount: number;
	private $locationOrders: Subscription;

	public carrierOnlineStatus = CarrierStatus.Online;

	static $customerSearch = new EventEmitter<string>();

	constructor(
		private carrierOrdersRouter: CarrierOrdersRouter,
		private orderRouter: OrderRouter,
		private _translateService: TranslateService,
		private carriersService: CarriersService,
		private geoLocationOrdersService: GeoLocationOrdersService
	) {
		this._setupSmartTable();
	}

	get isCarrierPickupOrder(): boolean {
		return (
			this.selectedOrder &&
			this.selectedOrder !== undefined &&
			this.selectedOrder.carrierStatus ===
				this.enumOrderCarrierStatus.CarrierPickedUpOrder
		);
	}

	get isCarrierArrivedToCustomer(): boolean {
		return (
			this.selectedOrder &&
			this.selectedOrder !== undefined &&
			this.selectedOrder.carrierStatus ===
				this.enumOrderCarrierStatus.CarrierArrivedToCustomer
		);
	}

	ngAfterViewInit() {
		this.loadSmartTableTranslates();
		this.smartTableChange();

		CarrierOrdersComponent.$customerSearch
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(async (searchText: string) => {
				await this.loadDataCount({
					byRegex: [{ key: 'user.firstName', value: searchText }],
				});
				await this.loadSmartTableData(1, {
					byRegex: [{ key: 'user.firstName', value: searchText }],
				});
			});
	}

	ngOnChanges() {
		this.loadDataCount();
		this.getAllAvailableOrders();
		this._isWork = true;
	}

	async getAllAvailableOrders() {
		this.loadSmartTableData();

		// Old code for load all available order
		// this.carrierOrdersRouter
		// 	.getAvailable(this.selectedCarrier.id, this.carrierOrderOptions)
		// 	.pipe(takeUntil(this.ngDestroy$))
		// 	.subscribe((orders: Order[]) => {
		// 		console.log('ORDERS LOAD:');
		// 		console.log(orders);

		// 		this._isWork = false;
		// 		this.currentOrders = orders;

		// 		orders.every((o: Order) => {
		// 			if (
		// 				o.carrierId === this.selectedCarrier.id &&
		// 				o.isPaid === false &&
		// 				o.carrierStatus !==
		// 					OrderCarrierStatus.IssuesDuringDelivery &&
		// 				o.carrierStatus !==
		// 					OrderCarrierStatus.ClientRefuseTakingOrder
		// 			) {
		// 				this.currentOrders = [o];
		// 				this._isWork = true;
		// 			}

		// 			return !this._isWork;
		// 		});

		// 		if (!this._isWork) {
		// 			let filter = (order: Order): boolean =>
		// 				order.carrierStatus !==
		// 					OrderCarrierStatus.IssuesDuringDelivery &&
		// 				order.carrierStatus !==
		// 					OrderCarrierStatus.ClientRefuseTakingOrder &&
		// 				this.selectedCarrier.status ===
		// 					CarrierStatus.Online &&
		// 				OrderWarehouseStatus.PackagingFinished ===
		// 					order.warehouseStatus &&
		// 				OrderCarrierStatus.DeliveryCompleted !==
		// 					order.carrierStatus &&
		// 				(order.carrier === undefined ||
		// 					order.carrier === null ||
		// 					(order.carrierId === this.selectedCarrier.id &&
		// 						order.isPaid === false));

		// 			this.currentOrders = orders.filter(filter);
		// 		}
		// 		console.log('ORDERS FINAL:');
		// 		console.log(this.currentOrders);

		// 		this.sourceSmartTable.load(this.currentOrders);
		// 	});
	}

	async smartTableChange() {
		this.sourceSmartTable
			.onChanged()
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(async (event) => {
				if (event.action === 'page') {
					const page = event.paging.page;
					this.loadSmartTableData(page);
				}
			});
	}

	selectOrder(ev) {
		const order = ev.data as Order;

		if (this.selectedOrder && order.id === this.selectedOrder.id) {
			this.selectedOrderEvent.emit(null);
			this.selectedOrder = null;
			this._isWork = false;
		} else {
			this.selectedOrderEvent.emit(order);
			this.selectedOrder = order;
			this._isWork = true;
		}
	}

	loadSmartTableTranslates() {
		this._translateService.onLangChange.subscribe(() => {
			this._setupSmartTable();
		});
	}

	protected get canControl(): boolean {
		return _.some(this.currentOrders, (order) =>
			order
				? OrderCarrierStatus.CarrierPickedUpOrder <=
						order.carrierStatus &&
				  OrderCarrierStatus.DeliveryCompleted >= order.carrierStatus
				: false
		);
	}

	protected async updateOrderCarrierStatus(status: OrderCarrierStatus) {
		this.selectedOrder = await this.orderRouter.updateCarrierStatus(
			this.selectedOrder.id,
			status
		);

		await this.loadSmartTableData();
	}

	private _setupSmartTable() {
		const columnTitlePrefix = 'CARRIERS_VIEW.CARRIER_PAGE.';
		const getTranslate = (name: string): Observable<string | any> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			this._translateService.get('Id'),
			getTranslate('WAREHOUSE'),
			getTranslate('CUSTOMER'),
			getTranslate('WAREHOUSE_STATUS'),
			getTranslate('CARRIER_STATUS'),
			getTranslate('CREATED')
		)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(
				([
					id,
					warehouse,
					customer,
					warehouseStatus,
					carrierStatus,
					created,
				]) => {
					this.settingsSmartTable = {
						actions: false,
						columns: {
							Warehouse: {
								title: warehouse,
								type: 'custom',
								renderComponent: StoreOrderComponent,
								width: '20%',
							},
							Customer: {
								title: customer,
								type: 'custom',
								renderComponent: UserOrderComponent,
								width: '20%',
								filterFunction(
									cell?: string,
									search?: string
								): boolean {
									if (
										!searchCustomer &&
										oldSearch !== search
									) {
										oldSearch = search;

										searchCustomer = true;
										setTimeout(() => {
											searchCustomer = false;

											CarrierOrdersComponent.$customerSearch.emit(
												search
											);
										}, 1000);
									}

									return true;
								},
							},
							WarehouseStatus: {
								title: warehouseStatus,
								type: 'string',
								valuePrepareFunction: (_, order: Order) => {
									let warehouseStat = 'BAD_STATUS';
									getTranslate(order.warehouseStatusText)
										.pipe(takeUntil(this.ngDestroy$))
										.subscribe((y) => {
											warehouseStat = y;
										});

									return warehouseStat;
								},
							},
							CarrierStatus: {
								title: carrierStatus,
								type: 'string',
								valuePrepareFunction: (_, order: Order) => {
									let carrierStat = 'No Status';
									getTranslate(order.carrierStatusText)
										.pipe(takeUntil(this.ngDestroy$))
										.subscribe((y) => {
											carrierStat = y;
										});

									return carrierStat;
								},
							},
							Created: {
								title: created,
								type: 'custom',
								renderComponent: CreatedComponent,
							},
						},
						pager: {
							display: true,
							perPage,
						},
					};
				}
			);
	}

	private async loadDataCount(searchObj?: {
		byRegex: Array<{ key: string; value: string }>;
	}) {
		const getOrdersGeoObj = {
			loc: {
				type: 'Point',
				coordinates: this.selectedCarrier.geoLocation.loc.coordinates,
			},
		};
		this.dataCount = await this.geoLocationOrdersService.getCountOfOrdersForWork(
			getOrdersGeoObj as GeoLocation,
			this.selectedCarrier.skippedOrderIds,
			searchObj
		);
	}

	private async loadSmartTableData(
		page = 1,
		searchObj?: { byRegex: Array<{ key: string; value: string }> }
	) {
		const getOrdersGeoObj = {
			loc: {
				type: 'Point',
				coordinates: this.selectedCarrier.geoLocation.loc.coordinates,
			},
		};

		if (this.$locationOrders) {
			await this.$locationOrders.unsubscribe();
		}

		this.$locationOrders = this.geoLocationOrdersService
			.getOrdersForWork(
				getOrdersGeoObj as GeoLocation,
				this.selectedCarrier.skippedOrderIds,
				{
					skip: perPage * (page - 1),
					limit: perPage,
				},
				searchObj
			)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(async (ordersForWork: Order[]) => {
				const currentOrder = await this.carriersService.getCarrierCurrentOrder(
					this.selectedCarrier.id
				);

				if (currentOrder) {
					this.currentOrders = [currentOrder];
				} else {
					this.currentOrders = new Array(this.dataCount);
					this.currentOrders.splice(
						perPage * (page - 1),
						perPage,
						...ordersForWork
					);
				}

				await this.sourceSmartTable.load(this.currentOrders);
			});
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
