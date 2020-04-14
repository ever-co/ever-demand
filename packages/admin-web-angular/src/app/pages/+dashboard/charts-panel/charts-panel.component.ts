import { Component, OnDestroy, ViewChild, OnInit, Input } from '@angular/core';
import { OrdersChartComponent } from './charts/orders-chart/orders-chart.component';
import { ProfitChartComponent } from './charts/profit-chart/profit-chart.component';
import { TranslateService } from '@ngx-translate/core';
import {
	OrdersChart,
	OrdersChartService,
} from '@app/@core/services/dashboard/orders-chart.service';
import { ProfitChart } from '@app/@core/services/dashboard/profit-chart.service';
import { Subject } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import {
	OrdersProfitChartService,
	OrderProfitChartSummary,
} from '@app/@core/services/dashboard/orders-profit-chart.service';
import Order from '@modules/server.common/entities/Order';
import { PeriodsService } from '@app/@core/services/dashboard/periods.service';
import { DashboardLoadingIndicatorState } from '@app/models/DashboardLoadingIndicatorState';
import { toDate } from '@modules/server.common/utils';
import { takeUntil } from 'rxjs/operators';

interface IOrdersChartModel {
	total: any;
	cancelled: any;
	completed: any;
}

@Component({
	selector: 'ea-ecommerce-charts',
	styleUrls: ['./charts-panel.component.scss'],
	templateUrl: './charts-panel.component.html',
})
export class ChartsPanelComponent implements OnInit, OnDestroy {
	preservedRanges$ = new Subject<{ from: Date; to: Date }>();
	clearRange$ = new Subject<void>();

	loading = new DashboardLoadingIndicatorState();

	period: string = ChartsPanelComponent._PERIODS.today;
	chartPanelSummary: OrderProfitChartSummary[] = [];
	ordersChartData: OrdersChart;
	profitChartData: ProfitChart;

	@ViewChild('ordersChart')
	ordersChart: OrdersChartComponent;
	@ViewChild('profitChart')
	profitChart: ProfitChartComponent;
	@ViewChild('ordersProfitTab')
	ordersProfitTab: any;

	private _ordersToday: IOrdersChartModel;
	private _ordersLastWeek: IOrdersChartModel;
	private _ordersLastMonth: IOrdersChartModel;
	private _ordersCurrentYear: IOrdersChartModel;
	private _ordersYears: IOrdersChartModel;
	private _ordersDateRange: IOrdersChartModel;
	private _ordersWeeksRange: IOrdersChartModel;
	private _ordersMonthsRange: IOrdersChartModel;
	private _ordersYearsRange: IOrdersChartModel;

	private _yearsLabelRange = {
		from: null as number,
		to: null as number,
	};
	private _dateLabelRange = {
		from: null as Date,
		to: null as Date,
	};

	private _orders: Order[] = [];

	private _chartPanelSummaryTotal: number = 0;
	private _chartPanelSummaryCompleted: number = 0;
	private _chartPanelSummaryCancelled: number = 0;

	private _isOrderChartSelected: boolean = true;
	private _isDateRangeSelected: boolean = false;

	private _alive = true;
	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly _translateService: TranslateService,
		private readonly _ordersProfitChartService: OrdersProfitChartService,
		private readonly _periodService: PeriodsService,
		private readonly _ordersChartService: OrdersChartService
	) {
		this._ordersProfitChartService
			.getOrderProfitChartSummary()
			.pipe(takeWhile(() => this._alive))
			.subscribe((summary) => {
				this.chartPanelSummary = summary;
			});

		this.getOrdersChartData(this.period);
		this.getProfitChartData(this.period);
	}

	ngOnInit() {
		this._resetChartData();
		this._listenLangChange();
	}

	@Input()
	set orders(orders: Order[]) {
		this._orders = orders;
		this._setupAndDisplayChartsData();
	}

	get orders(): Order[] {
		return this._orders;
	}

	@Input()
	set isOrdersLoad(isLoading: boolean) {
		this._toggleLoading.chartPanelSummary(isLoading);
		this._toggleLoading.chart(isLoading);
	}

	static get _PERIODS() {
		return {
			today: 'today', // hours in last day
			lastWeek: 'lastWeek', // weekdays in last week
			lastMonth: 'lastMonth', // days in last month
			currentYear: 'currentYear', // months in last year
			years: 'years', // years from first order to last
			rangeDay: 'range day', // 0 days difference
			rangeDays: 'range days', // 1 - 27 days
			rangeWeeks: 'range weeks', // 28 - 60 days
			rangeMonths: 'range months', // 60 - 365 days
			rangeYears: 'range years', // more than 365 days
		};
	}

	private get _translations() {
		const rootPrefix = 'DASHBOARD_VIEW.CHARTS';

		return {
			TOTAL_ORDERS_OVER_PERIOD: this._translate(
				`${rootPrefix}.TOTAL_ORDERS`
			),
			TOTAL_COMPLETED_ORDERS_OVER_PERIOD: this._translate(
				`${rootPrefix}.TOTAL_COMPLETED_ORDERS`
			),
			TOTAL_CANCELLED_ORDERS_OVER_PERIOD: this._translate(
				`${rootPrefix}.TOTAL_CANCELLED_ORDERS`
			),

			TOTAL_REVENUE_OVER_PERIOD: this._translate(
				`${rootPrefix}.TOTAL_REVENUE_ALL_ORDERS`
			),
			TOTAL_REVENUE_COMPLETED_ORDERS_OVER_PERIOD: this._translate(
				`${rootPrefix}.TOTAL_REVENUE_COMPLETED_ORDERS`
			),
			TOTAL_REVENUE_CANCELLED_ORDERS_OVER_PERIOD: this._translate(
				`${rootPrefix}.TOTAL_LOST_REVENUE_CANCELLED_ORDERS`
			),
		};
	}

	private get _toggleLoading() {
		return {
			chartPanelSummary: (isLoading) =>
				(this.loading.chartPanelSummary = isLoading),
			chart: (isLoading) => (this.loading.chart = isLoading),
		};
	}

	ngOnDestroy() {
		this._alive = false;
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	clearRange() {
		this.setPeriodAndGetChartData(ChartsPanelComponent._PERIODS.today);
	}

	setPeriodAndGetChartData(value: string): void {
		if (this.period !== value) {
			this.period = value;
		}
		this._isDateRangeSelected = false;
		this._setupAndDisplayChartsData();
	}

	selectDateRangeOrderCharts({
		fromDate,
		toDate,
		daysDiff,
	}: {
		fromDate: Date;
		toDate: Date;
		daysDiff: number;
	}) {
		this._dateLabelRange.from = fromDate;
		this._dateLabelRange.to = toDate;
		this.period = this._calculateCustomPeriod(daysDiff);
		this._isDateRangeSelected = true;
		this._setupAndDisplayChartsData();
	}

	changeTab(selectedTab) {
		const isOrdersTabActive = this.ordersProfitTab.tabs.first.active;
		if (!isOrdersTabActive) {
			this.profitChart.resizeChart();
			this._isOrderChartSelected = false;
		} else {
			this._isOrderChartSelected = true;
			this.ordersChart.resizeChart();
		}

		if (this._isDateRangeSelected) {
			this._sendRangeIfSelected();
		} else {
			this._clearRangeFromHeader();
		}
		this._setupAndDisplayChartsData();
	}

	getOrdersChartData(period: string) {
		this._ordersProfitChartService
			.getOrdersChartData(period)
			.pipe(takeWhile(() => this._alive))
			.subscribe((ordersChartData) => {
				this.ordersChartData = ordersChartData;
			});
	}

	getProfitChartData(period: string) {
		this._ordersProfitChartService
			.getProfitChartData(period)
			.pipe(takeWhile(() => this._alive))
			.subscribe((profitChartData) => {
				this.profitChartData = profitChartData;
			});
	}

	private _setChartsSummary() {
		this.chartPanelSummary = [];

		if (this._isOrderChartSelected) {
			this._setOrdersChartSummary();
		} else {
			this._setProfitChartSummary();
		}
	}

	private _setOrdersChartSummary() {
		this.chartPanelSummary.push({
			values: {
				total: {
					title: this._translations.TOTAL_ORDERS_OVER_PERIOD,
					value: this._chartPanelSummaryTotal,
				},
				completed: {
					title: this._translations
						.TOTAL_COMPLETED_ORDERS_OVER_PERIOD,
					value: this._chartPanelSummaryCompleted,
				},
				cancelled: {
					title: this._translations
						.TOTAL_CANCELLED_ORDERS_OVER_PERIOD,
					value: this._chartPanelSummaryCancelled,
				},
			},
			isPrice: false,
		});
	}

	private _setProfitChartSummary() {
		this.chartPanelSummary.push({
			values: {
				total: {
					title: this._translations.TOTAL_REVENUE_OVER_PERIOD,
					value: this._chartPanelSummaryTotal,
				},
				completed: {
					title: this._translations
						.TOTAL_REVENUE_COMPLETED_ORDERS_OVER_PERIOD,
					value: this._chartPanelSummaryCompleted,
				},
				cancelled: {
					title: this._translations
						.TOTAL_REVENUE_CANCELLED_ORDERS_OVER_PERIOD,
					value: this._chartPanelSummaryCancelled,
				},
			},
			isPrice: true,
		});
	}

	private _setupLabelsYearsRange(order: Order) {
		const orderYear: number = toDate(order._createdAt).getFullYear();

		if (orderYear < this._yearsLabelRange.from) {
			this._yearsLabelRange.from = orderYear;
		}
	}

	private _resetYearsLabelRange() {
		this._yearsLabelRange = {
			from: Number.MAX_SAFE_INTEGER,
			to: new Date().getFullYear(),
		};
	}

	private _setupAndDisplayChartsData() {
		this._resetChartData();
		this._resetYearsLabelRange();
		this._resetChartPanelSummaryValues();

		this._orders
			.filter((order) => {
				switch (this.period) {
					case ChartsPanelComponent._PERIODS.today:
						return this._isOrderTodayPeriodMatch(order);
					case ChartsPanelComponent._PERIODS.lastWeek:
						return this._isOrderLastWeekPeriodMatch(order);
					case ChartsPanelComponent._PERIODS.lastMonth:
						return this._isOrderLastMonthPeriodMatch(order);
					case ChartsPanelComponent._PERIODS.currentYear:
						return this._isOrderCurrentYearPeriodMatch(order);
					case ChartsPanelComponent._PERIODS.years:
						this._setupLabelsYearsRange(order);
						return true;
					case ChartsPanelComponent._PERIODS.rangeDay:
						return this._isOrderCustomDayPeriodMatch(order);
					case ChartsPanelComponent._PERIODS.rangeDays:
					case ChartsPanelComponent._PERIODS.rangeWeeks:
					case ChartsPanelComponent._PERIODS.rangeMonths:
					case ChartsPanelComponent._PERIODS.rangeYears:
						return this._isOrderRangePeriodMatch(order);
				}
			})
			.forEach((order) => {
				const orderDateCreated = new Date(order._createdAt);

				const orderHour = orderDateCreated.getHours();
				const orderWeekDay = orderDateCreated.getDay();
				const orderDate = orderDateCreated.getDate();
				const orderMonth = orderDateCreated.getMonth();
				const orderYear = orderDateCreated.getFullYear();

				const orderDateRange = this._periodService.getDateLabelKey(
					orderDateCreated
				);
				const orderWeekRange = this._periodService.getWeekLabelKey(
					orderDateCreated,
					this._getDateWeekNumber
				);
				const orderMonthRange = this._periodService.getMonthLabelKey(
					orderDateCreated
				);

				if (this._isOrderChartSelected) {
					this._incrementOrdersAmountSummary(order);

					this._setupOrdersChartData(
						orderHour,
						orderWeekDay,
						orderDate,
						orderMonth,
						orderYear,
						orderDateRange,
						orderWeekRange,
						orderMonthRange,
						order.isCancelled
					);
				} else {
					const orderTotalPrice = order.totalPrice;
					this._incrementOrdersProfitSummary(order, orderTotalPrice);

					this._setupProfitChartData(
						orderHour,
						orderWeekDay,
						orderDate,
						orderMonth,
						orderYear,
						orderDateRange,
						orderWeekRange,
						orderMonthRange,
						orderTotalPrice,
						order.isCancelled
					);
				}
			});

		if (this._isOrderChartSelected) {
			this._displayOrdersChart();
		} else {
			this._displayProfitChart();
		}

		this._setChartsSummary();
	}

	private _incrementOrdersAmountSummary(order: Order) {
		this._chartPanelSummaryTotal += 1;
		order.isCancelled
			? (this._chartPanelSummaryCancelled += 1)
			: (this._chartPanelSummaryCompleted += 1);
	}

	private _incrementOrdersProfitSummary(
		order: Order,
		orderTotalPrice: number
	) {
		this._chartPanelSummaryTotal += orderTotalPrice;
		order.isCancelled
			? (this._chartPanelSummaryCancelled += orderTotalPrice)
			: (this._chartPanelSummaryCompleted += orderTotalPrice);
	}

	private _setupOrdersChartData(
		orderHour: number,
		orderWeekDay: number,
		orderDate: number,
		orderMonth: number,
		orderYear: number,
		orderDateRange: string,
		orderWeekRange: string,
		orderMonthRange: string,
		isCancelled: boolean
	) {
		this._setupOrdersChartTotal(
			orderHour,
			orderWeekDay,
			orderDate,
			orderMonth,
			orderYear,
			orderDateRange,
			orderWeekRange,
			orderMonthRange
		);

		if (isCancelled) {
			this._setupOrdersChartCanceled(
				orderHour,
				orderWeekDay,
				orderDate,
				orderMonth,
				orderYear,
				orderDateRange,
				orderWeekRange,
				orderMonthRange
			);
		} else {
			this._setupOrdersChartCompleted(
				orderHour,
				orderWeekDay,
				orderDate,
				orderMonth,
				orderYear,
				orderDateRange,
				orderWeekRange,
				orderMonthRange
			);
		}
	}

	private _setupProfitChartData(
		orderHour: number,
		orderWeekDay: number,
		orderDate: number,
		orderMonth: number,
		orderYear: number,
		orderDateRange: string,
		orderWeekRange: string,
		orderMonthRange: string,
		orderTotalPrice: number,
		isCancelled: boolean
	) {
		this._setupProfitChartTotal(
			orderHour,
			orderWeekDay,
			orderDate,
			orderMonth,
			orderYear,
			orderDateRange,
			orderWeekRange,
			orderMonthRange,
			orderTotalPrice
		);

		if (isCancelled) {
			this._setupProfitChartCanceled(
				orderHour,
				orderWeekDay,
				orderDate,
				orderMonth,
				orderYear,
				orderDateRange,
				orderWeekRange,
				orderMonthRange,
				orderTotalPrice
			);
		} else {
			this._setupProfitChartCompleted(
				orderHour,
				orderWeekDay,
				orderDate,
				orderMonth,
				orderYear,
				orderDateRange,
				orderWeekRange,
				orderMonthRange,
				orderTotalPrice
			);
		}
	}

	private _setupOrdersChartTotal(
		orderHour: number,
		orderWeekDay: number,
		orderDate: number,
		orderMonth: number,
		orderYear: number,
		orderDateRange: string,
		orderWeekRange: string,
		orderMonthRange: string
	) {
		switch (this.period) {
			case ChartsPanelComponent._PERIODS.today:
				this._incrementTotalOrdersAmount(this._ordersToday, orderHour);
				break;
			case ChartsPanelComponent._PERIODS.lastWeek:
				this._incrementTotalOrdersAmount(
					this._ordersLastWeek,
					orderWeekDay
				);
				break;
			case ChartsPanelComponent._PERIODS.lastMonth:
				this._incrementTotalOrdersAmount(
					this._ordersLastMonth,
					orderDate
				);
				break;
			case ChartsPanelComponent._PERIODS.currentYear:
				this._incrementTotalOrdersAmount(
					this._ordersCurrentYear,
					orderMonth
				);
				break;
			case ChartsPanelComponent._PERIODS.years:
				this._incrementTotalOrdersAmount(this._ordersYears, orderYear);
				break;
			case ChartsPanelComponent._PERIODS.rangeDay:
				this._incrementTotalOrdersAmount(this._ordersToday, orderHour);
				break;
			case ChartsPanelComponent._PERIODS.rangeDays:
				this._incrementTotalOrdersAmount(
					this._ordersDateRange,
					orderDateRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeWeeks:
				this._incrementTotalOrdersAmount(
					this._ordersWeeksRange,
					orderWeekRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeMonths:
				this._incrementTotalOrdersAmount(
					this._ordersMonthsRange,
					orderMonthRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeYears:
				this._incrementTotalOrdersAmount(
					this._ordersYearsRange,
					orderYear
				);
				break;
		}
	}

	/** This method can substitute method above */
	// private _setupOrdersChartTotal(
	// 	orderHour: number,
	// 	orderWeekDay: number,
	// 	orderDate: number,
	// 	orderMonth: number,
	// 	orderYear: number,
	// 	orderDateRange: string,
	// 	orderWeekRange: string,
	// 	orderMonthRange: string
	// ) {
	// 	this._setupOrdersChartTotalCommon(orderHour);

	// 	if (!this._isDateRangeSelected) {
	// 		this._setupOrdersChartTotalOptionSelected(
	// 			orderWeekDay,
	// 			orderDate,
	// 			orderMonth,
	// 			orderYear
	// 		);
	// 	} else {
	// 		this._setupOrdersChartTotalRangeSelected(
	// 			orderDateRange,
	// 			orderWeekRange,
	// 			orderMonthRange,
	// 			orderYear
	// 		);
	// 	}
	// }

	private _setupOrdersChartCanceled(
		orderHour: number,
		orderWeekDay: number,
		orderDate: number,
		orderMonth: number,
		orderYear: number,
		orderDateRange: string,
		orderWeekRange: string,
		orderMonthRange: string
	) {
		switch (this.period) {
			case ChartsPanelComponent._PERIODS.today:
				this._incrementCanceledOrdersAmount(
					this._ordersToday,
					orderHour
				);
				break;
			case ChartsPanelComponent._PERIODS.lastWeek:
				this._incrementCanceledOrdersAmount(
					this._ordersLastWeek,
					orderWeekDay
				);
				break;
			case ChartsPanelComponent._PERIODS.lastMonth:
				this._incrementCanceledOrdersAmount(
					this._ordersLastMonth,
					orderDate
				);
				break;
			case ChartsPanelComponent._PERIODS.currentYear:
				this._incrementCanceledOrdersAmount(
					this._ordersCurrentYear,
					orderMonth
				);
				break;
			case ChartsPanelComponent._PERIODS.years:
				this._incrementCanceledOrdersAmount(
					this._ordersYears,
					orderYear
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDay:
				this._incrementCanceledOrdersAmount(
					this._ordersToday,
					orderHour
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDays:
				this._incrementCanceledOrdersAmount(
					this._ordersDateRange,
					orderDateRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeWeeks:
				this._incrementCanceledOrdersAmount(
					this._ordersWeeksRange,
					orderWeekRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeMonths:
				this._incrementCanceledOrdersAmount(
					this._ordersMonthsRange,
					orderMonthRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeYears:
				this._incrementCanceledOrdersAmount(
					this._ordersYearsRange,
					orderYear
				);
				break;
		}
	}

	/** This method can substitute method above */
	// private _setupOrdersChartCancelled(
	// 	orderHour: number,
	// 	orderWeekDay: number,
	// 	orderDate: number,
	// 	orderMonth: number,
	// 	orderYear: number,
	// 	orderDateRange: string,
	// 	orderWeekRange: string,
	// 	orderMonthRange: string
	// ) {
	// 	this._setupOrdersChartCancelledCommon(orderHour);

	// 	if (!this._isDateRangeSelected) {
	// 		this._setupOrdersChartCancelledOptionSelected(
	// 			orderWeekDay,
	// 			orderDate,
	// 			orderMonth,
	// 			orderYear
	// 		);
	// 	} else {
	// 		this._setupOrdersChartCancelledRangeSelected(
	// 			orderDateRange,
	// 			orderWeekRange,
	// 			orderMonthRange,
	// 			orderYear
	// 		);
	// 	}
	// }

	private _setupOrdersChartCompleted(
		orderHour: number,
		orderWeekDay: number,
		orderDate: number,
		orderMonth: number,
		orderYear: number,
		orderDateRange: string,
		orderWeekRange: string,
		orderMonthRange: string
	) {
		switch (this.period) {
			case ChartsPanelComponent._PERIODS.today:
				this._incrementCompletedOrdersAmount(
					this._ordersToday,
					orderHour
				);
				break;
			case ChartsPanelComponent._PERIODS.lastWeek:
				this._incrementCompletedOrdersAmount(
					this._ordersLastWeek,
					orderWeekDay
				);
				break;
			case ChartsPanelComponent._PERIODS.lastMonth:
				this._incrementCompletedOrdersAmount(
					this._ordersLastMonth,
					orderDate
				);
				break;
			case ChartsPanelComponent._PERIODS.currentYear:
				this._incrementCompletedOrdersAmount(
					this._ordersCurrentYear,
					orderMonth
				);
				break;
			case ChartsPanelComponent._PERIODS.years:
				this._incrementCompletedOrdersAmount(
					this._ordersYears,
					orderYear
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDay:
				this._incrementCompletedOrdersAmount(
					this._ordersToday,
					orderHour
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDays:
				this._incrementCompletedOrdersAmount(
					this._ordersDateRange,
					orderDateRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeWeeks:
				this._incrementCompletedOrdersAmount(
					this._ordersWeeksRange,
					orderWeekRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeMonths:
				this._incrementCompletedOrdersAmount(
					this._ordersMonthsRange,
					orderMonthRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeYears:
				this._incrementCompletedOrdersAmount(
					this._ordersYearsRange,
					orderYear
				);
				break;
		}
	}

	/** This method can substitute method above */
	// private _setupOrdersChartCompleted(
	// 	orderHour: number,
	// 	orderWeekDay: number,
	// 	orderDate: number,
	// 	orderMonth: number,
	// 	orderYear: number,
	// 	orderDateRange: string,
	// 	orderWeekRange: string,
	// 	orderMonthRange: string
	// ) {
	// 	this._setupOrdersChartCompletedCommon(orderHour);

	// 	if (!this._isDateRangeSelected) {
	// 		this._setupOrdersChartCompletedOptionSelected(
	// 			orderWeekDay,
	// 			orderDate,
	// 			orderMonth,
	// 			orderYear
	// 		);
	// 	} else {
	// 		this._setupOrdersChartCompletedRangeSelected(
	// 			orderDateRange,
	// 			orderWeekRange,
	// 			orderMonthRange,
	// 			orderYear
	// 		);
	// 	}
	// }

	private _setupProfitChartTotal(
		orderHour: number,
		orderWeekDay: number,
		orderDate: number,
		orderMonth: number,
		orderYear: number,
		orderDateRange: string,
		orderWeekRange: string,
		orderMonthRange: string,
		orderTotalPrice: number
	) {
		switch (this.period) {
			case ChartsPanelComponent._PERIODS.today:
				this._incrementTotalOrdersProfit(
					this._ordersToday,
					orderHour,
					orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.lastWeek:
				this._incrementTotalOrdersProfit(
					this._ordersLastWeek,
					orderWeekDay,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.lastMonth:
				this._incrementTotalOrdersProfit(
					this._ordersLastMonth,
					orderDate,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.currentYear:
				this._incrementTotalOrdersProfit(
					this._ordersCurrentYear,
					orderMonth,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.years:
				this._incrementTotalOrdersProfit(
					this._ordersYears,
					orderYear,
					orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDay:
				this._incrementTotalOrdersProfit(
					this._ordersToday,
					orderHour,
					orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDays:
				this._incrementTotalOrdersProfit(
					this._ordersDateRange,
					orderDateRange,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.rangeWeeks:
				this._incrementTotalOrdersProfit(
					this._ordersWeeksRange,
					orderWeekRange,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.rangeMonths:
				this._incrementTotalOrdersProfit(
					this._ordersMonthsRange,
					orderMonthRange,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.rangeYears:
				this._incrementTotalOrdersProfit(
					this._ordersYearsRange,
					orderYear,
					orderTotalPrice
				);
				break;
		}
	}

	/** This method can substitute method above */
	// private _setupProfitChartTotal(
	// 	orderHour: number,
	// 	orderWeekDay: number,
	// 	orderDate: number,
	// 	orderMonth: number,
	// 	orderYear: number,
	// 	orderDateRange: string,
	// 	orderWeekRange: string,
	// 	orderMonthRange: string,
	// 	orderTotalPrice: number
	// ) {
	// 	this._setupProfitChartTotalCommon(orderHour, orderTotalPrice);

	// 	if (!this._isDateRangeSelected) {
	// 		this._setupProfitChartTotalOptionSelected(
	// 			orderWeekDay,
	// 			orderDate,
	// 			orderMonth,
	// 			orderYear,
	// 			orderTotalPrice
	// 		);
	// 	} else {
	// 		this._setupProfitChartTotalRangeSelected(
	// 			orderDateRange,
	// 			orderWeekRange,
	// 			orderMonthRange,
	// 			orderYear,
	// 			orderTotalPrice
	// 		);
	// 	}
	// }

	private _setupProfitChartCanceled(
		orderHour: number,
		orderWeekDay: number,
		orderDate: number,
		orderMonth: number,
		orderYear: number,
		orderDateRange: string,
		orderWeekRange: string,
		orderMonthRange: string,
		orderTotalPrice: number
	) {
		switch (this.period) {
			case ChartsPanelComponent._PERIODS.today:
				this._incrementCanceledOrdersProfit(
					this._ordersToday,
					orderHour,
					orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.lastWeek:
				this._incrementCanceledOrdersProfit(
					this._ordersLastWeek,
					orderWeekDay,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.lastMonth:
				this._incrementCanceledOrdersProfit(
					this._ordersLastMonth,
					orderDate,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.currentYear:
				this._incrementCanceledOrdersProfit(
					this._ordersCurrentYear,
					orderMonth,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.years:
				this._incrementCanceledOrdersProfit(
					this._ordersYears,
					orderYear,
					orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDay:
				this._incrementCanceledOrdersProfit(
					this._ordersToday,
					orderHour,
					orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDays:
				this._incrementCanceledOrdersProfit(
					this._ordersDateRange,
					orderDateRange,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.rangeWeeks:
				this._incrementCanceledOrdersProfit(
					this._ordersWeeksRange,
					orderWeekRange,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.rangeMonths:
				this._incrementCanceledOrdersProfit(
					this._ordersMonthsRange,
					orderMonthRange,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.rangeYears:
				this._incrementCanceledOrdersProfit(
					this._ordersYearsRange,
					orderYear,
					orderTotalPrice
				);
				break;
		}
	}

	/** This method can substitute method above */
	// private _setupProfitChartCanceled(
	// 	orderHour: number,
	// 	orderWeekDay: number,
	// 	orderDate: number,
	// 	orderMonth: number,
	// 	orderYear: number,
	// 	orderDateRange: string,
	// 	orderWeekRange: string,
	// 	orderMonthRange: string,
	// 	orderTotalPrice: number
	// ) {
	// 	this._setupProfitChartCancelledCommon(orderHour, orderTotalPrice);

	// 	if (!this._isDateRangeSelected) {
	// 		this._setupProfitChartCancelledOptionSelected(
	// 			orderWeekDay,
	// 			orderDate,
	// 			orderMonth,
	// 			orderYear,
	// 			orderTotalPrice
	// 		);
	// 	} else {
	// 		this._setupProfitChartCancelledRangeSelected(
	// 			orderDateRange,
	// 			orderTotalPrice,
	// 			orderWeekRange,
	// 			orderMonthRange,
	// 			orderYear
	// 		);
	// 	}
	// }

	private _setupProfitChartCompleted(
		orderHour: number,
		orderWeekDay: number,
		orderDate: number,
		orderMonth: number,
		orderYear: number,
		orderDateRange: string,
		orderWeekRange: string,
		orderMonthRange: string,
		orderTotalPrice: number
	) {
		switch (this.period) {
			case ChartsPanelComponent._PERIODS.today:
				this._incrementCompletedOrdersProfit(
					this._ordersToday,
					orderHour,
					orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.lastWeek:
				this._incrementCompletedOrdersProfit(
					this._ordersLastWeek,
					orderWeekDay,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.lastMonth:
				this._incrementCompletedOrdersProfit(
					this._ordersLastMonth,
					orderDate,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.currentYear:
				this._incrementCompletedOrdersProfit(
					this._ordersCurrentYear,
					orderMonth,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.years:
				this._incrementCompletedOrdersProfit(
					this._ordersYears,
					orderYear,
					orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDay:
				this._incrementCompletedOrdersProfit(
					this._ordersToday,
					orderHour,
					orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDays:
				this._incrementCompletedOrdersProfit(
					this._ordersDateRange,
					orderDateRange,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.rangeWeeks:
				this._incrementCompletedOrdersProfit(
					this._ordersWeeksRange,
					orderWeekRange,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.rangeMonths:
				this._incrementCompletedOrdersProfit(
					this._ordersMonthsRange,
					orderMonthRange,
					orderTotalPrice
				);

				break;
			case ChartsPanelComponent._PERIODS.rangeYears:
				this._incrementCompletedOrdersProfit(
					this._ordersYearsRange,
					orderYear,
					orderTotalPrice
				);
				break;
		}
	}

	/** This method can substitute method above */
	// private _setupProfitChartCompleted(
	// 	orderHour: number,
	// 	orderWeekDay: number,
	// 	orderDate: number,
	// 	orderMonth: number,
	// 	orderYear: number,
	// 	orderDateRange: string,
	// 	orderWeekRange: string,
	// 	orderMonthRange: string,
	// 	orderTotalPrice: number
	// ) {
	// 	this._setupProfitChartCompletedCommon(orderHour, orderTotalPrice);

	// 	if (!this._isDateRangeSelected) {
	// 		this._setupProfitChartCompletedOptionSelected(
	// 			orderWeekDay,
	// 			orderDate,
	// 			orderMonth,
	// 			orderYear,
	// 			orderTotalPrice
	// 		);
	// 	} else {
	// 		this._setupProfitChartCompletedRangeSelected(
	// 			orderDateRange,
	// 			orderTotalPrice,
	// 			orderWeekRange,
	// 			orderMonthRange,
	// 			orderYear
	// 		);
	// 	}
	// }

	private _setupOrdersChartTotalCommon(orderHour: number) {
		this._incrementTotalOrdersAmount(this._ordersToday, orderHour);
	}

	private _setupOrdersChartTotalOptionSelected(
		orderWeekDay: number,
		orderDate: number,
		orderMonth: number,
		orderYear: number
	) {
		this._incrementTotalOrdersAmount(this._ordersLastWeek, orderWeekDay);

		this._incrementTotalOrdersAmount(this._ordersLastMonth, orderDate);

		this._incrementTotalOrdersAmount(this._ordersCurrentYear, orderMonth);

		this._incrementTotalOrdersAmount(this._ordersYears, orderYear);
	}

	private _setupOrdersChartTotalRangeSelected(
		orderDateRange: string,
		orderWeekRange: string,
		orderMonthRange: string,
		orderYear: number
	) {
		this._incrementTotalOrdersAmount(this._ordersDateRange, orderDateRange);

		this._incrementTotalOrdersAmount(
			this._ordersWeeksRange,
			orderWeekRange
		);

		this._incrementTotalOrdersAmount(
			this._ordersMonthsRange,
			orderMonthRange
		);

		this._incrementTotalOrdersAmount(this._ordersYearsRange, orderYear);
	}

	private _setupOrdersChartCancelledCommon(orderHour: number) {
		this._incrementCanceledOrdersAmount(this._ordersToday, orderHour);
	}

	private _setupOrdersChartCancelledOptionSelected(
		orderWeekDay: number,
		orderDate: number,
		orderMonth: number,
		orderYear: number
	) {
		this._incrementCanceledOrdersAmount(this._ordersLastWeek, orderWeekDay);

		this._incrementCanceledOrdersAmount(this._ordersLastMonth, orderDate);

		this._incrementCanceledOrdersAmount(
			this._ordersCurrentYear,
			orderMonth
		);

		this._incrementCanceledOrdersAmount(this._ordersYears, orderYear);
	}

	private _setupOrdersChartCancelledRangeSelected(
		orderDateRange: string,
		orderWeekRange: string,
		orderMonthRange: string,
		orderYear: number
	) {
		this._incrementCanceledOrdersAmount(
			this._ordersDateRange,
			orderDateRange
		);

		this._incrementCanceledOrdersAmount(
			this._ordersWeeksRange,
			orderWeekRange
		);

		this._incrementCanceledOrdersAmount(
			this._ordersMonthsRange,
			orderMonthRange
		);

		this._incrementCanceledOrdersAmount(this._ordersYearsRange, orderYear);
	}

	private _setupOrdersChartCompletedCommon(orderHour: number) {
		this._incrementCompletedOrdersAmount(this._ordersToday, orderHour);
	}

	private _setupOrdersChartCompletedOptionSelected(
		orderWeekDay: number,
		orderDate: number,
		orderMonth: number,
		orderYear: number
	) {
		this._incrementCompletedOrdersAmount(
			this._ordersLastWeek,
			orderWeekDay
		);

		this._incrementCompletedOrdersAmount(this._ordersLastMonth, orderDate);

		this._incrementCompletedOrdersAmount(
			this._ordersCurrentYear,
			orderMonth
		);

		this._incrementCompletedOrdersAmount(this._ordersYears, orderYear);
	}

	private _setupOrdersChartCompletedRangeSelected(
		orderDateRange: string,
		orderWeekRange: string,
		orderMonthRange: string,
		orderYear: number
	) {
		this._incrementCompletedOrdersAmount(
			this._ordersDateRange,
			orderDateRange
		);

		this._incrementCompletedOrdersAmount(
			this._ordersWeeksRange,
			orderWeekRange
		);

		this._incrementCompletedOrdersAmount(
			this._ordersMonthsRange,
			orderMonthRange
		);

		this._incrementCompletedOrdersAmount(this._ordersYearsRange, orderYear);
	}

	private _setupProfitChartTotalCommon(
		orderHour: number,
		orderTotalPrice: number
	) {
		this._incrementTotalOrdersProfit(
			this._ordersToday,
			orderHour,
			orderTotalPrice
		);
	}

	private _setupProfitChartTotalOptionSelected(
		orderWeekDay: number,
		orderDate: number,
		orderMonth: number,
		orderYear: number,
		orderTotalPrice: number
	) {
		this._incrementTotalOrdersProfit(
			this._ordersLastWeek,
			orderWeekDay,
			orderTotalPrice
		);

		this._incrementTotalOrdersProfit(
			this._ordersLastMonth,
			orderDate,
			orderTotalPrice
		);

		this._incrementTotalOrdersProfit(
			this._ordersCurrentYear,
			orderMonth,
			orderTotalPrice
		);

		this._incrementTotalOrdersProfit(
			this._ordersYears,
			orderYear,
			orderTotalPrice
		);
	}

	private _setupProfitChartTotalRangeSelected(
		orderDateRange: string,
		orderWeekRange: string,
		orderMonthRange: string,
		orderYear: number,
		orderTotalPrice: number
	) {
		this._incrementTotalOrdersProfit(
			this._ordersDateRange,
			orderDateRange,
			orderTotalPrice
		);

		this._incrementTotalOrdersProfit(
			this._ordersWeeksRange,
			orderWeekRange,
			orderTotalPrice
		);

		this._incrementTotalOrdersProfit(
			this._ordersMonthsRange,
			orderMonthRange,
			orderTotalPrice
		);

		this._incrementTotalOrdersProfit(
			this._ordersYearsRange,
			orderYear,
			orderTotalPrice
		);
	}

	private _setupProfitChartCancelledCommon(
		orderHour: number,
		orderTotalPrice: number
	) {
		this._incrementCanceledOrdersProfit(
			this._ordersToday,
			orderHour,
			orderTotalPrice
		);
	}

	private _setupProfitChartCancelledOptionSelected(
		orderWeekDay: number,
		orderDate: number,
		orderMonth: number,
		orderYear: number,
		orderTotalPrice: number
	) {
		this._incrementCanceledOrdersProfit(
			this._ordersLastWeek,
			orderWeekDay,
			orderTotalPrice
		);

		this._incrementCanceledOrdersProfit(
			this._ordersLastMonth,
			orderDate,
			orderTotalPrice
		);

		this._incrementCanceledOrdersProfit(
			this._ordersCurrentYear,
			orderMonth,
			orderTotalPrice
		);

		this._incrementCanceledOrdersProfit(
			this._ordersYears,
			orderYear,
			orderTotalPrice
		);
	}

	private _setupProfitChartCancelledRangeSelected(
		orderDateRange: string,
		orderTotalPrice: number,
		orderWeekRange: string,
		orderMonthRange: string,
		orderYear: number
	) {
		this._incrementCanceledOrdersProfit(
			this._ordersDateRange,
			orderDateRange,
			orderTotalPrice
		);

		this._incrementCanceledOrdersProfit(
			this._ordersWeeksRange,
			orderWeekRange,
			orderTotalPrice
		);

		this._incrementCanceledOrdersProfit(
			this._ordersMonthsRange,
			orderMonthRange,
			orderTotalPrice
		);

		this._incrementCanceledOrdersProfit(
			this._ordersYearsRange,
			orderYear,
			orderTotalPrice
		);
	}

	private _setupProfitChartCompletedCommon(
		orderHour: number,
		orderTotalPrice: number
	) {
		this._incrementCompletedOrdersProfit(
			this._ordersToday,
			orderHour,
			orderTotalPrice
		);
	}

	private _setupProfitChartCompletedOptionSelected(
		orderWeekDay: number,
		orderDate: number,
		orderMonth: number,
		orderYear: number,
		orderTotalPrice: number
	) {
		this._incrementCompletedOrdersProfit(
			this._ordersLastWeek,
			orderWeekDay,
			orderTotalPrice
		);

		this._incrementCompletedOrdersProfit(
			this._ordersLastMonth,
			orderDate,
			orderTotalPrice
		);

		this._incrementCompletedOrdersProfit(
			this._ordersCurrentYear,
			orderMonth,
			orderTotalPrice
		);

		this._incrementCompletedOrdersProfit(
			this._ordersYears,
			orderYear,
			orderTotalPrice
		);
	}

	private _setupProfitChartCompletedRangeSelected(
		orderDateRange: string,
		orderTotalPrice: number,
		orderWeekRange: string,
		orderMonthRange: string,
		orderYear: number
	) {
		this._incrementCompletedOrdersProfit(
			this._ordersDateRange,
			orderDateRange,
			orderTotalPrice
		);

		this._incrementCompletedOrdersProfit(
			this._ordersWeeksRange,
			orderWeekRange,
			orderTotalPrice
		);

		this._incrementCompletedOrdersProfit(
			this._ordersMonthsRange,
			orderMonthRange,
			orderTotalPrice
		);

		this._incrementCompletedOrdersProfit(
			this._ordersYearsRange,
			orderYear,
			orderTotalPrice
		);
	}

	private _incrementTotalOrdersAmount(
		varToStore: IOrdersChartModel,
		key: number | string
	) {
		if (!varToStore.total[key]) {
			varToStore.total[key] = 0;
		}
		varToStore.total[key] += 1;
	}

	private _incrementCanceledOrdersAmount(
		varToStore: IOrdersChartModel,
		key: number | string
	) {
		if (!varToStore.cancelled[key]) {
			varToStore.cancelled[key] = 0;
		}
		varToStore.cancelled[key] += 1;
	}

	private _incrementCompletedOrdersAmount(
		varToStore: IOrdersChartModel,
		key: number | string
	) {
		if (!varToStore.completed[key]) {
			varToStore.completed[key] = 0;
		}
		varToStore.completed[key] += 1;
	}

	private _incrementTotalOrdersProfit(
		varToStore: IOrdersChartModel,
		key: number | string,
		value: number
	) {
		if (!varToStore.total[key]) {
			varToStore.total[key] = 0;
		}
		varToStore.total[key] += value;
	}

	private _incrementCanceledOrdersProfit(
		varToStore: IOrdersChartModel,
		key: number | string,
		value: number
	) {
		if (!varToStore.cancelled[key]) {
			varToStore.cancelled[key] = 0;
		}
		varToStore.cancelled[key] += value;
	}

	private _incrementCompletedOrdersProfit(
		varToStore: IOrdersChartModel,
		key: number | string,
		value: number
	) {
		if (!varToStore.completed[key]) {
			varToStore.completed[key] = 0;
		}
		varToStore.completed[key] += value;
	}

	private _displayOrdersChart() {
		if (this.period === ChartsPanelComponent._PERIODS.today) {
			this._setupOrdersChartForToday();
		} else if (this.period === ChartsPanelComponent._PERIODS.lastWeek) {
			this._setupOrdersChartForLastWeek();
		} else if (this.period === ChartsPanelComponent._PERIODS.lastMonth) {
			this._setupOrdersChartForLastMonth();
		} else if (this.period === ChartsPanelComponent._PERIODS.currentYear) {
			this._setupOrdersChartForCurrentYear();
		} else if (this.period === ChartsPanelComponent._PERIODS.years) {
			this._setupOrdersChartForYears();
		} else if (this.period === ChartsPanelComponent._PERIODS.rangeDay) {
			this._setupOrdersChartForToday();
		} else if (this.period === ChartsPanelComponent._PERIODS.rangeDays) {
			this._setupOrdersChartForDaysRange();
		} else if (this.period === ChartsPanelComponent._PERIODS.rangeWeeks) {
			this._setupOrdersChartForWeeksRange();
		} else if (this.period === ChartsPanelComponent._PERIODS.rangeMonths) {
			this._setupOrdersChartForMonthsRange();
		} else if (this.period === ChartsPanelComponent._PERIODS.rangeYears) {
			this._setupOrdersChartForYearsRange();
		}
	}

	private _displayProfitChart() {
		if (this.period === ChartsPanelComponent._PERIODS.today) {
			this._setupProfitChartForToday();
		} else if (this.period === ChartsPanelComponent._PERIODS.lastWeek) {
			this._setupProfitChartForLastWeek();
		} else if (this.period === ChartsPanelComponent._PERIODS.lastMonth) {
			this._setupProfitChartForLastMonth();
		} else if (this.period === ChartsPanelComponent._PERIODS.currentYear) {
			this._setupProfitChartForCurrentYear();
		} else if (this.period === ChartsPanelComponent._PERIODS.years) {
			this._setupProfitChartForYears();
		} else if (this.period === ChartsPanelComponent._PERIODS.rangeDay) {
			this._setupProfitChartForToday();
		} else if (this.period === ChartsPanelComponent._PERIODS.rangeDays) {
			this._setupProfitChartForDaysRange();
		} else if (this.period === ChartsPanelComponent._PERIODS.rangeWeeks) {
			this._setupProfitChartForWeeksRange();
		} else if (this.period === ChartsPanelComponent._PERIODS.rangeMonths) {
			this._setupProfitChartForMonthsRange();
		} else if (this.period === ChartsPanelComponent._PERIODS.rangeYears) {
			this._setupProfitChartForYearsRange();
		}
	}

	private _setupOrdersChartForToday() {
		const hours = this._periodService.getHours();
		const initialLinesData = this._getInitialChartData(hours.length);

		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				hours.length,
				hours
			),
			linesData: initialLinesData,
		};

		Object.keys(this._ordersToday.total).forEach((key) => {
			const val = this._ordersToday.total[key];
			const indexKey = this._getIndexKey(key, hours.length - 1);

			this.ordersChartData.linesData[0][indexKey] = val;
		});
		Object.keys(this._ordersToday.cancelled).forEach((key) => {
			const val = this._ordersToday.cancelled[key];
			const indexKey = this._getIndexKey(key, hours.length - 1);

			this.ordersChartData.linesData[1][indexKey] = val;
		});
		Object.keys(this._ordersToday.completed).forEach((key) => {
			const val = this._ordersToday.completed[key];
			const indexKey = this._getIndexKey(key, hours.length - 1);

			this.ordersChartData.linesData[2][indexKey] = val;
		});
	}

	private _setupOrdersChartForLastWeek() {
		const weeksDays = this._periodService.getWeekDays();
		const initialLinesData = this._getInitialChartData(weeksDays.length);

		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				weeksDays.length,
				weeksDays
			),
			linesData: initialLinesData,
		};

		Object.keys(this._ordersLastWeek.total).forEach((key) => {
			const val = this._ordersLastWeek.total[key];
			const indexKey = this._getIndexKey(key, weeksDays.length - 1);

			this.ordersChartData.linesData[0][indexKey] = val;
		});
		Object.keys(this._ordersLastWeek.cancelled).forEach((key) => {
			const val = this._ordersLastWeek.cancelled[key];
			const indexKey = this._getIndexKey(key, weeksDays.length - 1);

			this.ordersChartData.linesData[1][indexKey] = val;
		});
		Object.keys(this._ordersLastWeek.completed).forEach((key) => {
			const val = this._ordersLastWeek.completed[key];
			const indexKey = this._getIndexKey(key, weeksDays.length - 1);

			this.ordersChartData.linesData[2][indexKey] = val;
		});
	}

	private _setupOrdersChartForLastMonth() {
		const dates = this._periodService.getDatesLastMonth();
		const initialLinesData = this._getInitialChartData(dates.length);

		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				dates.length,
				dates
			),
			linesData: initialLinesData,
		};

		// Because the dates strat from 1 but array indexes start from 0 and we use dates for indexing.
		const indexFromDate = (key) => +key - 1;

		Object.keys(this._ordersLastMonth.total).forEach((key) => {
			const val = this._ordersLastMonth.total[key];

			const indexKey = indexFromDate(key);
			this.ordersChartData.linesData[0][indexKey] = val;
		});
		Object.keys(this._ordersLastMonth.cancelled).forEach((key) => {
			const val = this._ordersLastMonth.cancelled[key];

			const indexKey = indexFromDate(key);
			this.ordersChartData.linesData[1][indexKey] = val;
		});
		Object.keys(this._ordersLastMonth.completed).forEach((key) => {
			const val = this._ordersLastMonth.completed[key];

			const indexKey = indexFromDate(key);
			this.ordersChartData.linesData[2][indexKey] = val;
		});

		console.log(this.ordersChartData.linesData);
	}

	private _setupOrdersChartForCurrentYear() {
		const months = this._periodService.getMonths();
		const initialLinesData = this._getInitialChartData(months.length);

		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				months.length,
				months
			),
			linesData: initialLinesData,
		};

		Object.keys(this._ordersCurrentYear.total).forEach((key) => {
			const val = this._ordersCurrentYear.total[key];
			this.ordersChartData.linesData[0][key] = val;
		});
		Object.keys(this._ordersCurrentYear.cancelled).forEach((key) => {
			const val = this._ordersCurrentYear.cancelled[key];
			this.ordersChartData.linesData[1][key] = val;
		});
		Object.keys(this._ordersCurrentYear.completed).forEach((key) => {
			const val = this._ordersCurrentYear.completed[key];
			this.ordersChartData.linesData[2][key] = val;
		});
	}

	private _setupOrdersChartForYears() {
		const years = this._periodService.getYearLabels(this._yearsLabelRange);

		if (years.length === 1) {
			years.push(`${this._yearsLabelRange.to}`);
		}

		const initialLinesData = this._getInitialChartData(years.length);

		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				years.length,
				years
			),
			linesData: initialLinesData,
		};

		const indexByKey = this._generageIndexesByKeys(years);

		Object.keys(this._ordersYears.total).forEach((key) => {
			const val = this._ordersYears.total[key];
			this.ordersChartData.linesData[0][indexByKey[key]] = val;
		});
		Object.keys(this._ordersYears.cancelled).forEach((key) => {
			const val = this._ordersYears.cancelled[key];
			this.ordersChartData.linesData[1][indexByKey[key]] = val;
		});
		Object.keys(this._ordersYears.completed).forEach((key) => {
			const val = this._ordersYears.completed[key];
			this.ordersChartData.linesData[2][indexByKey[key]] = val;
		});
	}

	private _setupOrdersChartForDaysRange() {
		const { keys, labels } = this._periodService.getDatesLabelsKeys(
			this._dateLabelRange
		);

		const initialLinesData = this._getInitialChartData(labels.length);

		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				labels.length,
				labels
			),
			linesData: initialLinesData,
		};

		const indexByKey = this._generageIndexesByKeys(keys);

		Object.keys(this._ordersDateRange.total).forEach((key) => {
			const val = this._ordersDateRange.total[key];
			this.ordersChartData.linesData[0][indexByKey[key]] = val;
		});
		Object.keys(this._ordersDateRange.cancelled).forEach((key) => {
			const val = this._ordersDateRange.cancelled[key];
			this.ordersChartData.linesData[1][indexByKey[key]] = val;
		});
		Object.keys(this._ordersDateRange.completed).forEach((key) => {
			const val = this._ordersDateRange.completed[key];
			this.ordersChartData.linesData[2][indexByKey[key]] = val;
		});
	}

	private _setupOrdersChartForWeeksRange() {
		const { keys, labels } = this._periodService.getWeekLabelsKeys(
			this._dateLabelRange,
			this._getDateWeekNumber
		);

		const initialLinesData = this._getInitialChartData(labels.length);

		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				labels.length,
				labels
			),
			linesData: initialLinesData,
		};

		const indexByKey = this._generageIndexesByKeys(keys);

		Object.keys(this._ordersWeeksRange.total).forEach((key) => {
			const val = this._ordersWeeksRange.total[key];
			this.ordersChartData.linesData[0][indexByKey[key]] = val;
		});
		Object.keys(this._ordersWeeksRange.cancelled).forEach((key) => {
			const val = this._ordersWeeksRange.cancelled[key];
			this.ordersChartData.linesData[1][indexByKey[key]] = val;
		});
		Object.keys(this._ordersWeeksRange.completed).forEach((key) => {
			const val = this._ordersWeeksRange.completed[key];
			this.ordersChartData.linesData[2][indexByKey[key]] = val;
		});
	}

	private _setupOrdersChartForMonthsRange() {
		const { keys, labels } = this._periodService.getMonthLabelsKeys(
			this._dateLabelRange
		);

		const initialLinesData = this._getInitialChartData(labels.length);

		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				labels.length,
				labels
			),
			linesData: initialLinesData,
		};

		const indexByKey = this._generageIndexesByKeys(keys);

		Object.keys(this._ordersMonthsRange.total).forEach((key) => {
			const val = this._ordersMonthsRange.total[key];
			this.ordersChartData.linesData[0][indexByKey[key]] = val;
		});
		Object.keys(this._ordersMonthsRange.cancelled).forEach((key) => {
			const val = this._ordersMonthsRange.cancelled[key];
			this.ordersChartData.linesData[1][indexByKey[key]] = val;
		});
		Object.keys(this._ordersMonthsRange.completed).forEach((key) => {
			const val = this._ordersMonthsRange.completed[key];
			this.ordersChartData.linesData[2][indexByKey[key]] = val;
		});
	}

	private _setupOrdersChartForYearsRange() {
		const years = this._periodService.getYearsByRange(this._dateLabelRange);
		const initialLinesData = this._getInitialChartData(years.length);

		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				years.length,
				years
			),
			linesData: initialLinesData,
		};

		const indexByKey = this._generageIndexesByKeys(years);

		Object.keys(this._ordersYearsRange.total).forEach((key) => {
			const val = this._ordersYearsRange.total[key];
			this.ordersChartData.linesData[0][indexByKey[key]] = val;
		});
		Object.keys(this._ordersYearsRange.cancelled).forEach((key) => {
			const val = this._ordersYearsRange.cancelled[key];
			this.ordersChartData.linesData[1][indexByKey[key]] = val;
		});
		Object.keys(this._ordersYearsRange.completed).forEach((key) => {
			const val = this._ordersYearsRange.completed[key];
			this.ordersChartData.linesData[2][indexByKey[key]] = val;
		});
	}

	private _setupProfitChartForToday() {
		const hours = this._periodService.getHours();
		const initialLinesData = this._getInitialChartData(hours.length);

		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				hours.length,
				hours
			),
			data: initialLinesData,
		};

		Object.keys(this._ordersToday.total).forEach((key) => {
			const val = this._ordersToday.total[key];
			const indexKey = this._getIndexKey(key, hours.length - 1);

			this.profitChartData.data[2][indexKey] = val;
		});
		Object.keys(this._ordersToday.cancelled).forEach((key) => {
			const val = this._ordersToday.cancelled[key];
			const indexKey = this._getIndexKey(key, hours.length - 1);

			this.profitChartData.data[1][indexKey] = val;
		});
		Object.keys(this._ordersToday.completed).forEach((key) => {
			const val = this._ordersToday.completed[key];
			const indexKey = this._getIndexKey(key, hours.length - 1);

			this.profitChartData.data[0][indexKey] = val;
		});
	}

	private _setupProfitChartForLastWeek() {
		const weeks = this._periodService.getWeekDays();
		const initialLinesData = this._getInitialChartData(weeks.length);

		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				weeks.length,
				weeks
			),
			data: initialLinesData,
		};

		Object.keys(this._ordersLastWeek.total).forEach((key) => {
			const val = this._ordersLastWeek.total[key];
			const indexKey = this._getIndexKey(key, weeks.length - 1);

			this.profitChartData.data[2][indexKey] = val;
		});
		Object.keys(this._ordersLastWeek.cancelled).forEach((key) => {
			const val = this._ordersLastWeek.cancelled[key];
			const indexKey = this._getIndexKey(key, weeks.length - 1);

			this.profitChartData.data[1][indexKey] = val;
		});
		Object.keys(this._ordersLastWeek.completed).forEach((key) => {
			const val = this._ordersLastWeek.completed[key];
			const indexKey = this._getIndexKey(key, weeks.length - 1);

			this.profitChartData.data[0][indexKey] = val;
		});
	}

	private _setupProfitChartForLastMonth() {
		const dates = this._periodService.getDatesLastMonth();
		const initialLinesData = this._getInitialChartData(dates.length);

		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				dates.length,
				dates
			),
			data: initialLinesData,
		};

		// Because the dates strat from 1 but array indexes start from 0 and we use dates for indexing.
		const indexFromDate = (key) => +key - 1;

		Object.keys(this._ordersLastMonth.total).forEach((key) => {
			const val = this._ordersLastMonth.total[key];
			const indexKey = indexFromDate(key);

			this.profitChartData.data[2][indexKey] = val;
		});
		Object.keys(this._ordersLastMonth.cancelled).forEach((key) => {
			const val = this._ordersLastMonth.cancelled[key];
			const indexKey = indexFromDate(key);

			this.profitChartData.data[1][indexKey] = val;
		});
		Object.keys(this._ordersLastMonth.completed).forEach((key) => {
			const val = this._ordersLastMonth.completed[key];
			const indexKey = indexFromDate(key);

			this.profitChartData.data[0][indexKey] = val;
		});
	}

	private _setupProfitChartForCurrentYear() {
		const months = this._periodService.getMonths();
		const initialLinesData = this._getInitialChartData(months.length);

		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				months.length,
				months
			),
			data: initialLinesData,
		};

		Object.keys(this._ordersCurrentYear.total).forEach((key) => {
			const val = this._ordersCurrentYear.total[key];
			this.profitChartData.data[2][key] = val;
		});
		Object.keys(this._ordersCurrentYear.cancelled).forEach((key) => {
			const val = this._ordersCurrentYear.cancelled[key];
			this.profitChartData.data[1][key] = val;
		});
		Object.keys(this._ordersCurrentYear.completed).forEach((key) => {
			const val = this._ordersCurrentYear.completed[key];
			this.profitChartData.data[0][key] = val;
		});
	}

	private _setupProfitChartForYears() {
		const years = this._periodService.getYearLabels(this._yearsLabelRange);

		const initialLinesData = this._getInitialChartData(years.length);

		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				years.length,
				years
			),
			data: initialLinesData,
		};

		const indexByKey = this._generageIndexesByKeys(years);

		Object.keys(this._ordersYears.total).forEach((key) => {
			const val = this._ordersYears.total[key];
			this.profitChartData.data[2][indexByKey[key]] = val;
		});
		Object.keys(this._ordersYears.cancelled).forEach((key) => {
			const val = this._ordersYears.cancelled[key];
			this.profitChartData.data[1][indexByKey[key]] = val;
		});
		Object.keys(this._ordersYears.completed).forEach((key) => {
			const val = this._ordersYears.completed[key];
			this.profitChartData.data[0][indexByKey[key]] = val;
		});
	}

	private _setupProfitChartForDaysRange() {
		const { keys, labels } = this._periodService.getDatesLabelsKeys(
			this._dateLabelRange
		);

		const initialLinesData = this._getInitialChartData(labels.length);

		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				labels.length,
				labels
			),
			data: initialLinesData,
		};

		const indexByKey = this._generageIndexesByKeys(keys);

		Object.keys(this._ordersDateRange.total).forEach((key) => {
			const val = this._ordersDateRange.total[key];
			this.profitChartData.data[2][indexByKey[key]] = val;
		});
		Object.keys(this._ordersDateRange.cancelled).forEach((key) => {
			const val = this._ordersDateRange.cancelled[key];
			this.profitChartData.data[1][indexByKey[key]] = val;
		});
		Object.keys(this._ordersDateRange.completed).forEach((key) => {
			const val = this._ordersDateRange.completed[key];
			this.profitChartData.data[0][indexByKey[key]] = val;
		});
	}

	private _setupProfitChartForWeeksRange() {
		const { keys, labels } = this._periodService.getWeekLabelsKeys(
			this._dateLabelRange,
			this._getDateWeekNumber
		);

		const initialLinesData = this._getInitialChartData(labels.length);

		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				labels.length,
				labels
			),
			data: initialLinesData,
		};

		const indexByKey = this._generageIndexesByKeys(keys);

		Object.keys(this._ordersWeeksRange.total).forEach((key) => {
			const val = this._ordersWeeksRange.total[key];
			this.profitChartData.data[2][indexByKey[key]] = val;
		});
		Object.keys(this._ordersWeeksRange.cancelled).forEach((key) => {
			const val = this._ordersWeeksRange.cancelled[key];
			this.profitChartData.data[1][indexByKey[key]] = val;
		});
		Object.keys(this._ordersWeeksRange.completed).forEach((key) => {
			const val = this._ordersWeeksRange.completed[key];
			this.profitChartData.data[0][indexByKey[key]] = val;
		});
	}

	private _setupProfitChartForMonthsRange() {
		const { keys, labels } = this._periodService.getMonthLabelsKeys(
			this._dateLabelRange
		);

		const initialLinesData = this._getInitialChartData(labels.length);

		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				labels.length,
				labels
			),
			data: initialLinesData,
		};

		const indexByKey = this._generageIndexesByKeys(keys);

		Object.keys(this._ordersMonthsRange.total).forEach((key) => {
			const val = this._ordersMonthsRange.total[key];
			this.profitChartData.data[2][indexByKey[key]] = val;
		});
		Object.keys(this._ordersMonthsRange.cancelled).forEach((key) => {
			const val = this._ordersMonthsRange.cancelled[key];
			this.profitChartData.data[1][indexByKey[key]] = val;
		});
		Object.keys(this._ordersMonthsRange.completed).forEach((key) => {
			const val = this._ordersMonthsRange.completed[key];
			this.profitChartData.data[0][indexByKey[key]] = val;
		});
	}

	private _setupProfitChartForYearsRange() {
		const years = this._periodService.getYearsByRange(this._dateLabelRange);
		const initialLinesData = this._getInitialChartData(years.length);

		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
				years.length,
				years
			),
			data: initialLinesData,
		};

		const indexByKey = this._generageIndexesByKeys(years);

		Object.keys(this._ordersYearsRange.total).forEach((key) => {
			const val = this._ordersYearsRange.total[key];
			this.profitChartData.data[2][indexByKey[key]] = val;
		});
		Object.keys(this._ordersYearsRange.cancelled).forEach((key) => {
			const val = this._ordersYearsRange.cancelled[key];
			this.profitChartData.data[1][indexByKey[key]] = val;
		});
		Object.keys(this._ordersYearsRange.completed).forEach((key) => {
			const val = this._ordersYearsRange.completed[key];
			this.profitChartData.data[0][indexByKey[key]] = val;
		});
	}

	private _isOrderTodayPeriodMatch(order: Order): boolean {
		const dateToCompare = new Date();
		const orderDate = new Date(order._createdAt);

		// If we want to show yesterday orders.
		// dateToCompare.setDate(dateToCompare.getDate() - 1);

		const dateToCompareDay = dateToCompare.getDate();
		const dateToCompareWeek = this._getDateWeekNumber(dateToCompare);
		const dateToCompareMonth = dateToCompare.getMonth();
		const dateToCompareYear = dateToCompare.getFullYear();

		const orderDay = orderDate.getDate();
		const orderWeek = this._getDateWeekNumber(orderDate);
		const orderMonth = orderDate.getMonth();
		const orderYear = orderDate.getFullYear();

		return (
			orderDay === dateToCompareDay &&
			orderWeek === dateToCompareWeek &&
			orderMonth === dateToCompareMonth &&
			orderYear === dateToCompareYear
		);
	}

	private _isOrderLastWeekPeriodMatch(order: Order): boolean {
		const dateToCompare = new Date();
		const orderDate = new Date(order._createdAt);

		dateToCompare.setDate(dateToCompare.getDate() - 7);

		const dateToCompareWeek = this._getDateWeekNumber(dateToCompare);
		const dateToCompareYear = dateToCompare.getFullYear();

		const orderWeek = this._getDateWeekNumber(orderDate);
		const orderYear = orderDate.getFullYear();

		// TODO
		// See correctness of these conditions
		return (
			(orderWeek === dateToCompareWeek &&
				orderYear === dateToCompareYear) ||
			((orderWeek === 1 || orderWeek === 52) &&
				orderWeek === dateToCompareWeek &&
				Math.abs(orderYear - dateToCompareYear) === 1)
		);
	}

	private _isOrderLastMonthPeriodMatch(order: Order): boolean {
		const orderDate = new Date(order._createdAt);
		const today = new Date();

		return (
			orderDate.getFullYear() === today.getFullYear() &&
			orderDate.getMonth() === today.getMonth()
		);
	}

	private _isOrderCurrentYearPeriodMatch(order: Order): boolean {
		const dateToCompare = new Date();
		const orderDate = new Date(order._createdAt);

		return orderDate.getFullYear() === dateToCompare.getFullYear();
	}

	private _isOrderCustomDayPeriodMatch(order: Order): boolean {
		const dateToCompareDay = this._dateLabelRange.from.getDate();
		const dateToCompareWeek = this._getDateWeekNumber(
			this._dateLabelRange.from
		);
		const dateToCompareMonth = this._dateLabelRange.from.getMonth();
		const dateToCompareYear = this._dateLabelRange.from.getFullYear();

		const orderDate = new Date(order._createdAt);
		const orderDay = orderDate.getDate();
		const orderWeek = this._getDateWeekNumber(orderDate);
		const orderMonth = orderDate.getMonth();
		const orderYear = orderDate.getFullYear();

		return (
			orderDay === dateToCompareDay &&
			orderWeek === dateToCompareWeek &&
			orderMonth === dateToCompareMonth &&
			orderYear === dateToCompareYear
		);
	}

	private _isOrderRangePeriodMatch(order: Order): boolean {
		const from = this._dateLabelRange.from;
		const to = this._dateLabelRange.to;
		const orderDate = new Date(order._createdAt);

		return (
			orderDate.getTime() >= from.getTime() &&
			orderDate.getTime() <= to.getTime()
		);
	}

	private _resetChartData() {
		this._ordersToday = {
			total: {},
			cancelled: {},
			completed: {},
		};
		this._ordersLastWeek = {
			total: {},
			cancelled: {},
			completed: {},
		};
		this._ordersLastMonth = {
			total: {},
			cancelled: {},
			completed: {},
		};
		this._ordersCurrentYear = {
			total: {},
			cancelled: {},
			completed: {},
		};
		this._ordersYears = {
			total: {},
			cancelled: {},
			completed: {},
		};
		this._ordersDateRange = {
			total: {},
			cancelled: {},
			completed: {},
		};
		this._ordersWeeksRange = {
			total: {},
			cancelled: {},
			completed: {},
		};
		this._ordersMonthsRange = {
			total: {},
			cancelled: {},
			completed: {},
		};
		this._ordersYearsRange = {
			total: {},
			cancelled: {},
			completed: {},
		};
	}

	private _resetChartPanelSummaryValues() {
		this._chartPanelSummaryTotal = 0;
		this._chartPanelSummaryCompleted = 0;
		this._chartPanelSummaryCancelled = 0;
	}

	private _sendRangeIfSelected() {
		this.preservedRanges$.next(this._dateLabelRange);
	}

	private _clearRangeFromHeader() {
		this.clearRange$.next();
	}

	private _translate(key: string) {
		let translationResult = '';

		this._translateService.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}

	private _getIndexKey(key: string, maxIndexValue: number) {
		let indexKey = +key;

		indexKey = indexKey === 0 ? maxIndexValue : (indexKey -= 1);

		return indexKey;
	}

	private _calculateCustomPeriod(daysDiff: number) {
		switch (true) {
			case daysDiff === 0:
				return ChartsPanelComponent._PERIODS.rangeDay;
			case daysDiff > 0 && daysDiff <= 27:
				return ChartsPanelComponent._PERIODS.rangeDays;
			case daysDiff > 27 && daysDiff <= 60:
				return ChartsPanelComponent._PERIODS.rangeWeeks;
			case daysDiff > 60 && daysDiff <= 365:
				return ChartsPanelComponent._PERIODS.rangeMonths;
			case daysDiff > 365:
				return ChartsPanelComponent._PERIODS.rangeYears;
		}
	}

	private _getInitialChartData(dataLength: number): number[][] {
		const dataRow = Array.from('0'.repeat(dataLength)).map((x) => +x);

		return [
			JSON.parse(JSON.stringify(dataRow)),
			JSON.parse(JSON.stringify(dataRow)),
			JSON.parse(JSON.stringify(dataRow)),
		];
	}

	private _generageIndexesByKeys(keys: string[]) {
		const indexByKey = {};
		keys.forEach((key, index) => (indexByKey[key] = index));

		return indexByKey;
	}

	private _getDateWeekNumber(date) {
		const target = new Date(date.valueOf());
		const dayNumber = (date.getUTCDay() + 6) % 7;
		let firstThursday;

		target.setUTCDate(target.getUTCDate() - dayNumber + 3);
		firstThursday = target.valueOf();
		target.setUTCMonth(0, 1);

		if (target.getUTCDay() !== 4) {
			target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
		}

		return (
			Math.ceil(
				(firstThursday - (target as any)) / (7 * 24 * 3600 * 1000)
			) + 1
		);
	}

	private _listenLangChange() {
		this._translateService.onLangChange
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(() => {
				this._refreshChartData();
				this._setChartsSummary();
			});
	}

	private _refreshChartData() {
		switch (this.period) {
			case ChartsPanelComponent._PERIODS.lastWeek:
				this._refreshLastWeekChartData();
				break;
			case ChartsPanelComponent._PERIODS.lastMonth:
				this._refreshLastMonthChartData();
				break;
			case ChartsPanelComponent._PERIODS.currentYear:
				this._refreshCurrentYearChartData();
				break;
			case ChartsPanelComponent._PERIODS.rangeDays:
				this._refreshDaysRangeChartData();
				break;
			case ChartsPanelComponent._PERIODS.rangeWeeks:
				this._refreshWeeksRangeChartData();
				break;
			case ChartsPanelComponent._PERIODS.rangeMonths:
				this._refreshMonthsRangeChartData();
				break;
		}
	}

	private _refreshLastWeekChartData() {
		this._isOrderChartSelected
			? this._setupOrdersChartForLastWeek()
			: this._setupProfitChartForLastWeek();
	}

	private _refreshLastMonthChartData() {
		this._isOrderChartSelected
			? this._setupOrdersChartForLastMonth()
			: this._setupProfitChartForLastMonth();
	}

	private _refreshCurrentYearChartData() {
		this._isOrderChartSelected
			? this._setupOrdersChartForCurrentYear()
			: this._setupProfitChartForCurrentYear();
	}

	private _refreshDaysRangeChartData() {
		this._isOrderChartSelected
			? this._setupOrdersChartForDaysRange()
			: this._setupProfitChartForDaysRange();
	}

	private _refreshWeeksRangeChartData() {
		this._isOrderChartSelected
			? this._setupOrdersChartForWeeksRange()
			: this._setupProfitChartForWeeksRange();
	}

	private _refreshMonthsRangeChartData() {
		this._isOrderChartSelected
			? this._setupOrdersChartForMonthsRange()
			: this._setupProfitChartForMonthsRange();
	}
}
