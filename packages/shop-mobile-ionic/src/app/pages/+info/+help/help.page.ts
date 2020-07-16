import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';

@Component({
	selector: 'e-cu-help',
	templateUrl: './help.page.html',
	styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit, OnDestroy {
	public useHelpHtml: string = '<h1>Loading...</h1>';
	public selectedLanguage: string;
	private sub: Subscription;
	constructor(private userRouter: UserRouter) {
		this.selectedLanguage = localStorage.getItem('_language');
	}

	ngOnInit() {
		this.sub = this.userRouter
			.getHelpByLanguage(this.selectedLanguage)
			.subscribe((html) => {
				this.useHelpHtml = html;
			});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}
}
