import { Injectable } from '@angular/core';
import Device from '@modules/server.common/entities/Device';
import { TranslateService } from '@ngx-translate/core';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { first } from 'rxjs/operators';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';

// TODO use https://beta.ionicframework.com/docs/building/storage

@Injectable()
export class Store {
	constructor(
		private readonly translate: TranslateService, // private readonly platform: Platform
		private warehouseRouter: WarehouseRouter
	) {
		// this._initLanguage();
	}

	get token(): string | null {
		return localStorage.getItem('token') || null;
	}

	set token(token: string) {
		if (token == null) {
			localStorage.removeItem('token');
		} else {
			localStorage.setItem('token', token);
		}
	}

	get warehouseId(): string | null {
		return localStorage.getItem('_warehouseId') || null;
	}

	set warehouseId(id: Warehouse['id'] | null) {
		if (id == null) {
			localStorage.removeItem('_warehouseId');
		} else {
			localStorage.setItem('_warehouseId', id);
		}
	}

	get deviceId(): string | null {
		return localStorage.getItem('_deviceId') || null;
	}

	set deviceId(id: Device['id'] | null) {
		if (id == null) {
			localStorage.removeItem('_deviceId');
		} else {
			localStorage.setItem('_deviceId', id);
		}
	}

	get platform(): string | null {
		return localStorage.getItem('_platform') || null;
	}

	set platform(type: string | null) {
		if (type == null) {
			localStorage.removeItem('_platform');
		} else {
			localStorage.setItem('_platform', type);
		}
	}

	get language(): string {
		return localStorage.getItem('_language') || null;
	}

	set language(language: string) {
		if (language == null) {
			localStorage.removeItem('_language');
		} else {
			localStorage.setItem('_language', language);
		}

		this.translate.use(language);
	}

	get maintenanceMode(): string | null {
		return localStorage.getItem('maintenanceMode') || null;
	}

	get serverConnection() {
		return localStorage.getItem('serverConnection');
	}

	set serverConnection(val: string) {
		localStorage.setItem('serverConnection', val);
	}

	async isLogged() {
		const merchantId = this.warehouseId;
		if (merchantId) {
			try {
				await this.warehouseRouter
					.get(merchantId, false)
					.pipe(first())
					.toPromise();
				return true;
			} catch (error) {}
		}
		console.warn(`Store with id '${merchantId}' does not exists!"`);
		return false;
	}

	clearMaintenanceMode() {
		localStorage.removeItem('maintenanceMode');
	}

	clear() {
		localStorage.clear();
	}
}
