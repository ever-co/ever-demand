import { Component, EventEmitter } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number';
import { environment } from 'environments/environment';
import { Store } from 'app/services/store.service';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { first } from 'rxjs/operators';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { ModalController } from '@ionic/angular';
import { CallPage } from 'app/pages/+products/+order/+call/call.page';

@Component({
	selector: 'e-cu-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
	merchant: Warehouse;

	private _ourSupportNumber = environment.SUPPORT_NUMBER;

	public modalChange: EventEmitter<boolean>;

	constructor(
		private store: Store,
		private warehouseRouter: WarehouseRouter,
		public modalController: ModalController
	) {}

	get maintenanceMode() {
		return this.store.maintenanceMode;
	}

	menuOpened() {
		this.loadMerchant();
	}

	hasPhoneNumber() {
		return this._ourSupportNumber !== '' ? true : false;
	}

	async callUs() {
		try {
			await CallNumber.callNumber(this._ourSupportNumber, true);
		} catch (err) {
			// TODO: implement popup notification
			if (err) {
				const modal = this.modalController.create({
					component: CallPage,
					cssClass: 'order-info-modal',
					componentProps: { modalChange: this.modalChange },
				});
				return (await modal).present();
			}
			// console.error('Call Was Unsuccessful!');
		}
	}

	private async loadMerchant() {
		if (this.store.inStore) {
			this.merchant = await this.warehouseRouter
				.get(this.store.inStore, false)
				.pipe(first())
				.toPromise();
		} else {
			this.merchant = null;
		}
	}
}
