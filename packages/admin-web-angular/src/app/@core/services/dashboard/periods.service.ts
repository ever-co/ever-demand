import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class PeriodsService {
	constructor(private readonly _translateService: TranslateService) {}

	getYearsByRange(dateRange: { from: Date; to: Date }) {
		const from = dateRange.from;
		const to = dateRange.to;

		const yearLabels = [];
		const currentDate = new Date(from.getTime());

		while (true) {
			yearLabels.push(currentDate.getFullYear());

			if (currentDate.getFullYear() === to.getFullYear()) {
				break;
			}

			currentDate.setFullYear(currentDate.getFullYear() + 1);
		}

		return yearLabels;
	}

	getDatesLastMonth() {
		const today = new Date();
		const current = new Date(today.getTime());
		current.setDate(1);

		const months = this.getMonths();
		const monthDateLabels = [];
		const todayDate = today.getDate();

		while (true) {
			const currentDate = current.getDate();
			let currentMonth = months[current.getMonth()];

			monthDateLabels.push(`${currentDate} ${currentMonth}`);

			if (currentDate === todayDate) {
				if (currentDate === 1) {
					current.setDate(currentDate + 1);
					currentMonth = months[current.getMonth()];

					monthDateLabels.push(`${currentDate} ${currentMonth}`);
				}

				break;
			}

			current.setDate(currentDate + 1);
		}

		return monthDateLabels;
	}

	getMonthLabelsKeys(dateRange: { from: Date; to: Date }) {
		const keys: string[] = [];
		const labels: string[] = [];

		const from = dateRange.from;
		const to = dateRange.to;
		const current = new Date(from);
		current.setDate(1);

		while (true) {
			keys.push(this.getMonthLabelKey(current));
			labels.push(this.getMonthLabel(current));

			if (
				current.getFullYear() === to.getFullYear() &&
				current.getMonth() === to.getMonth()
			) {
				break;
			}

			current.setMonth(current.getMonth() + 1);
		}

		return { keys, labels };
	}

	getMonthLabelKey(orderDate: Date): string {
		return `${orderDate.getMonth()} ${orderDate.getFullYear()}`;
	}

	getMonthLabel(orderDate: Date): string {
		const months = this.getMonths();
		return `${months[orderDate.getMonth()]} ${orderDate.getFullYear()}`;
	}

	getWeekLabelKey(
		orderDate: Date,
		getDateWeekNumber: (date: Date) => number
	) {
		const orderWeek = getDateWeekNumber(orderDate);
		let orderWeekLabel = '';

		if (orderWeek === 1) {
			const datePrev = new Date(orderDate);
			let dateNext: Date;

			if (orderDate.getMonth() === 0) {
				datePrev.setFullYear(datePrev.getFullYear() - 1);
			}

			datePrev.setDate(31);

			dateNext = new Date(datePrev);
			dateNext.setDate(dateNext.getDate() + 1);

			const weekPrev = getDateWeekNumber(datePrev);
			const weekNext = getDateWeekNumber(dateNext);

			if (orderWeek === weekPrev && weekPrev === weekNext) {
				const yearPrevAbbr = datePrev
					.getFullYear()
					.toString()
					.substring(2);
				const yearNextAbbr = dateNext
					.getFullYear()
					.toString()
					.substring(2);

				orderWeekLabel = `${orderWeek}\n${yearPrevAbbr}-${yearNextAbbr}`;
			} else {
				orderWeekLabel = `${orderWeek}\n${orderDate.getFullYear()}`;
			}
		} else {
			orderWeekLabel = `${orderWeek}\n${orderDate.getFullYear()}`;
		}

		return orderWeekLabel;
	}

	getWeekLabelsKeys(
		dateRanges: { from: Date; to: Date },
		getWeekFunction: (date: Date) => number
	) {
		const from = dateRanges.from;
		const to = dateRanges.to;

		let isFirstWeekIntercepted = false;

		if (from.getFullYear() < to.getFullYear()) {
			const fromEnd = new Date(from);
			fromEnd.setMonth(11);
			fromEnd.setDate(31);

			const toBegin = new Date(fromEnd);
			toBegin.setDate(toBegin.getDate() + 1);

			const fromWeek = getWeekFunction(fromEnd);
			const toWeek = getWeekFunction(toBegin);

			if (fromWeek === toWeek) {
				isFirstWeekIntercepted = true;
			}
		}

		const currentDate = new Date(from);
		const keys: string[] = [];
		const labels: string[] = [];

		const labelPrefix = this._translate(
			'DASHBOARD_VIEW.CHARTS.LABELS.WEEK'
		);

		while (true) {
			const currentWeek = getWeekFunction(currentDate);
			let weekYear: string;

			if (currentWeek === 1 && isFirstWeekIntercepted) {
				const fromYearAbbr = from.getFullYear().toString().substring(2);

				const toYearAbbr = to.getFullYear().toString().substring(2);

				weekYear = `${fromYearAbbr}-${toYearAbbr}`;
			} else {
				weekYear = currentDate.getFullYear().toString();
			}

			keys.push(`${currentWeek}\n${weekYear}`);

			labels.push(`${labelPrefix}-${currentWeek}\n${weekYear}`);

			currentDate.setDate(currentDate.getDate() + 7);

			if (currentDate.getTime() > dateRanges.to.getTime()) {
				break;
			}
		}

		return { keys, labels };
	}

	getDateLabelKey(orderDate: Date) {
		const date = new Date(orderDate.getTime());

		const day = date.getDate();
		const month = date.getMonth();
		const year = date.getFullYear();

		return this._getFormattedDate(day, month, year);
	}

	getHours() {
		return [
			'1:00',
			'2:00',
			'3:00',
			'4:00',
			'5:00',
			'6:00',
			'7:00',
			'8:00',
			'9:00',
			'10:00',
			'11:00',
			'12:00',
			'13:00',
			'14:00',
			'15:00',
			'16:00',
			'17:00',
			'18:00',
			'19:00',
			'20:00',
			'21:00',
			'22:00',
			'23:00',
			'00:00',
		];
	}

	getMonths() {
		const translationMonthsPrefix = 'DASHBOARD_VIEW.CHARTS.LABELS.MONTHS';

		const labels = [
			this._translate(`${translationMonthsPrefix}.JAN`),
			this._translate(`${translationMonthsPrefix}.FEB`),
			this._translate(`${translationMonthsPrefix}.MAR`),
			this._translate(`${translationMonthsPrefix}.APR`),
			this._translate(`${translationMonthsPrefix}.MAY`),
			this._translate(`${translationMonthsPrefix}.JUN`),
			this._translate(`${translationMonthsPrefix}.JUL`),
			this._translate(`${translationMonthsPrefix}.AUG`),
			this._translate(`${translationMonthsPrefix}.SEP`),
			this._translate(`${translationMonthsPrefix}.OCT`),
			this._translate(`${translationMonthsPrefix}.NOV`),
			this._translate(`${translationMonthsPrefix}.DEC`),
		];

		return labels;
	}

	getWeekDays() {
		const translationWeekDaysPrefix =
			'DASHBOARD_VIEW.CHARTS.LABELS.WEEKDAYS';

		const labels = [
			this._translate(`${translationWeekDaysPrefix}.MON`),
			this._translate(`${translationWeekDaysPrefix}.TUE`),
			this._translate(`${translationWeekDaysPrefix}.WED`),
			this._translate(`${translationWeekDaysPrefix}.THU`),
			this._translate(`${translationWeekDaysPrefix}.FRI`),
			this._translate(`${translationWeekDaysPrefix}.SAT`),
			this._translate(`${translationWeekDaysPrefix}.SUN`),
		];

		return labels;
	}

	getDatesLabelsKeys(dateRanges: { from: Date; to: Date }) {
		const keys: string[] = [];
		const labels: string[] = [];

		const currentDate = new Date(dateRanges.from);
		const months = this.getMonths();

		const endDay = dateRanges.to.getDate();
		const endMonth = dateRanges.to.getMonth();
		const endYear = dateRanges.to.getFullYear();

		while (true) {
			const currentDay = currentDate.getDate();
			const currentMonth = currentDate.getMonth();
			const currentMonthLabel = months[currentDate.getMonth()];
			const currentYear = currentDate.getFullYear();

			keys.push(
				this._getFormattedDate(currentDay, currentMonth, currentYear)
			);
			labels.push(
				this._getFormattedDate(
					currentDay,
					currentMonthLabel,
					currentYear
				)
			);

			if (
				currentDay === endDay &&
				currentMonth === endMonth &&
				currentYear === endYear
			) {
				break;
			}
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return { keys, labels };
	}

	getYearLabels(yearsRange: { from: number; to: number }): string[] {
		let { from, to } = yearsRange;

		if (from === Number.MAX_SAFE_INTEGER) {
			from = to;
		}

		let labels: string[] = this._generateYearLabels(from, to);

		if (labels.length === 1) {
			labels.unshift(`${from - 1}`);
			labels.push(`${to + 1}`);
		} else if (labels.length === 2) {
			labels.push(`${to + 1}`);
		}

		return labels;
	}

	private _generateYearLabels(yearFrom: number, yearTo: number): string[] {
		const labels =
			yearFrom === yearTo
				? [`${yearFrom}`]
				: [
						`${yearFrom}`,
						...this._generateYearLabels(yearFrom + 1, yearTo),
				  ];

		return labels;
	}

	private _getFormattedDate(
		day: number,
		month: string | number,
		year: number
	) {
		return `${day} ${month} ${`${year}`.substr(2, 2)}`;
	}

	private _translate(key: string) {
		let translationResult = '';

		this._translateService.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}
}
