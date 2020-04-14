import { Component } from '@angular/core';
import { Store } from '../../../services/store.service';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';

@Component({
	selector: 'e-cu-privacy',
	templateUrl: './privacy.page.html',
	styleUrls: ['./privacy.page.scss'],
})
export class PrivacyPage {
	html$ = this.userRouter.getPrivacy(this.store.userId, this.store.deviceId);

	constructor(private store: Store, private userRouter: UserRouter) {}
}
