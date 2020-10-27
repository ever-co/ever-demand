import { Injectable } from '@angular/core';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import Order from '@modules/server.common/entities/Order';
import Device from '@modules/server.common/entities/Device';
import User from '@modules/server.common/entities/User';
import InviteRequest from '@modules/server.common/entities/InviteRequest';
import { TranslateService } from '@ngx-translate/core';
import { Globalization } from '@ionic-native/globalization';
import { Platform } from '@ionic/angular';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { first } from 'rxjs/operators';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';

// TODO use https://beta.ionicframework.com/docs/building/storage

@Injectable({
	providedIn: 'root',
})
export class Store {
	constructor(
		private readonly _translateService: TranslateService,
		private readonly platform: Platform,
		private readonly inviteRouter: InviteRouter,
		private readonly userRouter: UserRouter
	) {
		this._initLanguage();
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

	get inviteRequestId(): InviteRequest['id'] | null {
		return localStorage.getItem('_inviteRequestId') || null;
	}

	set inviteRequestId(id: InviteRequest['id'] | null) {
		if (id == null) {
			localStorage.removeItem('_inviteRequestId');
		} else {
			localStorage.setItem('_inviteRequestId', id);
		}
	}

	get userId(): User['id'] | null {
		return localStorage.getItem('_userId') || null;
	}

	set userId(id: User['id'] | null) {
		if (id == null) {
			localStorage.removeItem('_userId');
		} else {
			localStorage.setItem('_userId', id);
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

	get orderId(): Order['id'] | null {
		return localStorage.getItem('_orderId') || null;
	}

	set orderId(id: Order['id'] | null) {
		if (id == null) {
			localStorage.removeItem('_orderId');
		} else {
			localStorage.setItem('_orderId', id);
		}
	}

	get language(): ILanguage {
		return this._translateService.currentLang as ILanguage;
	}

	set language(l: ILanguage) {
		if (l == null) {
			localStorage.removeItem('_language');
		} else {
			localStorage.setItem('_language', l);
		}

		this._translateService.use(l);
	}

	get orderWarehouseId(): Order['warehouseId'] | null {
		return localStorage.getItem('_currOrderWarehouseId') || null;
	}

	set orderWarehouseId(id: Order['warehouseId'] | null) {
		if (id == null) {
			localStorage.removeItem('_currOrderWarehouseId');
		} else {
			localStorage.setItem('_currOrderWarehouseId', id);
		}
	}

	get inviteSystem(): boolean {
		const isEnabled = localStorage.getItem('_inviteSystem') === 'enabled';
		return isEnabled;
	}

	set inviteSystem(isEndabled: boolean) {
		const inviteSystem = isEndabled ? 'enabled' : 'disabled';
		localStorage.setItem('_inviteSystem', inviteSystem);
	}

	get registrationSystem(): string {
		return localStorage.getItem('_registrationSystem');
	}

	set registrationSystem(registrationRequiredOnStart: string) {
		localStorage.setItem(
			'_registrationSystem',
			registrationRequiredOnStart
		);
	}

	get buyProduct(): string {
		return localStorage.getItem('_buyProduct');
	}

	set buyProduct(warehouseProductId: string) {
		localStorage.setItem('_buyProduct', warehouseProductId);
	}

	get backToDetails(): string {
		return localStorage.getItem('_backToDetails');
	}

	set backToDetails(warehouseProductId: string) {
		localStorage.setItem('_backToDetails', warehouseProductId);
	}

	get warehouseId(): string {
		return localStorage.getItem('_warehouseId');
	}

	set warehouseId(warehouseId: string) {
		localStorage.setItem('_warehouseId', warehouseId);
	}

	get maintenanceMode(): string | null {
		return localStorage.getItem('maintenanceMode') || null;
	}

	get deliveryType(): number {
		return Number(localStorage.getItem('deliveryType'));
	}

	set deliveryType(deliveryType: number) {
		localStorage.setItem('deliveryType', deliveryType.toString());
	}

	get startOrderDate() {
		return localStorage.getItem('startDate');
	}

	set startOrderDate(val: string) {
		localStorage.setItem('startDate', JSON.stringify(val));
	}

	get endOrderTime() {
		return localStorage.getItem('endTime');
	}

	set endOrderTime(val: string) {
		localStorage.setItem('endTime', JSON.stringify(val));
	}

	get inviteAddress() {
		return localStorage.getItem('inviteAddress');
	}

	set inviteAddress(val: string) {
		localStorage.setItem('inviteAddress', val);
	}

	get serverConnection() {
		return localStorage.getItem('serverConnection');
	}

	set serverConnection(val: string) {
		localStorage.setItem('serverConnection', val);
	}

	get inStore() {
		return localStorage.getItem('inStore');
	}

	set inStore(val: string) {
		localStorage.setItem('inStore', val);
	}

	get shoppingCartData() {
		return localStorage.getItem('shoppingCartData');
	}

	set shoppingCartData(val: string) {
		localStorage.setItem('shoppingCartData', val);
	}

	clearInStore() {
		localStorage.removeItem('inStore');
	}

	clearMaintenanceMode() {
		localStorage.removeItem('maintenanceMode');
	}

	clear() {
		localStorage.clear();
	}

	async isLogged() {
		const userId = this.userId;

		if (userId) {
			try {
				await this.userRouter.get(userId).pipe(first()).toPromise();
				return true;
			} catch (error) {
				this.userId = null;
			}
		}

		console.warn(`User with id '${userId}' does not exists!"`);
		return false;
	}

	private async _initLanguage() {
		const lang = (localStorage.getItem('_language') as ILanguage) || null;
		const langs = { he: 'he-IL', ru: 'ru-RU', bg: 'bg-BG', en: 'en-US' };
		// This 4 lines is here because of bug => without this lines, lang translation doesn't work.
		// (The bug is unknown)
		this._translateService.use(langs.he);
		this._translateService.use(langs.ru);
		this._translateService.use(langs.bg);
		this._translateService.use(langs.en);
		this._translateService.resetLang(langs.en);

		if (lang) {
			this._translateService.use(lang);
		} else {
			const browserLang = this.platform.is('cordova')
				? (await Globalization.getPreferredLanguage()).value
				: this._translateService.getBrowserLang();
			if (langs[browserLang]) {
				this._translateService.use(langs[browserLang]);
			} else {
				this._translateService.use(langs.en);
			}
		}
	}
}
