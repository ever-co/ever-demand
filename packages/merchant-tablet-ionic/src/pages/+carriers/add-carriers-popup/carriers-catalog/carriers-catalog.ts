import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import Carrier from '@modules/server.common/entities/Carrier';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { AddressComponent } from './address.component';
import { Store } from '../../../../services/store.service';
import { first, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { forkJoin, Subject, Observable } from 'rxjs';

@Component({
	selector: 'carriers-catalog',
	templateUrl: 'carriers-catalog.html',
})
export class CarriersCatalogComponent implements OnDestroy {
	settingsSmartTable: object;
	sourceSmartTable = new LocalDataSource();
	selecteCarriers: Carrier[];
	hasChanges: EventEmitter<boolean> = new EventEmitter();

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly carrierRouter: CarrierRouter,
		private readonly warehouseRouter: WarehouseRouter,
		private readonly store: Store,
		private readonly _sanitizer: DomSanitizer,
		private readonly _translateService: TranslateService
	) {
		this._loadSettingsSmartTable();
		this._loadDataSmartTable();
	}

	selectCarriersTmp(ev) {
		this.selecteCarriers = ev.selected;
		this.hasChanges.emit();
	}

	private _loadSettingsSmartTable() {
		const columnTitlePrefix = 'CARRIERS_VIEW.CARRIERS_CATALOG.';
		const getTranslate = (name: string): Observable<string> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			getTranslate('NAME'),
			getTranslate('PHONE'),
			getTranslate('ADDRESS'),
			getTranslate('LOGO')
		)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(([name, phone, address, logo]) => {
				this.settingsSmartTable = {
					actions: false,
					selectMode: 'multi',
					columns: {
						name: { title: name },
						phone: { title: phone },
						address: {
							title: address,
							type: 'custom',
							renderComponent: AddressComponent,
						},
						logo: {
							title: logo,
							type: 'html',
							valuePrepareFunction: (_, carrier: Carrier) => {
								return this._sanitizer.bypassSecurityTrustHtml(
									`<div class='text-center'>
								<img src="${carrier.logo}" alt="Product Image" class='logo'">
							<div>`
								);
							},
							filter: false,
						},
					},
					pager: {
						display: true,
						perPage: 3,
					},
				};
			});
	}

	private async _loadDataSmartTable() {
		const warehouse = await this.warehouseRouter
			.get(this.store.warehouseId)
			.pipe(first())
			.toPromise();

		const loadData = (carriers) => {
			const carriersVM = carriers.map((c: Carrier) => {
				return {
					name: c.firstName + ' ' + c.lastName,
					phone: c.phone,
					carrier: c,
					logo: c.logo,
					id: c.id,
				};
			});

			this.sourceSmartTable.load(carriersVM);
		};

		this.carrierRouter.getAllActive().subscribe((carriers: Carrier[]) => {
			loadData(
				carriers.filter(
					(c: Carrier) => !warehouse.usedCarriersIds.includes(c.id)
				)
			);
		});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
