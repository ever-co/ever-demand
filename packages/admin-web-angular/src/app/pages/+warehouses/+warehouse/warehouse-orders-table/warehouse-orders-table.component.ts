import {
	Component,
	OnInit,
	OnDestroy,
	OnChanges,
	AfterViewInit,
} from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject, Observable, forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import Order from '@modules/server.common/entities/Order';
import {
	ordersFilter,
	OrdersFilterModes,
} from '../../../ordersFilter/ordersFilter';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { RedirectOrderComponent } from '../../../../@shared/render-component/customer-orders-table/redirect-order.component';
import { ElapsedComponent } from '../../../../@shared/render-component/warehouse-table/elapsed/elapsed.component';
import { DatePipe } from '@angular/common';
import { WarehouseOrderComponent } from '../+warehouse-order/warehouse-order.component';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'ea-warehouse-orders-table',
	styleUrls: ['./warehouse-orders-table.component.scss'],
	templateUrl: './warehouse-orders-table.component.html',
})
export class WarehouseOrdersTableComponent
	implements OnInit, OnDestroy, OnChanges, AfterViewInit {
	private _ngDestroy$ = new Subject<void>();

	public orders: Order[] = [];
	public allOrders: Order[] = [];
	public selectedOrder: Order;

	public filterMode: OrdersFilterModes = 'ready';
	public warehouseID: string;

	public settingsSmartTable: object;
	public sourceSmartTable: LocalDataSource = new LocalDataSource();

	constructor(
		private _translateService: TranslateService,
		private readonly modalService: NgbModal,
		private _productLocalesService: ProductLocalesService,
		private warehouseOrdersRouter: WarehouseOrdersRouter
	) {
		this._loadTableSettings();
		this._listenForEntityLocaleTranslate();
	}

	ngOnChanges() {}
	ngOnInit() {}

	openWarehouseOrderCreateModal() {
		const modalRef: NgbModalRef = this.modalService.open(
			WarehouseOrderComponent,
			{
				size: 'lg',
				container: 'nb-layout',
				windowClass: 'ng-custom',
				backdrop: 'static',
			}
		);

		(modalRef.componentInstance as WarehouseOrderComponent).orderFinishedEmitter
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(() => {
				modalRef.close();
			});
	}

	ngAfterViewInit() {
		this.loadSmartTableTranslates();
	}

	switchLanguage(language: string) {
		this._translateService.use(language);
	}

	filterOrders(mode) {
		this.selectedOrder = null;
		this._getWarehouseOrders(this.warehouseID);
		this.filterMode = mode;
	}

	getOrders() {
		this.orders = ordersFilter(this.allOrders, this.filterMode);
		return this.orders;
	}

	loadSmartTableTranslates() {
		this._translateService.onLangChange.subscribe((d) => {
			this._loadTableSettings();
		});
	}

	protected selectOrder(warehouseOrderProducts) {
		this.selectedOrder =
			this.selectedOrder === warehouseOrderProducts.data
				? null
				: warehouseOrderProducts.data;
	}

	private _setupDataForSmartTable(orders: Order[]) {
		const data = [];

		orders.forEach((order) => {
			const raw: Date = new Date(<any>order._createdAt);
			const formatted: string = new DatePipe('en-EN').transform(
				raw,
				'dd-MMM-yyyy hh:mm:ss'
			);

			const columnTitlePrefix = 'STATUS_TEXT.';
			const getTranslate = (name: string): Observable<string | any> =>
				this._translateService.get(columnTitlePrefix + name);

			forkJoin(
				this._translateService.get('Id'),
				getTranslate(order.warehouseStatusText),
				getTranslate(order.carrierStatusText),
				getTranslate('CARRIER'),
				getTranslate('CREATED'),
				getTranslate('ELAPSED')
			)
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe(
					([
						id,
						warehouseStatusText,
						carrierStatusText,
						carrier,
						created,
						elapsed,
					]) => {
						data.push({
							id: order.id,
							products: order.products,
							orderNumber: order.orderNumber,
							warehouseStatusText: order.warehouseStatusText,
							carrierStatusText: order.carrierStatusText,
							createdAt: order.createdAt,
							warehouseStatus: order.warehouseStatus,
							carrier: order.carrier,
							carrierStatus: order.carrierStatus,
							product: order.products.length
								? `
							<div *ngIf= 'false' >
								<img width="32" height="32" src="${this.localeTranslate(
									order.products[0].product.images
								)}" />
								<h6 class="d-inline-block">
									${this.localeTranslate(order.products[0].product.title)}
									<span class="badge badge-pill badge-secondary">${order.products[0].count}</span>
								</h6>
							</div>
						`
								: '',
							status: warehouseStatusText,
							carrierStatusHtml: `<div class="badge badge-secondary">${carrierStatusText}</div>`,
							created: formatted,
						});
					}
				);
		});
		return data;
	}

	protected localeTranslate(member: ILocaleMember[]) {
		return this._productLocalesService.getTranslate(member);
	}

	private _listenForEntityLocaleTranslate() {
		this._translateService.onLangChange.subscribe(() => {
			const data = this._setupDataForSmartTable(this.getOrders());
			this.sourceSmartTable.load(data);
		});
	}

	private _getWarehouseOrders(id: string) {
		this.warehouseOrdersRouter
			.get(id)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((orders) => {
				this.allOrders = orders;
				const data = this._setupDataForSmartTable(this.getOrders());
				this.sourceSmartTable.load(data);
			});
	}

	private _loadTableSettings() {
		const columnTitlePrefix = 'WAREHOUSE_VIEW.';
		const getTranslate = (name: string): Observable<string | any> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			this._translateService.get('Id'),
			getTranslate('ORDER_NUMBER'),
			getTranslate('PRODUCTS'),
			getTranslate('STATUS'),
			getTranslate('CARRIER'),
			getTranslate('CREATED'),
			getTranslate('ELAPSED')
		)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(
				([
					id,
					orderNumber,
					product,
					status,
					carrier,
					created,
					elapsed,
				]) => {
					this.settingsSmartTable = {
						actions: false,
						columns: {
							orderNumber: {
								title: orderNumber,
								type: 'custom',
								renderComponent: RedirectOrderComponent,
							},
							product: { title: product, type: 'html' },
							status: {
								title: status,
								type: 'string',
								width: '30px',
							},
							carrierStatusHtml: { title: carrier, type: 'html' },
							created: { title: created, type: 'string' },
							elapsed: {
								title: elapsed,
								filter: false,
								type: 'custom',
								renderComponent: ElapsedComponent,
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

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
