import Admin from '@modules/server.common/entities/Admin';
import User from '@modules/server.common/entities/User';
import { Injectable } from '@angular/core';

@Injectable()
export class Store {
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

	get adminId(): Admin['id'] | null {
		return localStorage.getItem('_adminId') || null;
	}

	set adminId(id: Admin['id'] | null) {
		if (id == null) {
			localStorage.removeItem('_adminId');
		} else {
			localStorage.setItem('_adminId', id);
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

	get maintenanceMode(): string | null {
		return localStorage.getItem('maintenanceMode') || null;
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
