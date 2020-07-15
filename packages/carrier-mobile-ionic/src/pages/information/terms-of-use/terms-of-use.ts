import { Component, OnInit } from '@angular/core';

import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';

@Component({
	selector: 'page-terms-of-use',
	templateUrl: 'terms-of-use.html',
	styleUrls: ['terms-of-use.scss'],
})
export class TermsOfUsePage implements OnInit {
	public useTermsHtml: string = '<h1>Loading...</h1>';
	public selectedLanguage: string;

	constructor(private userRouter: UserRouter) {
		this.selectedLanguage = localStorage.getItem('_language');
	}

	ngOnInit() {
		this.userRouter
			.getTermsOfUseByLanguage(this.selectedLanguage)
			.subscribe((html) => {
				this.useTermsHtml = html;
			});
	}

	private get _userId() {
		return localStorage.getItem('_userId');
	}

	private get _deviceId() {
		return localStorage.getItem('_deviceId');
	}
}
