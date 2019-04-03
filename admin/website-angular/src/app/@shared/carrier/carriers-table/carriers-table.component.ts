import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService } from '@ngx-translate/core';
import { CarrierImageComponent } from 'app/@shared/render-component/carriers-table/carrier-image/carrier-image.component';
import { RedirectNameComponent } from 'app/@shared/render-component/name-redirect/name-redirect.component';
import { CarrierPhoneComponent } from 'app/@shared/render-component/carriers-table/carrier-phone/carrier-phone.component';
import { Observable, forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CarriersService } from 'app/@core/data/carriers.service';
import Carrier from '@modules/server.common/entities/Carrier';
import CarrierStatus from '@modules/server.common/enums/CarrierStatus';
import { CarrierActionsComponent } from 'app/@shared/render-component/carriers-table/carrier-actions/carrier-actions.component';

const perPage = 5;

@Component({
	selector: 'ea-carriers-smart-table',
	templateUrl: 'carriers-table.component.html',
	styleUrls: ['carriers-table.component.scss']
})
export class CarriersSmartTableComponent implements OnDestroy, AfterViewInit {
	static noInfoSign = '';

	settingsSmartTable: any;
	sourceSmartTable = new LocalDataSource();
	selectedCarriers: Carrier[] = [];

	private dataCount: number;
	private $carriers;
	private ngDestroy$ = new Subject<void>();

	constructor(
		private readonly _translateService: TranslateService,
		private readonly _carriersService: CarriersService
	) {
		this._loadSettingsSmartTable();
		this._loadDataSmartTable();
		this._applyTranslationOnSmartTable();
	}

	get hasSelectedCarriers(): boolean {
		return this.selectedCarriers.length > 0;
	}

	ngAfterViewInit() {
		this._addCustomHTMLElements();
		this.smartTableChange();
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}

	selectCarrierTmp(ev) {
		this.selectedCarriers = ev.selected;
	}

	// This is just workaround to show some search icon on smart table, in the future maybe we must find better solution.
	private _addCustomHTMLElements(): any {
		document.querySelector(
			'tr.ng2-smart-filters > th:nth-child(1)'
		).innerHTML = '<i class="fa fa-search" style="font-size: 1.3em"/>';
	}

	private async _loadDataSmartTable(page = 1) {
		if (this.$carriers) {
			await this.$carriers.unsubscribe();
		}

		this.$carriers = this._carriersService
			.getCarriers({
				skip: perPage * (page - 1),
				limit: perPage
			})
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(async (data: Carrier[]) => {
				const carriersVm = data.map((c) => {
					return {
						id: c.id,
						image: c.logo || CarriersSmartTableComponent.noInfoSign,
						name: `${c.firstName ||
							CarriersSmartTableComponent.noInfoSign} ${c.lastName ||
							CarriersSmartTableComponent.noInfoSign}`,
						phone:
							c.phone || CarriersSmartTableComponent.noInfoSign,
						status: {
							[CarrierStatus.Offline]: 'Offline',
							[CarrierStatus.Online]: 'Online',
							[CarrierStatus.Blocked]: 'Blocked'
						}[c.status],
						address: `${c.geoLocation.city ||
							CarriersSmartTableComponent.noInfoSign} st. ${c
							.geoLocation.streetAddress ||
							CarriersSmartTableComponent.noInfoSign}, hse. № ${c
							.geoLocation.house ||
							CarriersSmartTableComponent.noInfoSign}`,
						deliveries: c.numberOfDeliveries
					};
				});

				await this.loadDataCount();

				const carriersData = new Array(this.dataCount);

				carriersData.splice(
					perPage * (page - 1),
					perPage,
					...carriersVm
				);

				await this.sourceSmartTable.load(carriersData);
			});
	}

	private _loadSettingsSmartTable() {
		const columnTitlePrefix = 'CARRIERS_VIEW.SMART_TABLE_COLUMNS.';
		const getTranslate = (name: string): Observable<string | any> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			this._translateService.get('Id'),
			getTranslate('IMAGE'),
			getTranslate('NAME'),
			getTranslate('PHONE'),
			getTranslate('STATUS'),
			getTranslate('ADDRESS'),
			getTranslate('DELIVERIES')
		)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(
				([id, image, name, phone, status, address, deliveries]) => {
					this.settingsSmartTable = {
						actions: false,
						selectMode: 'multi',
						columns: {
							images: {
								title: image,
								class: 'carrier-image',
								type: 'custom',
								renderComponent: CarrierImageComponent,
								onComponentInitFunction: (instance) => {
									instance.redirectPage = 'carriers';
								},
								filter: false
							},
							name: {
								title: name,
								type: 'custom',
								renderComponent: RedirectNameComponent,
								onComponentInitFunction: (instance) => {
									instance.redirectPage = 'carriers';
								}
							},
							phone: {
								title: phone,
								type: 'custom',
								renderComponent: CarrierPhoneComponent
							},
							status: { title: status },
							address: { title: address },
							deliveries: { title: deliveries, filter: false },
							actions: {
								title: 'Actions',
								filter: false,
								type: 'custom',
								renderComponent: CarrierActionsComponent
							}
						},
						pager: {
							display: true,
							perPage
						}
					};
				}
			);
	}

	private _applyTranslationOnSmartTable() {
		this._translateService.onLangChange.subscribe(() => {
			this._loadSettingsSmartTable();
			this._loadDataSmartTable();
		});
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
		this.dataCount = await this._carriersService.getCountOfCarriers();
	}
}
