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
import Warehouse from '@modules/server.common/entities/Warehouse';
import _ from 'lodash';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { CreatedComponent } from '../../../../@shared/render-component/created/created.component';
import { CarriersOrdersService } from '@app/@core/data/carriers-orders.service';
import { StoreOrderComponent } from '@app/@shared/render-component/carrier-orders-table/store-order.component';
import { UserOrderComponent } from '@app/@shared/render-component/carrier-orders-table/user-order-component';
import { takeUntil, first } from 'rxjs/operators';

const perPage = 3;

@Component({
	selector: 'ea-carrier-orders-history',
	templateUrl: '/carrier-orders-history.component.html',
	styleUrls: ['./carrier-orders-history.component.scss'],
})
export class CarrierOrdersHistoryComponent
	implements OnDestroy, OnChanges, AfterViewInit {
	private ngDestroy$ = new Subject<void>();

	@Input()
	protected carrierOrderOptions: ICarrierOrdersRouterGetOptions;
	@Input()
	protected selectedCarrier: Carrier;

	@Output()
	protected selectedOrderEvent = new EventEmitter<Order>();

	protected selectedOrder: Order;
	protected currentOrders: Order[] = [];
	protected settingsSmartTable: object;
	protected sourceSmartTable: LocalDataSource = new LocalDataSource();
	protected enumOrderCarrierStatus: typeof OrderCarrierStatus = OrderCarrierStatus;

	private dataCount: number;
	$ordersHistory: Subscription;

	constructor(
		private carrierOrdersRouter: CarrierOrdersRouter,
		private _translateService: TranslateService,
		private carriersOrdersService: CarriersOrdersService
	) {
		this._setupSmartTable();
	}

	ngAfterViewInit() {
		this.loadSmartTableTranslates();
		this.smartTableChange();
	}

	get isCarrierPickupOrder(): boolean {
		return (
			this.selectedOrder !== undefined &&
			this.selectedOrder.carrierStatus ===
				this.enumOrderCarrierStatus.CarrierPickedUpOrder
		);
	}

	get isCarrierArrivedToCustomer(): boolean {
		return (
			this.selectedOrder !== undefined &&
			this.selectedOrder.carrierStatus ===
				this.enumOrderCarrierStatus.CarrierArrivedToCustomer
		);
	}

	ngOnChanges() {
		this.getAllAvailableOrders();
		this.loadDataCount();
	}

	selectOrder(ev) {
		console.log(ev);
	}

	loadSmartTableTranslates() {
		this._translateService.onLangChange.subscribe((d) => {
			this._setupSmartTable();
		});
	}

	async getAllAvailableOrders() {
		this.loadSmartTableData();

		// Old code for load all order
		// this.carrierOrdersRouter
		// 	.getAvailable(this.selectedCarrier.id, this.carrierOrderOptions)
		// 	.pipe(takeUntil(this.ngDestroy$))
		// 	.subscribe((orders: Order[]) => {
		// 		console.log('ORDERS LOAD2:');
		// 		console.log(orders);

		// 		this.currentOrders = orders.filter(
		// 			(order: Order) =>
		// 				order.carrier !== undefined &&
		// 				order.carrier === this.selectedCarrier.id
		// 		);

		// 		console.log('ORDERS FINAL2:');
		// 		console.log(this.currentOrders);

		// 		this.sourceSmartTable.load(this.currentOrders);
		// 	});
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
			getTranslate('TIME')
		)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(
				([
					id,
					merchant,
					customer,
					warehouseStatus,
					carrierStatus,
					created,
				]) => {
					this.settingsSmartTable = {
						actions: false,
						columns: {
							Warehouse: {
								title: merchant,
								type: 'custom',
								renderComponent: StoreOrderComponent,
								width: '20%',
							},
							Customer: {
								title: customer,
								type: 'custom',
								renderComponent: UserOrderComponent,
								width: '20%',
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
							perPage: 3,
						},
					};
				}
			);
	}

	private async smartTableChange() {
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

	private async loadDataCount() {
		this.dataCount = await this.carriersOrdersService.getCountOfCarrierOrdersHistory(
			this.selectedCarrier.id
		);
	}

	private async loadSmartTableData(page = 1) {
		if (this.$ordersHistory) {
			await this.$ordersHistory.unsubscribe();
		}

		this.$ordersHistory = await this.carriersOrdersService
			.getCarrierOrdersHistory(this.selectedCarrier.id, {
				sort: 'desc',
				skip: perPage * (page - 1),
				limit: perPage,
			})
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((orders: Order[]) => {
				this.currentOrders = new Array(this.dataCount);
				this.currentOrders.splice(
					perPage * (page - 1),
					perPage,
					...orders
				);
				this.sourceSmartTable.load(this.currentOrders);
			});
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
