import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { first } from 'rxjs/operators';
import IEnterByCode from '@modules/server.common/interfaces/IEnterByCode';
import IEnterByLocation from '@modules/server.common/interfaces/IEnterByLocation';
import { IInviteCreateObject } from '@modules/server.common/interfaces/IInvite';
import { InvitesService } from '../../services/invites/InvitesService';
import { InvitesRequestsService } from '../../services/invites';
import Invite from '@modules/server.common/entities/Invite';

@Resolver('Invite')
export class InviteResolver {
	constructor(
		private readonly _invitesService: InvitesService,
		private readonly _inviteRequestsService: InvitesRequestsService
	) {}

	@Query()
	async generate1000InvitesConnectedToInviteRequests(
		_,
		{ defaultLng, defaultLat }: { defaultLng: number; defaultLat: number }
	): Promise<void> {
		const {
			invitesRequestsToCreate,
			invitesToCreate,
		} = this._invitesService.generate1000InvitesConnectedToInviteRequests(
			defaultLng,
			defaultLat
		);

		await this._invitesService.Model.insertMany(invitesToCreate);
		await this._inviteRequestsService.Model.insertMany(
			invitesRequestsToCreate
		);
	}

	@Query('invite')
	async getInvite(_, { id }: { id: string }): Promise<Invite> {
		return this._invitesService.get(id).pipe(first()).toPromise();
	}

	@Query('getInviteByCode')
	async getInviteByCode(
		_,
		{ info }: { info: IEnterByCode }
	): Promise<Invite> {
		return this._invitesService.getByCode(info).pipe(first()).toPromise();
	}

	@Query('getInviteByLocation')
	async getInviteByLocation(
		_,
		{ info }: { info: IEnterByLocation }
	): Promise<Invite> {
		return this._invitesService
			.getByLocation(info)
			.pipe(first())
			.toPromise();
	}

	@Query('invites')
	async getInvites(_, { findInput, pagingOptions = {} }): Promise<any> {
		if (!pagingOptions || (pagingOptions && !pagingOptions['sort'])) {
			pagingOptions['sort'] = { field: '_createdAt', sortBy: 'desc' };
		}

		const invites = await this._invitesService.getInvites(
			findInput,
			pagingOptions
		);

		return invites.map((i) => new Invite(i));
	}

	@Query()
	async getCountOfInvites(): Promise<number> {
		return this._invitesService.Model.find({ isDeleted: { $eq: false } })
			.countDocuments()
			.exec();
	}

	@Mutation()
	async createInvite(
		_,
		{ createInput }: { createInput: IInviteCreateObject }
	): Promise<Invite> {
		return this._invitesService.create(createInput);
	}

	@Mutation()
	async updateInvite(
		_,
		{ id, updateInput }: { id: string; updateInput }
	): Promise<Invite> {
		await this._invitesService.throwIfNotExists(id);
		return this._invitesService.update(id, updateInput);
	}

	@Mutation()
	async removeInvite(_, { id }: { id: string }): Promise<void> {
		await this._invitesService.throwIfNotExists(id);
		return this._invitesService.remove(id);
	}

	@Mutation()
	async removeInvitesByIds(_, { ids }: { ids: string[] }): Promise<void> {
		const invites = await this._invitesService.find({
			_id: { $in: ids },
			isDeleted: { $eq: false },
		});

		const invitesIds = invites.map((d) => d.id);

		return this._invitesService.removeMultipleByIds(invitesIds);
	}
}
