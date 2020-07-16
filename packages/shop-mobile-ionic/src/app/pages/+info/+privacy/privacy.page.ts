import { Component } from '@angular/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'e-cu-privacy',
	templateUrl: './privacy.page.html',
	styleUrls: ['./privacy.page.scss'],
})
export class PrivacyPage {
	public usePrivacyHtml: string = '<h1>Loading...</h1>';
	public selectedLanguage: string;
	private sub: Subscription;

	constructor(private userRouter: UserRouter) {
		this.selectedLanguage = localStorage.getItem('_language');
	}

	ngOnInit() {
		this.sub = this.userRouter
			.getPrivacyByLanguage(this.selectedLanguage)
			.subscribe((html) => {
				this.usePrivacyHtml = html;
			});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}
}
