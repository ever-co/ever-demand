import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Platform } from '@ionic/angular';

@Component({
	selector: 'e-cu-help',
	templateUrl: './help.page.html',
	styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit, OnDestroy {
	public useHelpHtml: string = '<h1>Loading...</h1>';
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
			.getHelp(this.userId, this.deviceId, this.selectedLanguage)
			.subscribe((html) => {
				this.useHelpHtml = html;
			});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}
}
