import {
	Component,
	OnDestroy,
	AfterViewInit,
	Input,
	OnInit,
	EventEmitter,
	Output,
} from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService } from '@ngx-translate/core';
import { CarrierImageComponent } from '@app/@shared/render-component/carriers-table/carrier-image/carrier-image.component';
import { RedirectNameComponent } from '@app/@shared/render-component/name-redirect/name-redirect.component';
import { CarrierPhoneComponent } from '@app/@shared/render-component/carriers-table/carrier-phone/carrier-phone.component';
import { Observable, forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Carrier from '@modules/server.common/entities/Carrier';
import { CarrierActionsComponent } from '@app/@shared/render-component/carriers-table/carrier-actions/carrier-actions.component';
import CarrierStatus from '@modules/server.common/enums/CarrierStatus';

export interface CarrierSmartTableObject {
	id: string;
	image: string;
	name: string;
	phone: string;
	status: string;
	address: string;
	deliveries: number;
}

@Component({
	selector: 'ea-carriers-smart-table',
	templateUrl: 'carriers-table.component.html',
	styleUrls: ['carriers-table.component.scss'],
})
export class CarriersSmartTableComponent
	implements OnDestroy, OnInit, AfterViewInit {
	static noInfoSign = '';

	@Input()
	perPage: number;
	@Input()
	selectMode = 'multi';
	@Input()
	actions: string = '';
	@Input()
	redirectPage = 'carriers';
	@Input()
	loadWholeData: CarrierSmartTableObject[];

	@Output()
	editRow = new EventEmitter();
	@Output()
	deleteRow = new EventEmitter();

	pageChange: EventEmitter<number> = new EventEmitter();

	settingsSmartTable: any;
	sourceSmartTable = new LocalDataSource();
	selectedCarriers: Carrier[] = [];

	private ngDestroy$ = new Subject<void>();

	constructor(private readonly _translateService: TranslateService) {}

	get hasSelectedCarriers(): boolean {
		return this.selectedCarriers.length > 0;
	}

	ngOnInit(): void {
		this.loadSettingsSmartTable(this.perPage);
	}

	ngAfterViewInit() {
		if (this.loadWholeData) {
			this.loadData(this.loadWholeData);
		} else {
			this.smartTableChange();
		}
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}

	selectCarrierTmp(ev) {
		this.selectedCarriers = ev.selected;
	}

	async loadData(carriersData: CarrierSmartTableObject[]) {
		await this.sourceSmartTable.load(carriersData);
	}

	loadSettingsSmartTable(perPage) {
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
						selectMode: this.selectMode,
						mode: 'external',
						actions: this.actions === 'show' && {
							add: false,
						},
						edit: {
							editButtonContent: '<i class="ion-md-create"></i>',
						},
						delete: {
							deleteButtonContent: '<i class="ion-md-trash"></i>',
							confirmDelete: true,
						},

						columns: {
							images: {
								title: image,
								class: 'carrier-image',
								type: 'custom',
								renderComponent: CarrierImageComponent,
								onComponentInitFunction: (instance) => {
									instance.redirectPage = this.redirectPage;
								},
								filter: false,
							},
							name: {
								title: name,
								type: 'custom',
								renderComponent: RedirectNameComponent,
								onComponentInitFunction: (instance) => {
									instance.redirectPage = this.redirectPage;
								},
							},
							phone: {
								title: phone,
								type: 'custom',
								renderComponent: CarrierPhoneComponent,
							},
							status: { title: status },
							address: { title: address },
							deliveries: { title: deliveries, filter: false },
							actions: {
								title: 'Actions',
								filter: false,
								type: 'custom',
								renderComponent: CarrierActionsComponent,
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

					this.pageChange.emit(page);
				}
			});
	}

	static getCarrierSmartTableObject(c: Carrier) {
		return {
			id: c.id,
			image: c.logo || CarriersSmartTableComponent.noInfoSign,
			name: `${c.firstName || CarriersSmartTableComponent.noInfoSign} ${
				c.lastName || CarriersSmartTableComponent.noInfoSign
			}`,
			phone: c.phone || CarriersSmartTableComponent.noInfoSign,
			status: {
				[CarrierStatus.Offline]: 'Offline',
				[CarrierStatus.Online]: 'Online',
				[CarrierStatus.Blocked]: 'Blocked',
			}[c.status],
			address: `${
				c.geoLocation.city || CarriersSmartTableComponent.noInfoSign
			} st. ${
				c.geoLocation.streetAddress ||
				CarriersSmartTableComponent.noInfoSign
			}, hse. № ${
				c.geoLocation.house || CarriersSmartTableComponent.noInfoSign
			}`,
			deliveries: c.numberOfDeliveries,
			carrier: c,
		};
	}
}
