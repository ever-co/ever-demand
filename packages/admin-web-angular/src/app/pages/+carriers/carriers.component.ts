import { Component, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';

import { CarriersService } from '../../@core/data/carriers.service';
import { CarrierMutationComponent } from '../../@shared/carrier/carrier-mutation';
import { Subject } from 'rxjs/Rx';
import { ToasterService } from 'angular2-toaster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { CarriersSmartTableComponent } from '@app/@shared/carrier/carriers-table/carriers-table.component';
import { takeUntil, first } from 'rxjs/operators';
import Carrier from '@modules/server.common/entities/Carrier';
import CarrierStatus from '@modules/server.common/enums/CarrierStatus';
import { TranslateService } from '@ngx-translate/core';

const perPage = 5;

@Component({
	selector: 'ea-carriers',
	templateUrl: 'carriers.component.html',
	styleUrls: ['carriers.component.scss'],
})
export class CarriersComponent implements OnDestroy, AfterViewInit {
	@ViewChild('carriersTable', { static: true })
	carriersTable: CarriersSmartTableComponent;

	loading: boolean;
	perPage = perPage;

	private dataCount: number;
	private $carriers;
	private ngDestroy$ = new Subject<void>();

	constructor(
		private readonly _carriersService: CarriersService,
		private readonly _toasterService: ToasterService,
		private readonly modalService: NgbModal,
		private readonly _translateService: TranslateService
	) {
		this._applyTranslationOnSmartTable();
	}

	openWizardNewCarrier() {
		this.modalService.open(CarrierMutationComponent, {
			size: 'lg',
			container: 'nb-layout',
			windowClass: 'ng-custom',
			backdrop: 'static',
		});
	}

	async deleteSelectedCarriers() {
		const idsForDelete: string[] = this.carriersTable.selectedCarriers.map(
			(c) => c.id
		);
		this.loading = true;

		try {
			await this._carriersService
				.removeByIds(idsForDelete)
				.pipe(first())
				.toPromise();

			this.carriersTable.selectedCarriers.forEach((carrier) =>
				this._toasterService.pop(
					`success`,
					`Carrier ${carrier['name']} DELETED`
				)
			);

			this.carriersTable.selectedCarriers = [];
			this.loading = false;
		} catch (error) {
			this.loading = false;
			this._toasterService.pop(`error`, `${error.message}`);
		}
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
			.getCarriers({
				skip: perPage * (page - 1),
				limit: perPage,
			})
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(async (data: Carrier[]) => {
				const carriersVm = data.map(
					CarriersSmartTableComponent.getCarrierSmartTableObject
				);

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

	private async loadDataCount() {
		this.dataCount = await this._carriersService.getCountOfCarriers();
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
}
