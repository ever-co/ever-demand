import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	Output,
	ViewChild,
	ElementRef,
	OnInit,
} from '@angular/core';
import {
	NbMediaBreakpoint,
	NbMediaBreakpointsService,
	NbThemeService,
} from '@nebular/theme';
import { takeWhile } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from 'angular2-toaster';
import { ChartsPanelComponent } from '../charts-panel.component';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'ea-chart-panel-header',
	styleUrls: ['./chart-panel-header.component.scss'],
	templateUrl: './chart-panel-header.component.html',
})
export class ChartPanelHeaderComponent implements OnInit, OnDestroy {
	@Input()
	type: string;

	@Input()
	preservedRangeEvent: Observable<{ from: Date; to: Date }>;

	@Input()
	clearRangeFromParent: Observable<void>;

	@Output()
	periodChange = new EventEmitter<string>();

	@Output()
	clearSelectedRange = new EventEmitter<void>();

	@Output()
	customRangeDaysDiff = new EventEmitter<{
		fromDate: Date;
		toDate: Date;
		daysDiff: number;
	}>();

	@ViewChild('customDateRangeButton', { static: true })
	customDateRangeButton: ElementRef;

	isDateRangeSelected = false;
	types: Array<{ key: string; value: string }> = [];

	chartLegend: Array<{ iconColor: string; title: string }> = [];
	breakpoint: NbMediaBreakpoint = { name: '', width: 0 };
	breakpoints: any;
	currentTheme: string;

	fromDate: string;
	toDate: string;

	private _alive = true;
	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly _themeService: NbThemeService,
		private readonly _breakpointService: NbMediaBreakpointsService,
		private readonly _translateService: TranslateService,
		private readonly _toasterService: ToasterService
	) {
		this._themeService
			.getJsTheme()
			.pipe(takeWhile(() => this._alive))
			.subscribe((theme) => {
				this.orderProfitLegend = theme.variables.orderProfitLegend;
				this.currentTheme = theme.name;
				setTimeout(() => {
					this._setLegendItems();
					this._setTypes();
				}, 1500);
			});

		this.breakpoints = this._breakpointService.getBreakpointsMap();
		this._themeService
			.onMediaQueryChange()
			.pipe(takeWhile(() => this._alive))
			.subscribe(([oldValue, newValue]) => {
				this.breakpoint = newValue;
			});
	}

	ngOnInit() {
		this._listenLanguageChange();
		this._listenForPreservedRanges();
		this._listenClearRangeFromParent();
	}

	get periodText() {
		switch (this.type) {
			case ChartsPanelComponent._PERIODS.today:
				return this._translations.today;
			case ChartsPanelComponent._PERIODS.lastWeek:
				return this._translations.lastWeek;
			case ChartsPanelComponent._PERIODS.lastMonth:
				return this._translations.lastMonth;
			case ChartsPanelComponent._PERIODS.currentYear:
				return this._translations.currentYear;
			case ChartsPanelComponent._PERIODS.years:
				return this._translations.years;
			default:
				return this._translations.selectPeriod;
		}
	}

	changePeriod(period: string): void {
		this.type = period;
		this.periodChange.emit(period);
		this.clearRange();
	}

	selectDateRange() {
		const from = new Date(this.fromDate);
		const to = new Date(this.toDate);

		const isDateRangeValid = this._validateDateRange(from, to);

		if (isDateRangeValid) {
			this.isDateRangeSelected = true;
			const timeDiff = Math.abs(to.getTime() - from.getTime());
			const daysDiff = Math.ceil(timeDiff / (24 * 1000 * 3600));

			this.customRangeDaysDiff.emit({
				fromDate: from,
				toDate: to,
				daysDiff,
			});

			this._closeDateRangeDropdown();
		}
	}

	clearRange() {
		this.isDateRangeSelected = false;
	}

	clearRangeAndSendEvent() {
		this.clearRange();
		this.clearSelectedRange.emit();
	}

	private _listenClearRangeFromParent() {
		this.clearRangeFromParent
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(() => {
				this.isDateRangeSelected = false;
			});
	}

	private _setTypes() {
		this.types = [
			{
				key: ChartsPanelComponent._PERIODS.today,
				value: this._translations.today,
			},
			{
				key: ChartsPanelComponent._PERIODS.lastWeek,
				value: this._translations.lastWeek,
			},
			{
				key: ChartsPanelComponent._PERIODS.lastMonth,
				value: this._translations.lastMonth,
			},
			{
				key: ChartsPanelComponent._PERIODS.currentYear,
				value: this._translations.currentYear,
			},
			{
				key: ChartsPanelComponent._PERIODS.years,
				value: this._translations.years,
			},
		];
	}

	private _listenForPreservedRanges() {
		this.preservedRangeEvent
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(({ from, to }: { from: Date; to: Date }) => {
				const fromYear = from.getFullYear().toString();
				let fromMonth = (from.getMonth() + 1).toString();
				let fromDate = from.getDate().toString();

				if (fromMonth.length === 1) {
					fromMonth = `0${fromMonth}`;
				}
				if (fromDate.length === 1) {
					fromDate = `0${fromDate}`;
				}

				const toYear = to.getFullYear().toString();
				let toMonth = (to.getMonth() + 1).toString();
				let toDate = to.getDate().toString();

				if (toMonth.length === 1) {
					toMonth = `0${toMonth}`;
				}
				if (toDate.length === 1) {
					toDate = `0${toDate}`;
				}

				this.fromDate = `${fromYear}-${fromMonth}-${fromDate}`;
				this.toDate = `${toYear}-${toMonth}-${toDate}`;

				this.isDateRangeSelected = true;
			});
	}

	orderProfitLegend: any;
	private _setLegendItems() {
		this.chartLegend = [
			{
				iconColor: this.orderProfitLegend.firstItem,
				title: this._translations.completed,
			},
			{
				iconColor: this.orderProfitLegend.secondItem,
				title: this._translations.canceled,
			},
			{
				iconColor: this.orderProfitLegend.thirdItem,
				title: this._translations.totalOrders,
			},
		];
	}

	private _listenLanguageChange() {
		this._translateService.onLangChange.subscribe(() => {
			this._setLegendItems();
			this._setTypes();
		});
	}

	private _translate(key: string) {
		let translationResult = '';

		this._translateService.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}

	private _validateDateRange(from: Date, to: Date): boolean {
		let isDateRangeValid = true;

		if (isNaN(from.valueOf()) || isNaN(to.valueOf())) {
			this._toasterService.pop(
				'error',
				'Invalid date format',
				'Date should be in format "mm/dd/yyyy"'
			);

			isDateRangeValid = false;
		} else if (from > to) {
			this._toasterService.pop(
				'error',
				'Wrong date ranges',
				'"From date" must be before or equal to "to date"!'
			);

			isDateRangeValid = false;
		}

		return isDateRangeValid;
	}

	private _closeDateRangeDropdown() {
		this.customDateRangeButton.nativeElement.click();
	}

	private get _translations() {
		const prefix = 'DASHBOARD_VIEW.CHARTS';
		return {
			today: this._translate(`${prefix}.TODAY`),
			lastWeek: this._translate(`${prefix}.LAST_WEEK`),
			lastMonth: this._translate(`${prefix}.LAST_MONTH`),
			currentYear: this._translate(`${prefix}.CURRENT_YEAR`),
			years: this._translate(`${prefix}.YEARS`),
			totalOrders: this._translate(`${prefix}.ALL_ORDERS`),
			canceled: this._translate(`${prefix}.CANCELED`),
			completed: this._translate(`${prefix}.PAYMENT`),
			selectPeriod: this._translate(`${prefix}.SELECT_PERIOD`),
		};
	}

	ngOnDestroy() {
		this._alive = false;
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
