import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { InvitesRequestsService } from '../../services/invites';
import { IInviteRequestCreateObject } from '@modules/server.common/interfaces/IInviteRequest';
import { first } from 'rxjs/operators';
import Invite from '@modules/server.common/entities/Invite';
import InviteRequest from '@modules/server.common/entities/InviteRequest';

@Resolver('Invite-request')
export class InviteRequestResolver {
	constructor(
		private readonly _invitesRequestsService: InvitesRequestsService
	) {}

	@Query()
	async generate1000InviteRequests(
		_,
		{ defaultLng, defaultLat }: { defaultLng: number; defaultLat: number }
	) {
		await this._invitesRequestsService.generate1000InviteRequests(
			defaultLng,
			defaultLat
		);
	}

	@Query('inviteRequest')
	async getInviteRequest(_, { id }: { id: string }) {
		return this._invitesRequestsService.get(id).pipe(first()).toPromise();
	}

	@Query('notifyAboutLaunch')
	async notifyAboutLaunch(
		_,
		{
			invite,
			devicesIds,
		}: {
			invite: Invite;
			devicesIds: string[];
		}
	) {
		return this._invitesRequestsService.notifyAboutLaunch(
			invite,
			devicesIds
		);
	}

	@Query('invitesRequests')
	async getInvitesRequests(_, { findInput, invited, pagingOptions = {} }) {
		if (!pagingOptions || (pagingOptions && !pagingOptions['sort'])) {
			pagingOptions['sort'] = { field: '_createdAt', sortBy: 'asc' };
		}

		const invitesRequests = await this._invitesRequestsService.getInvitesRequests(
			findInput,
			invited,
			pagingOptions
		);

		return invitesRequests.map((i) => new InviteRequest(i));
	}

	@Query()
	async getCountOfInvitesRequests(_, { invited }) {
		const findObj = { isDeleted: { $eq: false } };

		if (!invited) {
			findObj['isInvited'] = { $eq: false };
		}

		return this._invitesRequestsService.Model.find(findObj)
			.countDocuments()
			.exec();
	}

	@Mutation()
	async createInviteRequest(
		_,
		{ createInput }: { createInput: IInviteRequestCreateObject }
	) {
		return this._invitesRequestsService.create(createInput);
	}

	@Mutation()
	async updateInviteRequest(
		_,
		{ id, updateInput }: { id: string; updateInput }
	) {
		await this._invitesRequestsService.throwIfNotExists(id);
		return this._invitesRequestsService.update(id, updateInput);
	}

	@Mutation()
	async removeInviteRequest(_, { id }: { id: string }) {
		await this._invitesRequestsService.throwIfNotExists(id);
		return this._invitesRequestsService.remove(id);
	}

	@Mutation()
	async removeInvitesRequestsByIds(_, { ids }: { ids: string[] }) {
		const inviteRequests = await this._invitesRequestsService.find({
			_id: { $in: ids },
			isDeleted: { $eq: false },
		});

		const inviteRequestsIds = inviteRequests.map((d) => d.id);

		return this._invitesRequestsService.removeMultipleByIds(
			inviteRequestsIds
		);
	}
}
