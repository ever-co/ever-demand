import {
	Component,
	ViewChild,
	OnDestroy,
	AfterViewInit,
	Input
} from '@angular/core';
import Carrier from '@modules/server.common/entities/Carrier';
import { CarriersSmartTableComponent } from 'app/@shared/carrier/carriers-table/carriers-table.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { CarriersService } from 'app/@core/data/carriers.service';
import CarrierStatus from '@modules/server.common/enums/CarrierStatus';

const perPage = 5;

@Component({
	selector: 'ea-merchants-setup-shared-carriers',
	templateUrl: './shared-carriers.component.html'
})
export class SetupMerchantSharedCarriersComponent
	implements OnDestroy, AfterViewInit {
	@ViewChild('carriersTable')
	carriersTable: CarriersSmartTableComponent;

	@Input()
	existedCarriersIds: string[] = [];

	perPage = perPage;

	private dataCount: number;
	private $carriers;
	private ngDestroy$ = new Subject<void>();

	constructor(
		private readonly _translateService: TranslateService,
		private readonly _carriersService: CarriersService
	) {
		this._applyTranslationOnSmartTable();
	}

	ngAfterViewInit(): void {
		this._loadDataSmartTable();
		this.smartTablePageChange();
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}

	private async _loadDataSmartTable(page = 1) {
		if (this.$carriers) {
			await this.$carriers.unsubscribe();
		}

		this.$carriers = this._carriersService
			.getCarriers(
				{
					skip: perPage * (page - 1),
					limit: perPage
				},
				{
					isSharedCarrier: true,
					_id: {
						$nin: this.existedCarriersIds
					}
				}
			)
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

				await this.carriersTable.loadData(carriersData);
			});
	}

	private _applyTranslationOnSmartTable() {
		this._translateService.onLangChange
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(() => {
				if (this.carriersTable) {
					this.carriersTable.loadSettingsSmartTable(this.perPage);
					this._loadDataSmartTable();
				}
			});
	}

	private async smartTablePageChange() {
		if (this.carriersTable) {
			this.carriersTable.pageChange
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe((page) => {
					this._loadDataSmartTable(page);
				});
		}
	}

	private async loadDataCount() {
		this.dataCount = await this._carriersService.getCountOfCarriers({
			isSharedCarrier: true,
			_id: {
				$nin: this.existedCarriersIds
			}
		});
	}
}
