import { Component } from '@angular/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';

@Component({
	selector: 'e-cu-privacy',
	templateUrl: './privacy.page.html',
	styleUrls: ['./privacy.page.scss'],
})
export class PrivacyPage {
	public usePrivacyHtml: string = '<h1>Loading...</h1>';
	public selectedLanguage: string;
	private sub: Subscription;
	public deviceId: string;
	public userId: string;

	constructor(private userRouter: UserRouter, public platform: Platform) {
		this.selectedLanguage = localStorage.getItem('_language') || 'en-US';
		this.deviceId = localStorage.getItem('_deviceId');
		this.userId = localStorage.getItem('_userId');
	}

	ngOnInit() {
		this.sub = this.userRouter
			.getPrivacy(this.userId, this.deviceId, this.selectedLanguage)
			.subscribe((html) => {
				this.usePrivacyHtml = html;
			});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}
}
