import { Component } from '@angular/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Subscription } from 'rxjs';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';
import ILanguage from '@modules/server.common/interfaces/ILanguage';

@Component({
	selector: 'e-cu-privacy',
	templateUrl: './privacy.page.html',
	styleUrls: ['./privacy.page.scss'],
})
export class PrivacyPage {
	public usePrivacyHtml: string = '<h1>Loading...</h1>';
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

	ngOnInit() {
		this.deviceRouter.updateLanguage(this.deviceId, this.selectedLanguage);
		this.sub = this.userRouter
			.getPrivacy(this.userId, this.deviceId)
			.subscribe((html) => {
				this.usePrivacyHtml = html;
			});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}
}
