import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
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
import { environment } from 'environments/environment';

// TODO use https://beta.ionicframework.com/docs/building/storage

// The languages the shop ships in src/assets/i18n.
const shopLanguages: ILanguage[] = [
	'en-US',
	'bg-BG',
	'he-IL',
	'ru-RU',
	'es-ES',
	'fr-FR',
];

// The language, when the shop ships it.
function shippedLanguage(
	language: string | null | undefined
): ILanguage | null {
	return (
		shopLanguages.find((shopLanguage) => shopLanguage === language) || null
	);
}

// The shipped language for a device language such as 'he', 'he-IL' or
// 'fr_CA'.
function shippedDeviceLanguage(
	language: string | null | undefined
): ILanguage | null {
	const code = (language || '').split(/[-_]/)[0].toLowerCase();
	return (
		shopLanguages.find(
			(shopLanguage) => shopLanguage.split('-')[0] === code
		) || null
	);
}

// Sets the page direction and language for a language, so the layout and
// screen readers follow it. Store sets them at start and the language
// page on a pick, from the language itself: TranslateService switches
// only once the language file loads.
export function setPageLanguage(
	document: Document,
	language: ILanguage
): 'ltr' | 'rtl' {
	const dir = language === 'he-IL' ? 'rtl' : 'ltr';
	const page = document.documentElement;
	page.dir = dir;
	page.lang = language.slice(0, 2);
	return dir;
}

@Injectable({
	providedIn: 'root',
})
export class Store {
	// Ids of the orders with a card payment in flight. A page can create a
	// new PaymentComponent while a payment still runs (takeaway I'm here,
	// the order popup), so the guard lives here, where every instance
	// shares it. Kept in memory, not in localStorage, so it never
	// outlives the app.
	private readonly _payingOrderIds = new Set<Order['id']>();

	// The language the app starts in, once Store has picked it. On a phone
	// with no saved language that waits for the phone language.
	readonly startLanguage: Promise<ILanguage>;

	constructor(
		private readonly _translateService: TranslateService,
		private readonly platform: Platform,
		private readonly inviteRouter: InviteRouter,
		private readonly userRouter: UserRouter,
		@Inject(DOCUMENT) private readonly document: Document
	) {
		this.startLanguage = this._initLanguage();
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

	// The language saved on the customer's last pick. Unlike language, it
	// changes at once, before the new language file loads. Null when none
	// is saved or the shop does not ship it.
	get savedLanguage(): ILanguage | null {
		return shippedLanguage(localStorage.getItem('_language'));
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

	isPaying(orderId: Order['id']): boolean {
		return this._payingOrderIds.has(orderId);
	}

	startPaying(orderId: Order['id']): void {
		this._payingOrderIds.add(orderId);
	}

	stopPaying(orderId: Order['id']): void {
		this._payingOrderIds.delete(orderId);
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

	// Picks the language the app starts in, once: the saved language,
	// else the device language, else DEFAULT_LANGUAGE, else en-US.
	// use() switches to a language when its file arrives, so a second
	// use() at startup lets whichever file loads last win.
	private async _initLanguage(): Promise<ILanguage> {
		const savedLanguage = shippedLanguage(
			localStorage.getItem('_language')
		);
		if (savedLanguage) {
			this._startIn(savedLanguage);
			return savedLanguage;
		}

		const deviceLanguage = this.platform.is('cordova')
			? await this._phoneLanguage()
			: this._translateService.getBrowserLang();

		const language =
			shippedDeviceLanguage(deviceLanguage) ||
			shippedLanguage(environment.DEFAULT_LANGUAGE) ||
			'en-US';
		this._startIn(language);
		return language;
	}

	// The phone language, such as 'he-IL', or null when it cannot be read.
	private async _phoneLanguage(): Promise<string | null> {
		try {
			// Cordova plugins answer once the device is ready.
			await this.platform.ready();
			return (await Globalization.getPreferredLanguage()).value;
		} catch (error) {
			console.warn('Could not read the phone language', error);
			return null;
		}
	}

	private _startIn(language: ILanguage) {
		this._translateService.use(language);
		setPageLanguage(this.document, language);
	}
}
