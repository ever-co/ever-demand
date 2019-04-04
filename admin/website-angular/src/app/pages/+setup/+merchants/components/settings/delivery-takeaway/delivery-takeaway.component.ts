import { Component, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { SetupMerchantSharedCarriersComponent } from './shared-carriers/shared-carriers.component';
import Carrier from '@modules/server.common/entities/Carrier';
import {
	CarriersSmartTableComponent,
	CarrierSmartTableObject
} from 'app/@shared/carrier/carriers-table/carriers-table.component';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'ea-merchants-setup-delivery-takeaway',
	templateUrl: './delivery-takeaway.component.html',
	styleUrls: ['./delivery-takeaway.component.scss']
})
export class SetupMerchantDeliveryAndTakeawayComponent
	implements AfterViewInit, OnDestroy {
	@ViewChild('sharedCarriers')
	sharedCarriers: SetupMerchantSharedCarriersComponent;
	@ViewChild('carriersTable')
	carriersTable: CarriersSmartTableComponent;

	componentViews = {
		main: 'main',
		carriersTable: 'carriersTable'
	};
	currentView = this.componentViews.main;
	carriersPerPage = 3;

	isCarrierRequired: boolean;
	productsDelivery: boolean;
	productsTakeaway: boolean;

	restrictedCarriers: CarrierSmartTableObject[] = [];

	private ngDestroy$ = new Subject<void>();

	constructor(private readonly translateService: TranslateService) {}

	get haveCarriersForAdd() {
		let hasSelectedCarriers = false;

		if (this.sharedCarriers) {
			hasSelectedCarriers = this.sharedCarriers.carriersTable
				.hasSelectedCarriers;
		}
		return hasSelectedCarriers;
	}

	get restrictedCarriersIds() {
		let ids = [];
		if (this.restrictedCarriers) {
			ids = this.restrictedCarriers.map((c) => c.id);
		}

		return ids;
	}

	ngAfterViewInit(): void {
		this.applyTranslationOnSmartTable();
	}

	async add() {
		if (this.currentView === this.componentViews.carriersTable) {
			const carriers = this.sharedCarriers.carriersTable.selectedCarriers.map(
				this.getCarrierSmartTableObject
			);

			this.restrictedCarriers.push(...carriers);
		}
		this.currentView = this.componentViews.main;

		await this.loadCarriersTable();
	}

	back() {
		this.currentView = this.componentViews.main;
	}

	productsDeliveryChange() {
		if (!this.productsDelivery) {
			this.restrictedCarriers = [];
		}
	}

	private async loadCarriersTable() {
		if (this.restrictedCarriers && this.restrictedCarriers.length > 0) {
			await this.carriersTable.loadData(this.restrictedCarriers);
		}
	}

	private getCarrierSmartTableObject(carriers: Carrier) {
		return {
			id: carriers.id,
			image: carriers['image'],
			name: carriers['name'],
			phone: carriers.phone,
			status: carriers.status.toString(),
			address: carriers['address'],
			deliveries: carriers['deliveries']
		};
	}

	private applyTranslationOnSmartTable() {
		this.translateService.onLangChange
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(() => {
				if (this.carriersTable) {
					this.carriersTable.loadSettingsSmartTable();
					this.loadCarriersTable();
				}
			});
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
