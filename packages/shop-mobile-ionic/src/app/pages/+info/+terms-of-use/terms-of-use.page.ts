import { Component } from '@angular/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Store } from '../../../services/store.service';

@Component({
	selector: 'e-cu-terms-of-use',
	templateUrl: './terms-of-use.page.html',
	styleUrls: ['./terms-of-use.page.scss'],
})
export class TermsOfUsePage {
	html$ = this.userRouter.getTermsOfUse(
		this.store.userId,
		this.store.deviceId
	);

	constructor(private store: Store, private userRouter: UserRouter) {}
}
