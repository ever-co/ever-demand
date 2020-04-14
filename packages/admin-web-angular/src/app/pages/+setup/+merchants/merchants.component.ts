import { Component, ViewChild } from '@angular/core';
import { SetupMerchantAccountComponent } from './components/account/account.component';
import { SetupMerchantBasicInfoComponent } from './components/basic-info/basic-info.component';
import { SetupMerchantContactInfoComponent } from './components/contact-info/contact-info.component';
import { SetupMerchantLocationComponent } from './components/location/location.component';
import { SetupMerchantPaymentsComponent } from './components/payments/payments.component';
import { SetupMerchantManufacturingComponent } from './components/manufacturing/manufacturing.component';
import { SetupMerchantDeliveryAndTakeawayComponent } from './components/settings/delivery-takeaway/delivery-takeaway.component';
import { SetupMerchantOrdersSettingsComponent } from './components/settings/orders/orders.component';
import { IWarehouseCreateObject } from '@modules/server.common/interfaces/IWarehouse';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { ToasterService } from 'angular2-toaster';
import { NbStepperComponent } from '@nebular/theme';
import Warehouse from '@modules/server.common/entities/Warehouse';

@Component({
	styleUrls: ['./merchants.component.scss'],
	templateUrl: './merchants.component.html',
})
export class SetupMerchantsComponent {
	@ViewChild('nbStepper')
	nbStepper: NbStepperComponent;

	@ViewChild('account', { static: true })
	stepAccount: SetupMerchantAccountComponent;
	@ViewChild('basicInfo', { static: true })
	stepBasicInfo: SetupMerchantBasicInfoComponent;
	@ViewChild('contactInfo', { static: true })
	stepContactInfo: SetupMerchantContactInfoComponent;
	@ViewChild('location', { static: true })
	stepLocation: SetupMerchantLocationComponent;
	@ViewChild('payments')
	stepPayments: SetupMerchantPaymentsComponent;
	@ViewChild('manufacturing')
	stepManufacturing: SetupMerchantManufacturingComponent;
	@ViewChild('deliveryAndTakeaway')
	stepDeliveryAndTakeaway: SetupMerchantDeliveryAndTakeawayComponent;
	@ViewChild('ordersSettings')
	stepOrdersSettings: SetupMerchantOrdersSettingsComponent;

	currentStore: Warehouse;

	get canCreateMerchant() {
		return (
			this.stepAccount.formValid &&
			this.stepBasicInfo.formValid &&
			this.stepContactInfo.contactInfoForm.valid &&
			this.stepLocation.location.valid
		);
	}

	constructor(
		private warehouseRouter: WarehouseRouter,
		private readonly toasterService: ToasterService
	) {}

	async createMerchant() {
		try {
			this.currentStore = await this.warehouseRouter.register(
				this.getMerchantCreateObj()
			);

			this.toasterService.pop(
				'success',
				`Warehouse ${this.currentStore.name} was created!`
			);

			this.nbStepper.next();
		} catch (error) {
			this.toasterService.pop({
				type: 'error',
				title: `Error in creating warehouse: "${error.message}"`,
				timeout: 0,
			});
		}
	}

	private getMerchantCreateObj(): {
		warehouse: IWarehouseCreateObject;
		password: string;
	} {
		let warehouse: IWarehouseCreateObject;
		let password: string;

		if (this.canCreateMerchant) {
			const geoLocationInput = this.stepLocation.locationForm.getValue();
			geoLocationInput.loc.coordinates.reverse();

			const accountModel = this.stepAccount.accountModel;

			warehouse = {
				contactEmail: accountModel.email,
				username: accountModel.username,
				...this.stepBasicInfo.basicInfoCreateObj,
				...this.stepContactInfo.contactInfoModel,
				geoLocation: geoLocationInput as GeoLocation,
				isPaymentEnabled: this.stepPayments.isPaymentEnabled,
				isManufacturing: this.stepManufacturing.isManufacturing,
				isCarrierRequired: this.stepDeliveryAndTakeaway
					.isCarrierRequired,
				productsDelivery: this.stepDeliveryAndTakeaway.productsDelivery,
				productsTakeaway: this.stepDeliveryAndTakeaway.productsTakeaway,
				hasRestrictedCarriers:
					this.stepDeliveryAndTakeaway.restrictedCarriersIds.length >
					0,
				carriersIds: this.stepDeliveryAndTakeaway.restrictedCarriersIds,
				orderBarcodeType: this.stepOrdersSettings.iorderBarcodeType,
				isActive: true,
				paymentGateways: this.stepPayments.paymentsGateways,
			};

			password = accountModel.password;
		}
		return { warehouse, password };
	}
}
