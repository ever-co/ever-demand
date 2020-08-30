import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService } from 'angular2-toaster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService } from '@ngx-translate/core';
import { WarehousesService } from '../../@core/data/warehouses.service';
import { OrdersService } from '../../@core/data/orders.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { Observable, forkJoin, Subject } from 'rxjs';
import _ from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { WarehouseViewModel } from '../../models/WarehouseViewModel';
import { WarehouseMutationComponent } from '../../@shared/warehouse/warehouse-mutation';
import { RedirectNameComponent } from '../../@shared/render-component/name-redirect/name-redirect.component';
import { WarehouseActionsComponent } from '../../@shared/render-component/warehouse-table/warehouse-actions/warehouse-actions.component';
import { WarehouseImageComponent } from '../../@shared/render-component/warehouse-table/warehouse-image/warehouse-image.component';
import { WarehouseOrdersNumberComponent } from '../../@shared/render-component/warehouse-table/warehouse-orders-number/warehouse-orders-number.component';
import { ConfimationModalComponent } from '../../@shared/confirmation-modal/confirmation-modal.component';
import { WarehouseEmailComponent } from '../../@shared/render-component/warehouse-table/warehouse-email/warehouse-email.component';
import { WarehousePhoneComponent } from '../../@shared/render-component/warehouse-table/warehouse-phone/warehouse-phone.component';

const perPage = 5;

@Component({
	selector: 'ea-warehouses',
	templateUrl: './warehouses.component.html',
	styleUrls: ['./warehouses.component.scss'],
})
export class WarehousesComponent implements AfterViewInit, OnDestroy {
	private static noInfoSign = '';

	private ngDestroy$ = new Subject<void>();

	protected settingsSmartTable: object;
	protected sourceSmartTable = new LocalDataSource();

	private _selectedWarehouses: WarehouseViewModel[] = [];

	public loading: boolean;

	private dataCount: number;
	private $merchants;

	constructor(
		private readonly _translateService: TranslateService,
		private readonly _router: Router,
		private readonly _modalService: NgbModal,
		private readonly _warehousesService: WarehousesService,
		private readonly _ordersService: OrdersService,
		private readonly _toasterService: ToasterService,
		private readonly _sanitizer: DomSanitizer,
		private readonly modalService: NgbModal
	) {
		this._loadSettingsSmartTable();
	}

	get hasSelectedWarehouses(): boolean {
		return this._selectedWarehouses.length > 0;
	}

	ngAfterViewInit() {
		this._addCustomHTMLElements();
		this._applyTranslationOnSmartTable();
		this.smartTableChange();
		this._loadDataSmartTable();
	}

	createWarehouseModel() {
		this._modalService.open(WarehouseMutationComponent, {
			size: 'lg',
			container: 'nb-layout',
			backdrop: 'static',
		});
	}

	selectWarehouseTmp(ev) {
		this._selectedWarehouses = ev.selected;
	}

	async deleteSelectedRows() {
		const activeModal = this.modalService.open(ConfimationModalComponent, {
			size: 'sm',
			container: 'nb-layout',
			backdrop: 'static',
		});
		const modalComponent: ConfimationModalComponent =
			activeModal.componentInstance;

		await modalComponent.confirmEvent
			.pipe(takeUntil(modalComponent.ngDestroy$))
			.subscribe((dataEvent) => {
				const idsForDelete: string[] = this._selectedWarehouses.map(
					(w) => w.id
				);

				try {
					this.loading = true;
					this._warehousesService
						.removeByIds(idsForDelete)
						.subscribe(() => {
							this.loading = false;
							this._toasterService.pop(
								`success`,
								`Selected warehouse are deleted!`
							);
							this._selectedWarehouses = [];
						});
				} catch (error) {
					this.loading = false;

					this._toasterService.pop(
						'error',
						`Error: "${error.message}"`
					);
				}

				modalComponent.cancel();
			});
	}

	// This is just workaround to show some search icon on smart table, in the future maybe we must find better solution.
	private _addCustomHTMLElements(): any {
		document.querySelector(
			'tr.ng2-smart-filters > th:nth-child(1)'
		).innerHTML = '<i class="fa fa-search" style="font-size: 1.3em"/>';
	}

	private _selectWarehouse(warehouseId: string) {
		this._router.navigate(['/stores/' + warehouseId]);
	}

	private _applyTranslationOnSmartTable() {
		this._translateService.onLangChange
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(() => {
				this._loadSettingsSmartTable();
			});
	}

	private async _loadDataSmartTable(page = 1) {
		if (this.$merchants) {
			await this.$merchants.unsubscribe();
		}

		let warehouses: Warehouse[] = [];

		this.$merchants = this._warehousesService
			.getStores({
				skip: perPage * (page - 1),
				limit: perPage,
			})
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((w: Warehouse[]) => {
				warehouses = w;
				loadData();
			});

		const loadData = async () => {
			const merchantsOrders = await this._ordersService.getMerchantsOrdersCountInfo(
				warehouses.map((w) => w.id)
			);

			const warehousesVM = warehouses.map((warehouse) => {
				const merchantOrders = merchantsOrders.find(
					(res) => res['id'] === warehouse.id
				);

				return {
					id: warehouse.id,
					image: warehouse.logo || WarehousesComponent.noInfoSign,
					name: warehouse.name || WarehousesComponent.noInfoSign,
					email:
						warehouse.contactEmail ||
						WarehousesComponent.noInfoSign,
					phone:
						warehouse.contactPhone ||
						WarehousesComponent.noInfoSign,
					city:
						warehouse.geoLocation.city ||
						WarehousesComponent.noInfoSign,
					address: `st. ${
						warehouse.geoLocation.streetAddress ||
						WarehousesComponent.noInfoSign
					}, hse. № ${
						warehouse.geoLocation.house ||
						WarehousesComponent.noInfoSign
					}`,
					ordersQty: merchantOrders ? merchantOrders.ordersCount : 0,
					warehouseInfo: warehouse,
				};
			});

			await this.loadDataCount();

			const merchantsData = new Array(this.dataCount);

			merchantsData.splice(
				perPage * (page - 1),
				perPage,
				...warehousesVM
			);

			await this.sourceSmartTable.load(merchantsData);
		};
	}

	private _loadSettingsSmartTable() {
		const columnTitlePrefix = 'WAREHOUSES_VIEW.SMART_TABLE_COLUMNS.';
		const getTranslate = (name: string): Observable<any> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			this._translateService.get('Id'),
			getTranslate('IMAGE'),
			getTranslate('NAME'),
			getTranslate('EMAIL'),
			getTranslate('PHONE'),
			getTranslate('CITY'),
			getTranslate('ADDRESS'),
			getTranslate('ORDERS')
		)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(
				([id, image, name, email, phone, city, address, orders]) => {
					this.settingsSmartTable = {
						actions: false,
						selectMode: 'multi',
						columns: {
							images: {
								title: image,
								class: 'warehouse-image',
								type: 'custom',
								renderComponent: WarehouseImageComponent,
								onComponentInitFunction: (instance) => {
									instance.redirectPage = 'stores';
								},
								filter: false,
							},
							name: {
								title: name,
								type: 'custom',
								class: 'warehouse-name',
								renderComponent: RedirectNameComponent,
								onComponentInitFunction: (instance) => {
									instance.redirectPage = 'stores';
								},
							},
							email: {
								title: email,
								type: 'custom',
								renderComponent: WarehouseEmailComponent,
								class: 'warehouse-email',
							},
							phone: {
								title: phone,
								type: 'custom',
								renderComponent: WarehousePhoneComponent,
								class: 'warehouse-phone',
							},
							city: {
								title: city,
								class: 'warehouse-city',
							},
							address: {
								title: address,
								class: 'warehouse-address',
							},
							ordersQty: {
								title: orders,
								type: 'custom',
								filter: false,
								class: 'warehouse-qty',
								renderComponent: WarehouseOrdersNumberComponent,
								onComponentInitFunction: (instance) => {
									instance.redirectPage = 'stores';
								},
							},
							actions: {
								title: 'Actions',
								filter: false,
								type: 'custom',
								class: 'warehouse-actions',
								renderComponent: WarehouseActionsComponent,
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

	private async smartTableChange() {
		this.sourceSmartTable
			.onChanged()
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(async (event) => {
				if (event.action === 'page') {
					const page = event.paging.page;
					this._loadDataSmartTable(page);
				}
			});
	}

	private async loadDataCount() {
		this.dataCount = await this._warehousesService.getCountOfMerchants();
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
