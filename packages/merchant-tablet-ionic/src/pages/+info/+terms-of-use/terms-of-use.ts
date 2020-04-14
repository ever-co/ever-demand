import { Component, OnInit } from '@angular/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Store } from 'services/store.service';

@Component({
	selector: 'page-terms-of-use',
	templateUrl: 'terms-of-use.html',
})
export class TermsOfUsePage implements OnInit {
	public useTermsHtml: string = '<h1>Loading...</h1>';

	constructor(private userRouter: UserRouter, private store: Store) {}

	ngOnInit(): void {
		this.userRouter
			.getTermsOfUse(this._warehouseId, this._deviceId)
			.subscribe(
				(innerHtml) => {
					this.useTermsHtml = innerHtml;
				},
				(err) => {
					console.log(err);
				}
			);
	}

	private get _warehouseId() {
		return localStorage.getItem('_warehouseId');
	}

	private get _deviceId() {
		return localStorage.getItem('_deviceId');
	}
}
