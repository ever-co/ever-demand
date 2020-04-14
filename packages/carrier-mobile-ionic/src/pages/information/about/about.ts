import { Component } from '@angular/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Subscription } from 'rxjs/Subscription';
import { Store } from 'services/store.service';
import { environment } from 'environments/environment';

@Component({
	selector: 'page-about',
	templateUrl: 'about.html',
	styleUrls: ['about.scss'],
})
export class AboutPage {
	aboutHtml: string;
	appVersion: string;

	private _pageSubscriptions: Subscription[] = [];

	constructor(private userRouter: UserRouter, private store: Store) {
		this._getAboutHtml();
		this.appVersion = environment.APP_VERSION;
	}

	get userId() {
		return this.store.carrierId;
	}

	get deviceId() {
		return this.store.deviceId;
	}

	private _getAboutHtml() {
		if (this.userId && this.deviceId) {
			const aboutSubscription = this.userRouter
				.getAboutUs(this.userId, this.deviceId)
				.subscribe((html) => (this.aboutHtml = html));

			this._pageSubscriptions.push(aboutSubscription);
		}
	}

	ionViewWillLeave() {
		this._pageSubscriptions.forEach((s) => s.unsubscribe);
	}
}
