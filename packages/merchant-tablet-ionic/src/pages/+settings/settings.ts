import { Component } from '@angular/core';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { Store } from '../../../src/services/store.service';

@Component({
	selector: 'page-settings',
	templateUrl: 'settings.html',
	styleUrls: ['./settings.scss'],
})
export class SettingsPage {
	selectedSegment: any = 'account';

	public _currWarehouse: Warehouse;

	constructor(
		private warehouseRouter: WarehouseRouter,
		private store: Store
	) {
		this.getLocalWarehouse();
	}

	get isLogged() {
		return localStorage.getItem('_warehouseId');
	}

	get isBrowser() {
		return localStorage.getItem('_platform') === 'browser';
	}

	async ionViewCanEnter() {
		const isLogged = await this.store.isLogged();

		return this.store.maintenanceMode === null && isLogged;
	}

	getLocalWarehouse() {
		this.warehouseRouter
			.get(localStorage.getItem('_warehouseId'))
			.subscribe((warehouse) => {
				this._currWarehouse = warehouse;
			});
	}
}
