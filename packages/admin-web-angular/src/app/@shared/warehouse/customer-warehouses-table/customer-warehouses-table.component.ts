import {
	AfterViewInit,
	Component,
	EventEmitter,
	Input,
	OnInit,
	OnDestroy,
} from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { WarehouseViewModel } from '../../../models/WarehouseViewModel';
import { WarehouseOrderComponent } from '../../../pages/+warehouses/+warehouse-order/warehouse-order.component';
import { Subject, forkJoin, Observable } from 'rxjs';
import { RedirectNameComponent } from '../../render-component/name-redirect/name-redirect.component';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'ea-customer-warehouses-table',
	styleUrls: ['./customer-warehouses-table.component.scss'],
	templateUrl: './customer-warehouses-table.component.html',
})
export class CustomerWarehousesTableComponent
	implements OnInit, AfterViewInit, OnDestroy {
	private ngDestroy$ = new Subject<void>();

	@Input()
	sourceEvent: EventEmitter<WarehouseViewModel[]>;

	@Input()
	selectWarehouseTmp: (ev) => void;

	protected settingsSmartTable: any;
	protected sourceSmartTable = new LocalDataSource();

	private _ngDestroy$ = new Subject<void>();

	constructor(private _translateService: TranslateService) {}
	ngOnInit() {
		this._loadSettingsSmartTable();
		this._loadDataSmartTable();
		this._applyTranslationOnSmartTable();
	}

	ngAfterViewInit(): void {
		this._addCustomHTMLElements();
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	// This is just workaround to show some search icon on smart table, in the future maybe we must find better solution.
	private _addCustomHTMLElements(): any {
		const target = document.querySelector(
			'#nearby-stores ng2-smart-table .ng2-smart-filters > th:nth-child(1)'
		);
		if (target) {
			target.innerHTML =
				'<i class="fa fa-search" style="font-size: 1.3em"/>';
		}
	}

	private _applyTranslationOnSmartTable() {
		this._translateService.onLangChange.subscribe(() => {
			this._loadSettingsSmartTable();
		});
	}

	private _loadSettingsSmartTable() {
		const columnTitlePrefix = 'CUSTOMERS_VIEW.SMART_TABLE_COLUMNS.';
		const getTranslate = (name: string): Observable<string | any> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			this._translateService.get('Id'),
			getTranslate('NAME'),
			getTranslate('EMAIL'),
			getTranslate('PHONE'),
			getTranslate('CITY'),
			getTranslate('ADDRESS'),
			getTranslate('ORDERS_QTY'),
			getTranslate('ACTIONS')
		)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(
				([
					id,
					name,
					email,
					phone,
					city,
					address,
					orderQTY,
					actions,
				]) => {
					this.settingsSmartTable = {
						actions: false,
						selectMode: 'multi',
						columns: {
							name: {
								title: name,
								type: 'custom',
								renderComponent: RedirectNameComponent,
								onComponentInitFunction: (instance) => {
									instance.redirectPage = 'stores';
								},
							},
							email: { title: email },
							phone: { title: phone },
							city: { title: city },
							address: { title: address },
							ordersQty: {
								title: orderQTY,
								type: 'html',
								filter: false,
								valuePrepareFunction: (_, vm) =>
									`<span class="badge badge-secondary">${vm.ordersQty}</span>`,
							},
							actions: {
								title: actions,
								filter: false,
								type: 'custom',
								renderComponent: WarehouseOrderComponent,
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

	private _loadDataSmartTable() {
		this.sourceEvent
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((rawSource) => {
				this.sourceSmartTable.load(rawSource);
			});
	}
}
