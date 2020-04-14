import { Component, OnDestroy } from '@angular/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Store } from 'services/store.service';
import { environment } from 'environments/environment';

@Component({
	selector: 'page-about',
	templateUrl: 'about.html',
})
export class AboutPage implements OnDestroy {
	public aboutHtml: string;

	private s$: any;

	public appVersion: string;

	constructor(private userRouter: UserRouter, private store: Store) {
		this._getAboutHtml();
		this.appVersion = environment.APP_VERSION;
	}

	get userId() {
		return localStorage.getItem('_userId');
	}

	get deviceId() {
		return localStorage.getItem('_deviceId');
	}

	private _getAboutHtml() {
		const deviceId = this.deviceId;
		if (this.userId && deviceId) {
			this.s$ = this.userRouter
				.getAboutUs(this.userId, deviceId)
				.subscribe((html) => {
					this.aboutHtml = html;
				});
		}
	}

	ngOnDestroy(): void {
		if (this.s$) {
			this.s$.unsubscribe();
		}
	}
}
