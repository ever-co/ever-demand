import { Component, OnInit, OnDestroy } from '@angular/core';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { Subject, Subscription } from 'rxjs';
import { WarehousesService } from '../../@core/data/warehouses.service';
import Order from '@modules/server.common/entities/Order';
import { OrdersService } from '../../@core/data/orders.service';
import { WarehouseOrdersService } from '@app/@core/data/warehouseOrders.service';
import { DashboardLoadingIndicatorState } from '@app/models/DashboardLoadingIndicatorState';
import { TranslateService } from '@ngx-translate/core';
import { DashboardInfoViewModel } from '@app/models/DashboardInfoViewModel';
import { IExistingCustomersViewModel } from '@app/models/IExistingCustomersViewModel';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'ea-dashboard',
	styleUrls: ['./dashboard.component.scss'],
	templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
	stores: Warehouse[] = [];

	loading = new DashboardLoadingIndicatorState();

	totalInfo = new DashboardInfoViewModel();
	todayInfo = new DashboardInfoViewModel();

	existingCustomers: IExistingCustomersViewModel;
	existingCustomersToday: IExistingCustomersViewModel;

	completedOrders: Order[] = [];
	completedOrdersToday: Order[] = [];
	chartPanelOrders: Order[] = [];

	hasSelectedStore: boolean = false;
	selectedStoreId: string;
	isChartPanelOrdersLoad: boolean = true;

	averageRateCustomersToday = {
		value: 0,
		allStores: 0,
		perStore: {}, // => perStore[storeId]
	};
	averageRateOrdersToday = {
		value: 0,
		allStores: 0,
		perStore: {},
	};
	averageRateRevenueToday = {
		value: 0,
		allStores: 0,
		perStore: {},
	};

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly _storesService: WarehousesService,
		private readonly _storeOrdersService: WarehouseOrdersService,
		private readonly _ordersService: OrdersService,
		private readonly _translateService: TranslateService
	) {}

	get labelAvgPercent() {
		const maxPercentRate = 100;
		return {
			customers:
				this.averageRateCustomersToday.value > maxPercentRate
					? this._translations.labelBetterThanAverage
					: this._translations.labelTillAverage,

			orders:
				this.averageRateOrdersToday.value > maxPercentRate
					? this._translations.labelBetterThanAverage
					: this._translations.labelTillAverage,

			revenue:
				this.averageRateRevenueToday.value > maxPercentRate
					? this._translations.labelBetterThanAverage
					: this._translations.labelTillAverage,
		};
	}

	private get _translations(): {
		labelTillAverage: string;
		labelBetterThanAverage: string;
	} {
		const translationPrefix = 'DASHBOARD_VIEW';

		return {
			labelTillAverage: this._translate(
				`${translationPrefix}.TILL_AVERAGE`
			),
			labelBetterThanAverage: this._translate(
				`${translationPrefix}.BETTER_THAN_AVERAGE`
			),
		};
	}

	private get _toggleLoading() {
		return {
			totalCustomers: (isLoading) =>
				(this.loading.totalInfo.customers = isLoading),
			totalOrders: (isLoading) =>
				(this.loading.totalInfo.orders = isLoading),
			totalRevenue: (isLoading) =>
				(this.loading.totalInfo.revenue = isLoading),

			todayCustomers: (isLoading) =>
				(this.loading.todayInfo.customers = isLoading),
			todayOrders: (isLoading) =>
				(this.loading.todayInfo.orders = isLoading),
			todayRevenue: (isLoading) =>
				(this.loading.todayInfo.revenue = isLoading),
		};
	}

	ngOnInit() {
		this.loadAllStoresData();
	}

	async onSelectStore(storeId: string) {
		if (storeId) {
			this.hasSelectedStore = true;
			this.selectedStoreId = storeId;

			this._toggleLoadingDashboardMetrics(true);

			this._displayTotalCustomers();
			this._displayTotalCustomersToday();

			await this._calculatePerMerchantMetrics();
			this._calculatePerMerchantMetricsToday();
			this._calculateAveragePercentagesToday();

			this._toggleLoadingDashboardMetrics(false);

			this._listenChartPanelPerStoreOrders();
		} else {
			this.hasSelectedStore = false;
			this.loadAllStoresData();
		}
	}

	private loadAllStoresData() {
		this._listenChartPanelTotalOrders();

		this._listenTotalStores();

		this._listenTotalCustomers();
		this._listenTotalCustomersToday();

		this._listenTotalOrders();
		this._listenTotalOrdersToday();
	}

	private _listenTotalStores() {
		this._storesService
			.getStores()
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((stores) => {
				this.stores = stores;
			});
	}

	private _toggleLoadingDashboardMetrics(isLoading: boolean) {
		this._toggleLoading.totalCustomers(isLoading);
		this._toggleLoading.totalOrders(isLoading);
		this._toggleLoading.totalRevenue(isLoading);
		this._toggleLoading.todayCustomers(isLoading);
		this._toggleLoading.todayOrders(isLoading);
		this._toggleLoading.todayRevenue(isLoading);
	}

	private async _listenChartPanelTotalOrders() {
		this.isChartPanelOrdersLoad = true;
		this.chartPanelOrders = await this._ordersService.getOrdersChartTotalOrdersNew();
		this.isChartPanelOrdersLoad = false;
		// .pipe(takeUntil(this._ngDestroy$))
		// .subscribe((orders) => {
		// 	if (!this.hasSelectedStore) {
		// 		this.chartPanelOrders = orders;
		// 	}
		// });
	}

	private _dashboardOrdersChartOrdersSubscription: Subscription;
	private _listenChartPanelPerStoreOrders() {
		// Every time when new store is selected, we have to unsubscribe previous emissions
		if (this._dashboardOrdersChartOrdersSubscription) {
			this._dashboardOrdersChartOrdersSubscription.unsubscribe();
			this._dashboardOrdersChartOrdersSubscription = null;
		}

		this._dashboardOrdersChartOrdersSubscription = this._storeOrdersService
			.getDashboardOrdersChartOrders(this.selectedStoreId)
			.subscribe((orders) => {
				this.chartPanelOrders = orders;
			});
	}

	private async _listenTotalOrders() {
		// Old logic for orders info
		// this._ordersService
		// 	.getDashboardCompletedOrders()
		// 	.pipe(takeUntil(this._ngDestroy$))
		// 	.subscribe((orders) => {
		// 		this.completedOrders = orders;
		// 		if (this.hasSelectedStore) {
		// 			this._calculatePerMerchantMetrics();
		// 		} else {
		// 			this._calculateGlobalMetrics();
		// 		}
		// 		this._calculateAveragePercentagesToday();
		// 	});

		this._toggleLoading.totalOrders(true);
		this._toggleLoading.totalRevenue(true);

		if (this.hasSelectedStore) {
			await this._calculatePerMerchantMetrics();
		} else {
			await this._calculateGlobalMetrics();
		}

		this._toggleLoading.totalOrders(false);
		this._toggleLoading.totalRevenue(false);

		this._calculateAveragePercentagesToday();
	}

	private _listenTotalOrdersToday() {
		this._toggleLoading.todayOrders(true);
		this._toggleLoading.todayRevenue(true);

		this._ordersService
			.getDashboardCompletedOrdersToday()
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((orders) => {
				this.completedOrdersToday = orders;

				if (this.hasSelectedStore) {
					this._calculatePerMerchantMetricsToday();
				} else {
					this._calculateGlobalMetricsToday();
				}
				this._calculateAveragePercentagesToday();

				this._toggleLoading.todayOrders(false);
				this._toggleLoading.todayRevenue(false);
			});
	}

	private _listenTotalCustomers() {
		this._toggleLoading.totalCustomers(true);

		this._storesService
			.getCountExistingCustomers()
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((existingCustomers) => {
				this.existingCustomers = existingCustomers;

				this._displayTotalCustomers();
				this._toggleLoading.totalCustomers(false);

				this._calculateAveragePercentagesToday();
			});
	}

	private _listenTotalCustomersToday() {
		this._toggleLoading.todayCustomers(true);

		this._storesService
			.getCountExistingCustomersToday()
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((existingCustomersToday) => {
				this.existingCustomersToday = existingCustomersToday;

				this._displayTotalCustomersToday();
				this._toggleLoading.todayCustomers(false);
				this._calculateAveragePercentagesToday();
			});
	}

	private _calculateStoreDaysExistence(store: Warehouse) {
		const day = 24 * 60 * 60 * 1000;

		const storeCreatedAt = new Date(store._createdAt);
		const difference = Math.abs(Date.now() - storeCreatedAt.getTime());
		const storeDaysExistence = difference / day;

		return storeDaysExistence;
	}

	private _calculateAveragePercentagesToday() {
		let storesDaysTotal = 0;

		this.stores.forEach((store) => {
			let storeDaysExistence = this._calculateStoreDaysExistence(store);
			storesDaysTotal += storeDaysExistence;

			if (storeDaysExistence < 1) {
				storeDaysExistence = 1;
			}
			this._calculateAverageCustomersPercentCurrentStore(
				storeDaysExistence,
				store.id
			);
			this._calculateAverageOrdersPercentCurrentStore(
				storeDaysExistence,
				store.id
			);
			this._calculateAverageRevenuePercentCurrentStore(
				storeDaysExistence,
				store.id
			);
		});

		const daysTotalAverage = storesDaysTotal / this.stores.length || 1;
		// if (daysTotalAverage < 1) {
		// 	daysTotalAverage = 1;
		// }

		this._calculateAverageCustomersPercentGlobal(daysTotalAverage);
		this._calculateAverageOrdersPercentGlobal(daysTotalAverage);
		this._calculateAverageRevenuePercentGlobal(daysTotalAverage);

		this._displayCustomersAveragePercent();
		this._displayOrdersAveragePercent();
		this._displayRevenueAveragePercent();
	}

	private _calculateAverageCustomersPercentGlobal(daysTotalAverage: number) {
		const averageCustomersPerDay =
			this.totalInfo.customers / daysTotalAverage || 0;

		this.averageRateCustomersToday.allStores =
			(this.todayInfo.customers / averageCustomersPerDay || 0) * 100;
	}

	private _calculateAverageOrdersPercentGlobal(daysTotalAverage: number) {
		const averageOrdersPerDay =
			this.totalInfo.orders / daysTotalAverage || 0;

		this.averageRateOrdersToday.allStores =
			(this.todayInfo.orders / averageOrdersPerDay || 0) * 100;
	}

	private _calculateAverageRevenuePercentGlobal(daysTotalAverage: number) {
		const averageRevenuePerDay =
			this.totalInfo.revenue / daysTotalAverage || 0;

		this.averageRateRevenueToday.allStores =
			(this.todayInfo.revenue / averageRevenuePerDay || 0) * 100;
	}

	private _calculateAverageCustomersPercentCurrentStore(
		storeDaysExistence: number,
		storeId: string
	) {
		const averageCustomers =
			this.totalInfo.customers / storeDaysExistence || 0;

		this.averageRateCustomersToday.perStore[storeId] =
			(this.todayInfo.customers / averageCustomers || 0) * 100;
	}

	private _calculateAverageOrdersPercentCurrentStore(
		storeDaysExistence: number,
		storeId: string
	) {
		const averageOrders = this.totalInfo.orders / storeDaysExistence || 0;

		this.averageRateOrdersToday.perStore[storeId] =
			(this.todayInfo.orders / averageOrders || 0) * 100;
	}

	private _calculateAverageRevenuePercentCurrentStore(
		storeDaysExistence: number,
		storeId: string
	) {
		const averageRevenue = this.totalInfo.revenue / storeDaysExistence || 0;

		this.averageRateRevenueToday.perStore[storeId] =
			(this.todayInfo.revenue / averageRevenue || 0) * 100;
	}

	private async _calculateGlobalMetrics() {
		const orderInfo = await this._ordersService.getComplatedOrdersInfo();

		this.totalInfo.orders = orderInfo['totalOrders'];
		this.totalInfo.revenue = orderInfo['totalRevenue'];
	}

	private _calculateGlobalMetricsToday() {
		this.todayInfo.orders = this.completedOrdersToday.length;

		this.todayInfo.revenue = this.completedOrdersToday
			.map((order) => order.totalPrice)
			.reduce((prevPrice, nextPrice) => prevPrice + nextPrice, 0);
	}

	private async _calculatePerMerchantMetrics() {
		const orderInfo = await this._ordersService.getComplatedOrdersInfo(
			this.selectedStoreId
		);

		this.totalInfo.orders = orderInfo['totalOrders'];
		this.totalInfo.revenue = orderInfo['totalRevenue'];
	}

	private _calculatePerMerchantMetricsToday() {
		const storeCompletedOrdersToday = this.completedOrdersToday.filter(
			(o) => o.warehouseId === this.selectedStoreId
		);

		this.todayInfo.orders = storeCompletedOrdersToday.length;
		this.todayInfo.revenue = storeCompletedOrdersToday
			.map((order) => order.totalPrice)
			.reduce((prevPrice, nextPrice) => prevPrice + nextPrice, 0);
	}

	private _displayCustomersAveragePercent() {
		this.hasSelectedStore
			? (this.averageRateCustomersToday.value = this.averageRateCustomersToday.perStore[
					this.selectedStoreId
			  ])
			: (this.averageRateCustomersToday.value = this.averageRateCustomersToday.allStores);
	}

	private _displayOrdersAveragePercent() {
		this.hasSelectedStore
			? (this.averageRateOrdersToday.value = this.averageRateOrdersToday.perStore[
					this.selectedStoreId
			  ])
			: (this.averageRateOrdersToday.value = this.averageRateOrdersToday.allStores);
	}

	private _displayRevenueAveragePercent() {
		this.hasSelectedStore
			? (this.averageRateRevenueToday.value = this.averageRateRevenueToday.perStore[
					this.selectedStoreId
			  ])
			: (this.averageRateRevenueToday.value = this.averageRateRevenueToday.allStores);
	}

	private _displayTotalCustomers() {
		if (this.hasSelectedStore) {
			const store = this.existingCustomers.perStore.find(
				(s) => s.storeId === this.selectedStoreId
			);
			this.totalInfo.customers = store ? store.customersCount : 0;
		} else {
			this.totalInfo.customers = this.existingCustomers.total;
		}
	}

	private _displayTotalCustomersToday() {
		if (this.hasSelectedStore) {
			const store = this.existingCustomersToday.perStore.find(
				(s) => s.storeId === this.selectedStoreId
			);
			this.todayInfo.customers = store ? store.customersCount : 0;
		} else {
			this.todayInfo.customers = this.existingCustomersToday.total;
		}
	}

	private _translate(key: string): string {
		let translationResult = '';

		this._translateService.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();

		if (this._dashboardOrdersChartOrdersSubscription) {
			this._dashboardOrdersChartOrdersSubscription.unsubscribe();
		}
	}
}
