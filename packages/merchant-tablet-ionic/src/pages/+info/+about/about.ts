import { Component, OnDestroy } from '@angular/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Subscription } from 'rxjs';
import { environment } from 'environment';

@Component({
	selector: 'page-about',
	templateUrl: 'about.html',
})
export class AboutPage implements OnDestroy {
	public useAboutHtml: string = '<h1>Loading...</h1>';
	public selectedLanguage: string;
	private sub: Subscription;
	public appVersion: string;
	constructor(private userRouter: UserRouter) {
		this.selectedLanguage = localStorage.getItem('_language');
		this.appVersion = environment.APP_VERSION;
	}

	ngOnInit() {
		this.sub = this.userRouter
			.getAboutUsByLanguage(this.selectedLanguage)
			.subscribe((html) => {
				this.useAboutHtml = html;
			});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}
}
