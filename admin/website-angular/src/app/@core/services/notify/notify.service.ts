import { ToasterService, Toast } from 'angular2-toaster';
import { Injectable } from '@angular/core';

@Injectable()
export class NotifyService {
	private _toast: Toast;

	constructor(private readonly _toasterService: ToasterService) {}

	success(title?: string, body?: string) {
		this._setupToast('success', title, body);
		this._notify();
	}

	warn(title?: string, body?: string) {
		this._setupToast('warning', title, body);
		this._notify();
	}

	error(title?: string, body?: string) {
		this._setupToast('error', title, body);
		this._notify();
	}

	private _setupToast(type: string, title: string, body: string) {
		this._toast = { type, title, body };
	}

	private _notify() {
		this._toasterService.pop(this._toast);
	}
}
