import { Injectable } from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import Device from '@modules/server.common/entities/Device';
import { TranslateService } from '@ngx-translate/core';
import Carrier from '@modules/server.common/entities/Carrier';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import { first } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import IOrder from '@modules/server.common/interfaces/IOrder';

// TODO use https://beta.ionicframework.com/docs/building/storage

@Injectable()
export class Store {
	private _selectedOrder: IOrder;

	constructor(
		private readonly carrierRouter: CarrierRouter,
		private readonly translate: TranslateService // private readonly platform: Platform
	) {
		// this._initLanguage();
	}

	selectedOrder$: BehaviorSubject<IOrder> = new BehaviorSubject(
		this.selectedOrder
	);

	set selectedOrder(order: IOrder) {
		this.selectedOrder$.next(order);
		this._selectedOrder = order;
	}

	get selectedOrder(): IOrder {
		return this._selectedOrder;
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

	get carrierId(): string | null {
		return localStorage.getItem('carrier') || null;
	}

	set carrierId(id: Carrier['id'] | null) {
		if (id == null) {
			localStorage.removeItem('carrier');
		} else {
			localStorage.setItem('carrier', id);
		}
	}

	get orderId(): string | null {
		return localStorage.getItem('orderId') || null;
	}

	set orderId(id: Order['id'] | null) {
		if (id == null) {
			localStorage.removeItem('orderId');
		} else {
			localStorage.setItem('orderId', id);
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

	get language(): ILanguage {
		return (localStorage.getItem('_language') as ILanguage) || null;
	}

	set language(language: ILanguage) {
		if (language == null) {
			localStorage.removeItem('_language');
		} else {
			localStorage.setItem('_language', language);
		}

		this.translate.use(language.substr(0, 2));
	}

	get maintenanceMode(): string | null {
		return localStorage.getItem('maintenanceMode') || null;
	}

	get noInternet(): string | null {
		return localStorage.getItem('noInternet') || null;
	}

	set noInternet(text) {
		localStorage.setItem('noInternet', text);
	}

	get serverConnection() {
		return localStorage.getItem('serverConnection');
	}

	set serverConnection(val: string) {
		localStorage.setItem('serverConnection', val);
	}

	get showInformationPage() {
		return (
			this.noInternet ||
			this.maintenanceMode ||
			Number(this.serverConnection) === 0
		);
	}

	set returnProductFrom(val: string) {
		localStorage.setItem('returnProductFrom', val);
	}

	get returnProductFrom() {
		return localStorage.getItem('returnProductFrom');
	}

	set driveToWarehouseFrom(val: string) {
		localStorage.setItem('driveToWarehouseFrom', val);
	}

	get driveToWarehouseFrom() {
		return localStorage.getItem('driveToWarehouseFrom');
	}

	async isLogged() {
		const carrierId = this.carrierId;
		if (carrierId) {
			try {
				await this.carrierRouter
					.get(carrierId)
					.pipe(first())
					.toPromise();
				return true;
			} catch (error) {}
		}
		console.warn(`Carrier with id '${carrierId}' does not exists!"`);
		return false;
	}

	clearMaintenanceMode() {
		localStorage.removeItem('maintenanceMode');
	}

	clearNoInternet() {
		localStorage.removeItem('noInternet');
	}

	clear() {
		localStorage.clear();
	}
}
