import { Component, Input } from '@angular/core';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { first } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';

@Component({
	selector: 'carrier-delete-popup',
	templateUrl: 'carrier-delete-popup.html',
	styleUrls: ['./carrier-delete-popup.scss'],
})
export class CarrierDeletePopupPage {
	@Input()
	carrierData: any;

	constructor(
		public modalCtrl: ModalController,
		private warehouseRouter: WarehouseRouter
	) {}

	get getWarehouseId() {
		return localStorage.getItem('_warehouseId');
	}

	cancelModal() {
		this.modalCtrl.dismiss();
	}

	async deleteCarrier() {
		const carrierId = this.carrierData.carrier.id;

		const id = this.getWarehouseId;

		const merchant = await this.warehouseRouter
			.get(id)
			.pipe(first())
			.toPromise();

		merchant.usedCarriersIds = merchant.usedCarriersIds.filter(
			(x) => x !== carrierId
		);

		await this.warehouseRouter.save(merchant);

		this.cancelModal();
	}
}
