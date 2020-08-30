import { of as observableOf, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { OrdersChart, OrdersChartService } from './orders-chart.service';
import { ProfitChart, ProfitChartService } from './profit-chart.service';

export class OrderProfitChartSummary {
	isPrice?: boolean;
	values: {
		total: {
			title: string;
			value: number;
		};
		completed: {
			title: string;
			value: number;
		};
		cancelled: {
			title: string;
			value: number;
		};
	};
}

// tslint:disable-next-line:max-classes-per-file
@Injectable()
export class OrdersProfitChartService {
	private summaryNew: OrderProfitChartSummary[] = [
		{
			values: {
				total: {
					title: 'Dummy title',
					value: 9999,
				},
				completed: {
					title: 'Dummy title completed',
					value: 9999,
				},
				cancelled: {
					title: 'Dummy title cancelled',
					value: 8888,
				},
			},
		},
	];

	constructor(
		private ordersChartService: OrdersChartService,
		private profitChartService: ProfitChartService
	) {}

	getOrderProfitChartSummary(): Observable<OrderProfitChartSummary[]> {
		return observableOf(this.summaryNew);
	}

	getOrdersChartData(period: string): Observable<OrdersChart> {
		return observableOf(this.ordersChartService.getOrdersChartData(period));
	}

	getProfitChartData(period: string): Observable<ProfitChart> {
		return observableOf(this.profitChartService.getProfitChartData(period));
	}
}
