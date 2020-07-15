import { Component, OnInit } from '@angular/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';

@Component({
	selector: 'e-cu-terms-of-use',
	templateUrl: './terms-of-use.page.html',
	styleUrls: ['./terms-of-use.page.scss'],
})
export class TermsOfUsePage implements OnInit {
	public useTermsHtml: string = '<h1>Loading...</h1>';
	public selectedLanguage: string;

	constructor(private userRouter: UserRouter) {
		this.selectedLanguage = localStorage.getItem('_language');
		console.warn(this.selectedLanguage);
	}

	ngOnInit() {
		this.userRouter
			.getTermsOfUseByLanguage(this.selectedLanguage)
			.subscribe((html) => {
				this.useTermsHtml = html;
			});
	}
}
