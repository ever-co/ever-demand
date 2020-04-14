import { map } from 'rxjs/operators';
import { RouterFactory, Router } from '../lib/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import IInviteRequestRouter from '@modules/server.common/routers/IInviteRequestRouter';
import {
	IInviteRequestCreateObject,
	IInviteRequestRawObject,
} from '@modules/server.common/interfaces/IInviteRequest';
import InviteRequest from '@modules/server.common/entities/InviteRequest';

@Injectable()
export class InviteRequestRouter implements IInviteRequestRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('invite-request');
	}

	get(id: string): Observable<InviteRequest> {
		return this.router
			.runAndObserve<IInviteRequestRawObject>('get', id)
			.pipe(map((o) => this._inviteRequestFactory(o)));
	}

	async create(
		inviteRequest: IInviteRequestCreateObject
	): Promise<InviteRequest> {
		const o = await this.router.run<IInviteRequestRawObject>(
			'create',
			inviteRequest
		);
		return this._inviteRequestFactory(o);
	}

	protected _inviteRequestFactory(inviteRequest: IInviteRequestRawObject) {
		return inviteRequest == null ? null : new InviteRequest(inviteRequest);
	}
}
