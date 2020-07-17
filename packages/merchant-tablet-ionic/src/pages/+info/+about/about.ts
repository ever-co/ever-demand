import { Component, OnDestroy } from '@angular/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'page-about',
	templateUrl: 'about.html',
})
export class AboutPage implements OnDestroy {
	public useAboutHtml: string = '<h1>Loading...</h1>';
	public selectedLanguage: string;
	private sub: Subscription;
	constructor(private userRouter: UserRouter) {
		this.selectedLanguage = localStorage.getItem('_language');
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
