import { Component } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number';
import { environment } from 'environments/environment';
import { Store } from 'app/services/store.service';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { first } from 'rxjs/operators';
import Warehouse from '@modules/server.common/entities/Warehouse';

@Component({
	selector: 'e-cu-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
	merchant: Warehouse;

	private _ourSupportNumber = environment.SUPPORT_NUMBER;

	constructor(
		private store: Store,
		private warehouseRouter: WarehouseRouter
	) {}

	get maintenanceMode() {
		return this.store.maintenanceMode;
	}

	menuOpened() {
		this.loadMerchant();
	}

	async callUs() {
		try {
			await CallNumber.callNumber(this._ourSupportNumber, true);
		} catch (err) {
			// TODO: implement popup notification
			console.error('Call Was Unsuccessful!');
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
