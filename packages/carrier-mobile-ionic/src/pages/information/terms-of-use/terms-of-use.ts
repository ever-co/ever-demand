import { Component } from '@angular/core';

import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Store } from 'services/store.service';

@Component({
	selector: 'page-terms-of-use',
	templateUrl: 'terms-of-use.html',
	styleUrls: ['terms-of-use.scss'],
})
export class TermsOfUsePage {
	public useTermsHtml: string = '<h1>Loading...</h1>';

	constructor(private userRouter: UserRouter, private store: Store) {}

	ionViewWillEnter() {
		this.userRouter.getTermsOfUse(this._userId, this._deviceId).subscribe(
			(innerHtml) => {
				this.useTermsHtml = innerHtml;
			},
			(err) => {
				console.log(err);
			}
		);
	}

	private get _userId() {
		return localStorage.getItem('_userId');
	}

	private get _deviceId() {
		return localStorage.getItem('_deviceId');
	}
}
