import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';

@Component({
	selector: 'e-cu-help',
	templateUrl: './help.page.html',
	styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit, OnDestroy {
	public useHelpHtml: string = '<h1>Loading...</h1>';
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
			.getHelp(this.userId, this.deviceId)
			.subscribe((html) => {
				this.useHelpHtml = html;
			});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}
}
