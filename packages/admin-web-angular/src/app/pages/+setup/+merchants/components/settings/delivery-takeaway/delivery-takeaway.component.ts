import {
	Component,
	ViewChild,
	OnDestroy,
	AfterViewInit,
	Input,
	Output,
	EventEmitter,
} from '@angular/core';
import { SetupMerchantSharedCarriersComponent } from './shared-carriers/shared-carriers.component';
import {
	CarriersSmartTableComponent,
	CarrierSmartTableObject,
} from '@app/@shared/carrier/carriers-table/carriers-table.component';
import { Subject } from 'rxjs';
import { SetupMerchantAddNewCarrierComponent } from './add-new-carrier/add-new-carrier.component';
import { getDummyImage } from '@modules/server.common/utils';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';

@Component({
	selector: 'ea-merchants-setup-delivery-takeaway',
	templateUrl: './delivery-takeaway.component.html',
	styleUrls: ['./delivery-takeaway.component.scss'],
})
export class SetupMerchantDeliveryAndTakeawayComponent
	implements AfterViewInit, OnDestroy {
	@ViewChild('newCarrier')
	newCarrier: SetupMerchantAddNewCarrierComponent;
	@ViewChild('sharedCarriers')
	sharedCarriers: SetupMerchantSharedCarriersComponent;
	@ViewChild('carriersTable')
	carriersTable: CarriersSmartTableComponent;

	@Output()
	previousStep: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output()
	nextStep: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input()
	locationForm: any;

	componentViews = {
		main: 'main',
		carriersTable: 'carriersTable',
		addNewCarrier: 'addNewCarrier',
		editCarrier: 'editCarrier',
	};
	currentView = this.componentViews.main;
	carriersPerPage = 3;
	carrierId: string;

	isCarrierRequired: boolean;
	productsDelivery: boolean;
	productsTakeaway: boolean;

	restrictedCarriers: CarrierSmartTableObject[] = [];

	private ngDestroy$ = new Subject<void>();

	constructor(private carrierRouter: CarrierRouter) {}

	get haveCarriersForAdd() {
		let hasSelectedCarriers = false;

		if (this.sharedCarriers) {
			hasSelectedCarriers = this.sharedCarriers.carriersTable
				.hasSelectedCarriers;
		}

		if (this.newCarrier) {
			hasSelectedCarriers =
				this.newCarrier.form.valid &&
				this.locationForm &&
				this.locationForm.form.valid;
		}
		return hasSelectedCarriers;
	}

	get isBasicInfoValid() {
		let res = false;

		if (this.newCarrier) {
			res = this.newCarrier.basicInfoForm.form.valid;
		}

		return res;
	}

	get restrictedCarriersIds() {
		let ids = [];
		if (this.restrictedCarriers) {
			ids = this.restrictedCarriers.map((c) => c.id);
		}

		return ids;
	}

	ngAfterViewInit(): void {}

	async add() {
		if (this.currentView === this.componentViews.carriersTable) {
			const carriers = this.sharedCarriers.carriersTable.selectedCarriers
				.map((data) => data['carrier'])
				.map(CarriersSmartTableComponent.getCarrierSmartTableObject);

			this.restrictedCarriers.unshift(...carriers);
		} else if (this.currentView === this.componentViews.addNewCarrier) {
			const geoLocationInput = this.locationForm.getValue();
			geoLocationInput.loc.coordinates.reverse();

			const carrierCreateObj = {
				...this.newCarrier.basicInfoForm.getValue(),
				geoLocation: geoLocationInput,
			};

			if (!carrierCreateObj.logo) {
				const letter = carrierCreateObj.firstName
					.charAt(0)
					.toUpperCase();
				carrierCreateObj.logo = getDummyImage(300, 300, letter);
			}

			let carrier = await this.carrierRouter.register({
				carrier: carrierCreateObj,
				password: this.newCarrier.basicInfoForm.getPassword(),
			});

			this.restrictedCarriers.unshift(
				CarriersSmartTableComponent.getCarrierSmartTableObject(carrier)
			);
		}
		this.currentView = this.componentViews.main;
	}

	async save() {
		const basicInfo = this.newCarrier.basicInfoForm.getValue();

		const carrier = await this.carrierRouter.updateById(this.carrierId, {
			...basicInfo,
		});

		this.restrictedCarriers = this.restrictedCarriers.filter(
			(c) => c.id !== this.carrierId
		);
		this.restrictedCarriers.unshift(
			CarriersSmartTableComponent.getCarrierSmartTableObject(carrier)
		);
		this.carrierId = null;

		this.currentView = this.componentViews.main;
	}

	back() {
		this.currentView = this.componentViews.main;
	}

	productsDeliveryChange() {
		if (!this.productsDelivery) {
			this.restrictedCarriers = [];
		}
	}

	removeCarrier(e) {
		if (this.restrictedCarriers) {
			this.restrictedCarriers = this.restrictedCarriers.filter(
				(c) => c.id !== e.data.id
			);
		}

		this.carriersTable.loadData(this.restrictedCarriers);
	}

	editCarrier(e) {
		this.carrierId = e.data.id;
		this.currentView = this.componentViews.editCarrier;
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
