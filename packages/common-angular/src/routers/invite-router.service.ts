import { map } from 'rxjs/operators';
import { RouterFactory, Router } from '../lib/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import IInviteRouter from '@modules/server.common/routers/IInviteRouter';
import IEnterByCode from '@modules/server.common/interfaces/IEnterByCode';
import IEnterByLocation from '@modules/server.common/interfaces/IEnterByLocation';
import Invite from '@modules/server.common/entities/Invite';
import IStreetLocation from '@modules/server.common/interfaces/IStreetLocation';
import IInvite, {
	IInviteCreateObject,
} from '@modules/server.common/interfaces/IInvite';

@Injectable()
export class InviteRouter implements IInviteRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('invite');
	}

	get(id: string): Observable<Invite> {
		return this.router
			.runAndObserve<IInvite>('get', id)
			.pipe(map((invite) => this._inviteFactory(invite)));
	}

	getInvitedStreetLocations(): Observable<IStreetLocation[]> {
		return this.router.runAndObserve<IStreetLocation[]>(
			'getInvitedStreetLocations'
		);
	}

	getByLocation(info: IEnterByLocation): Observable<Invite> {
		return this.router
			.runAndObserve<IInvite>('getByLocation', info)
			.pipe(map((i) => this._inviteFactory(i)));
	}

	getByCode(info: IEnterByCode): Observable<Invite> {
		return this.router
			.runAndObserve<IInvite>('getByCode', info)
			.pipe(map((i) => this._inviteFactory(i)));
	}

	async create(inviteCreateObject: IInviteCreateObject): Promise<Invite> {
		const i = await this.router.run<IInvite>('create', inviteCreateObject);
		return this._inviteFactory(i);
	}

	getInvitesSettings(): Promise<{ isEnabled: boolean }> {
		return this.router.run<{ isEnabled: boolean }>('getInvitesSettings');
	}

	protected _inviteFactory(invite: IInvite) {
		return invite == null ? null : new Invite(invite);
	}
}
