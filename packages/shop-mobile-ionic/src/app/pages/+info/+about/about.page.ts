import { Component } from '@angular/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Store } from '../../../services/store.service';

@Component({
	selector: 'e-cu-about',
	templateUrl: './about.page.html',
	styleUrls: ['./about.page.scss'],
})
export class AboutPage {
	html$ = this.userRouter.getAboutUs(this.store.userId, this.store.deviceId);

	constructor(private store: Store, private userRouter: UserRouter) {}
}
