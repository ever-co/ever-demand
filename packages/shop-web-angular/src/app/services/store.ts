import { Injectable } from '@angular/core';
import User from '@modules/server.common/entities/User';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { first } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class Store {
	constructor(private readonly userRouter: UserRouter) {}

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

	get mechantId(): string {
		return localStorage.getItem('_mechantId');
	}

	set mechantId(mechantId: string) {
		localStorage.setItem('_mechantId', mechantId);
	}

	get maintenanceMode(): string | null {
		return localStorage.getItem('maintenanceMode') || null;
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

	get deliveryType(): number {
		return Number(localStorage.getItem('deliveryType'));
	}

	set deliveryType(deliveryType: number) {
		localStorage.setItem('deliveryType', deliveryType.toString());
	}

	get productListViewSpace(): string {
		return localStorage.getItem('productListViewSpace');
	}

	set productListViewSpace(productListViewSpace: string) {
		localStorage.setItem('productListViewSpace', productListViewSpace);
	}

	get productListViewType(): string {
		return localStorage.getItem('productListViewType');
	}

	set productListViewType(productListViewType: string) {
		localStorage.setItem('productListViewType', productListViewType);
	}

	get productViewType(): string {
		return localStorage.getItem('productViewType');
	}

	set productViewType(productViewType: string) {
		localStorage.setItem('productViewType', productViewType);
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

	get serverConnection() {
		return localStorage.getItem('serverConnection');
	}

	set serverConnection(val: string) {
		localStorage.setItem('serverConnection', val);
	}
	clearMaintenanceMode() {
		localStorage.removeItem('maintenanceMode');
	}

	clear() {
		localStorage.clear();
	}
}
