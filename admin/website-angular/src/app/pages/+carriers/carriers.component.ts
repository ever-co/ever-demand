import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import Carrier from '@modules/server.common/entities/Carrier';
import CarrierStatus from '@modules/server.common/enums/CarrierStatus';
import { CarriersService } from '../../@core/data/carriers.service';
import { CarrierMutationComponent } from '../../@shared/carrier/carrier-mutation';
import { Observable, forkJoin } from 'rxjs';
import { Subject } from 'rxjs/Rx';
import { ToasterService } from 'angular2-toaster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { RedirectNameComponent } from '../../@shared/render-component/name-redirect.component';
import { CarrierActionsComponent } from '../../@shared/render-component/carriers-table/carrier-actions.component';
import { CarrierImageComponent } from '../../@shared/render-component/carriers-table/carrier-image/carrier-image.component';
import { CarrierPhoneComponent } from '../../@shared/render-component/carriers-table/carrier-phone/carrier-phone.component';
import { CarrierMapComponent } from './+carrier/carrier-map/carrier-map.component';

const perPage = 5;

@Component({
	selector: 'ea-carriers',
	templateUrl: 'carriers.component.html',
	styleUrls: ['carriers.component.scss']
})
export class CarriersComponent implements OnDestroy, AfterViewInit {
	private ngDestroy$ = new Subject<void>();

	static noInfoSign = '';

	protected carriers: Carrier[];
	protected settingsSmartTable: any;
	protected sourceSmartTable = new LocalDataSource();

	private _selectedCarriers: Carrier[] = [];

	private dataCount: number;
	private $carriers;

	public Offline: string = 'Offline';
	public Online: string = 'Online';

	public loading: boolean;

	constructor(
		private readonly _translateService: TranslateService,
		private readonly _carriersService: CarriersService,
		private readonly _sanitizer: DomSanitizer,
		private readonly _router: Router,
		private readonly _toasterService: ToasterService,
		private readonly modalService: NgbModal
	) {
		this._loadSettingsSmartTable();
		this._loadDataSmartTable();
		this._applyTranslationOnSmartTable();
	}

	ngAfterViewInit() {
		this._addCustomHTMLElements();
		this.smartTableChange();
	}

	protected get hasSelectedCarriers(): boolean {
		return this._selectedCarriers.length > 0;
	}

	protected selectCarrierTmp(ev) {
		this._selectedCarriers = ev.selected;
	}

	protected openWizardNewCarrier() {
		this.modalService.open(CarrierMutationComponent, {
			size: 'lg',
			container: 'nb-layout',
			windowClass: 'ng-custom',
			backdrop: 'static'
		});
	}

	protected deleteSelectedCarriers() {
		const idsForDelete: string[] = this._selectedCarriers.map((c) => c.id);
		this.loading = true;

		try {
			this._carriersService.removeByIds(idsForDelete).subscribe(() => {
				this._selectedCarriers.forEach((carrier) =>
					this._toasterService.pop(
						`success`,
						`Carrier ${carrier['name']} DELETED`
					)
				);
				this._selectedCarriers = [];
			});
			this.loading = false;
		} catch (error) {
			this.loading = false;
			this._toasterService.pop(`error`, `${error.message}`);
		}
	}

	protected revealSelectedCarriers() {
		this.modalService.open(CarrierMapComponent, {
			size: 'lg',
			container: 'nb-layout',
			windowClass: 'ng-custom'
			//backdrop: 'static'
		});
	}

	private _applyTranslationOnSmartTable() {
		this._translateService.onLangChange.subscribe(() => {
			this._loadSettingsSmartTable();
			this._loadDataSmartTable();
		});
	}

	// This is just workaround to show some search icon on smart table, in the future maybe we must find better solution.
	private _addCustomHTMLElements(): any {
		document.querySelector(
			'tr.ng2-smart-filters > th:nth-child(1)'
		).innerHTML = '<i class="fa fa-search" style="font-size: 1.3em"/>';
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
						image: c.logo || CarriersComponent.noInfoSign,
						name: `${c.firstName ||
							CarriersComponent.noInfoSign} ${c.lastName ||
							CarriersComponent.noInfoSign}`,
						phone: c.phone || CarriersComponent.noInfoSign,
						status: {
							[CarrierStatus.Offline]: 'Offline',
							[CarrierStatus.Online]: 'Online',
							[CarrierStatus.Blocked]: 'Blocked'
						}[c.status],
						address: `${c.geoLocation.city ||
							CarriersComponent.noInfoSign} st. ${c.geoLocation
							.streetAddress ||
							CarriersComponent.noInfoSign}, hse. № ${c
							.geoLocation.house ||
							CarriersComponent.noInfoSign}`,
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

	// private async _loadDataSmartTable() {
	// 	let resultTr = await this._translateService
	// 		.get('CATEGORY')
	// 		.pipe(first())
	// 		.toPromise();

	// 	let carriersAll: Carrier[] = [];

	// 	let loadData = async () => {
	// 		let ordersByUserId: { [id: string]: Carrier[] } = _.groupBy(
	// 			carriersAll
	// 			// (o) => o.user._id
	// 		);

	// 		let carriersVm = carriersAll.map((c) => {
	// 			return {
	// 				id: c.id,
	// 				image: c.logo || CarriersComponent.noInfoSign,
	// 				name: `${c.firstName ||
	// 					CarriersComponent.noInfoSign} ${c.lastName ||
	// 					CarriersComponent.noInfoSign}`,
	// 				phone: c.phone || CarriersComponent.noInfoSign,
	// 				status: {
	// 					[CarrierStatus.Offline]: 'Offline',
	// 					[CarrierStatus.Online]: resultTr
	// 				}[c.status],
	// 				address: `${c.geoLocation.city ||
	// 					CarriersComponent.noInfoSign} st. ${c.geoLocation
	// 					.streetAddress ||
	// 					CarriersComponent.noInfoSign}, hse. № ${c.geoLocation
	// 					.house || CarriersComponent.noInfoSign}`,
	// 				deliveries: c.numberOfDeliveries
	// 			};
	// 		});

	// 		await this.sourceSmartTable.load(carriersVm);
	// 	};

	// 	this._carriersService
	// 		.getCarriers()
	// 		.pipe(takeUntil(this.ngDestroy$))
	// 		.subscribe(async (carrier: Carrier[]) => {
	// 			carriersAll = carrier;
	// 			await loadData();
	// 		});
	// }

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

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
