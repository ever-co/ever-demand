import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'page-terms-of-use',
	templateUrl: 'terms-of-use.html',
})
export class TermsOfUsePage implements OnInit, OnDestroy {
	public useTermsHtml: string = '<h1>Loading...</h1>';
	public selectedLanguage: string;
	private sub: Subscription;
	constructor(private userRouter: UserRouter) {
		this.selectedLanguage = localStorage.getItem('_language');
	}

	ngOnInit(): void {
		this.sub = this.userRouter
			.getTermsOfUseByLanguage(this.selectedLanguage)
			.subscribe((html) => {
				this.useTermsHtml = html;
			});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}
}
