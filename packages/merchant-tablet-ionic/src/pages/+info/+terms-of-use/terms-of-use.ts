import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Subscription } from 'rxjs';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';

@Component({
	selector: 'page-terms-of-use',
	templateUrl: 'terms-of-use.html',
})
export class TermsOfUsePage implements OnInit, OnDestroy {
	public useTermsHtml: string = '<h1>Loading...</h1>';
	public selectedLanguage: ILanguage;
	private sub: Subscription;
	public deviceId: string;
	public userId: string;
	constructor(
		private userRouter: UserRouter,
		private deviceRouter: DeviceRouter
	) {
		this.selectedLanguage =
			(localStorage.getItem('_language') as ILanguage) || 'en-US';
		this.deviceId = localStorage.getItem('_deviceId');
		this.userId = localStorage.getItem('_userId');
	}

	ngOnInit(): void {
		this.deviceRouter.updateLanguage(this.deviceId, this.selectedLanguage);
		this.sub = this.userRouter
			.getTermsOfUse(this.userId, this.deviceId)
			.subscribe((html) => {
				this.useTermsHtml = html;
			});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}
}
