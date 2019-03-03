import { Injectable } from '@angular/core';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import Invite from '@modules/server.common/entities/Invite';

@Injectable()
export class AuthenticationService {
	constructor(
		private readonly userRouter: UserRouter,
		private readonly inviteRouter: InviteRouter
	) {}

	login(invite: Invite): void {}
}
