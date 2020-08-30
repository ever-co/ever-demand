import { Injectable } from '@angular/core';
import { PeriodsService } from './periods.service';

export class ProfitChart {
	chartLabel: string[];
	data: number[][];
}

// tslint:disable-next-line:max-classes-per-file
@Injectable()
export class ProfitChartService {
	// TODO: replace with dynamic range
	private _years = ['2012', '2013', '2014', '2015', '2016', '2017', '2018'];

	private data = {};

	constructor(private period: PeriodsService) {
		this.data = {
			today: this.getDataForDayPeriod(),
			lastWeek: this.getDataForWeekPeriod(),
			currentYear: this.getDataForMonthPeriod(),
			years: this.getDataForYearPeriod(),
		};
	}

	getProfitChartData(period: string): ProfitChart {
		return this.data[period];
	}

	private getDataForDayPeriod(): ProfitChart {
		const nPoint = this.period.getHours().length;

		return {
			chartLabel: this.period.getHours(),
			data: [
				this.getRandomData(nPoint),
				this.getRandomData(nPoint),
				this.getRandomData(nPoint),
			],
		};
	}

	private getDataForWeekPeriod(): ProfitChart {
		const nPoint = this.period.getWeekDays().length;

		return {
			chartLabel: this.period.getWeekDays(),
			data: [
				this.getRandomData(nPoint),
				this.getRandomData(nPoint),
				this.getRandomData(nPoint),
			],
		};
	}

	private getDataForMonthPeriod(): ProfitChart {
		const nPoint = this.period.getMonths().length;

		return {
			chartLabel: this.period.getMonths(),
			data: [
				this.getRandomData(nPoint),
				this.getRandomData(nPoint),
				this.getRandomData(nPoint),
			],
		};
	}

	private getDataForYearPeriod(): ProfitChart {
		const nPoint = this._years.length;

		return {
			chartLabel: this._years,
			data: [
				this.getRandomData(nPoint),
				this.getRandomData(nPoint),
				this.getRandomData(nPoint),
			],
		};
	}

	private getRandomData(nPoints: number): number[] {
		return Array.from(Array(nPoints)).map(() => {
			return 0;
		});
	}
}
