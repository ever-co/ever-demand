import Logger from 'bunyan';
import { injectable } from 'inversify';
import Utils from '@modules/server.common/utils';
import { createEverLogger } from '../../helpers/Log';
import Invite from '@modules/server.common/entities/Invite';
import { DBService, ExistenceEventType } from '@pyro/db-server';
import { IInviteCreateObject } from '@modules/server.common/interfaces/IInvite';
import IEnterByCode from '@modules/server.common/interfaces/IEnterByCode';
import IEnterByLocation from '@modules/server.common/interfaces/IEnterByLocation';
import IStreetLocation from '@modules/server.common/interfaces/IStreetLocation';
import { Observable } from 'rxjs';
import IInviteRouter from '@modules/server.common/routers/IInviteRouter';
import { asyncListener, observableListener, routerName } from '@pyro/io';
import IService from '../IService';
import { of } from 'rxjs/observable/of';
import {
	concat,
	exhaustMap,
	filter,
	map,
	first,
	switchMap,
} from 'rxjs/operators';
import { from } from 'rxjs/observable/from';
import _ = require('lodash');
import { env } from '../../env';
import { IGeoLocationCreateObject } from '@modules/server.common/interfaces/IGeoLocation';
import { IInviteRequestCreateObject } from '@modules/server.common/interfaces/IInviteRequest';
import faker from 'faker';
import { Country } from '@modules/server.common/entities/GeoLocation';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';

@injectable()
@routerName('invite')
export class InvitesService extends DBService<Invite>
	implements IInviteRouter, IService {
	protected readonly log: Logger = createEverLogger({
		name: 'invitesService',
	});

	public readonly DBObject: any = Invite;

	protected _invitedStreetLocations: Observable<IStreetLocation[]>;

	private static readonly InviteWorkingDistance = 50000;

	constructor() {
		super();

		this._invitedStreetLocations = of(null).pipe(
			concat(this.existence),
			exhaustMap(() => this._getInvitedStreetLocations())
		);
	}

	@observableListener()
	get(id: string) {
		return super.get(id).pipe(
			map(async (invite) => {
				await this.throwIfNotExists(id);
				return invite;
			}),
			switchMap((invite) => {
				return invite;
			})
		);
	}

	@observableListener()
	getInvitedStreetLocations() {
		return this._invitedStreetLocations;
	}

	@asyncListener()
	create(invite: IInviteCreateObject): Promise<Invite> {
		if (!invite.code) {
			invite.code = Utils.getRandomInt(1001, 9999) + '';
		}
		return super.create(invite);
	}

	@asyncListener()
	getInvitesSettings(): Promise<{ isEnabled: boolean }> {
		return new Promise<{ isEnabled: boolean }>((resolve, reject) => {
			resolve({ isEnabled: env.SETTING_INVITES_ENABLED });
		});
	}

	/**
	 * Get Invite by Code
	 * Warning: can emit null on start!
	 *
	 * @param {IEnterByCode} info
	 * @returns {(Observable<Invite | null>)}
	 * @memberof InvitesService
	 */
	@observableListener()
	getByCode(info: IEnterByCode): Observable<Invite | null> {
		const findObject = {
			code: info.inviteCode,
		};

		if (info.inviteCode !== env.FAKE_INVITE_CODE.toString()) {
			findObject['geoLocation.loc'] = {
				$near: {
					$geometry: {
						type: 'Point',
						coordinates: info.location.coordinates,
					},
					$maxDistance: InvitesService.InviteWorkingDistance, // 50Km distance for testing only!
				},
			};
		}

		return from(
			this.findOne({ ...findObject, isDeleted: { $eq: false } })
		).pipe(
			concat(
				this.existence.pipe(
					filter(
						(event) => event.type !== ExistenceEventType.Removed
					),
					map((event) => event.value as Invite),
					filter((invite) => {
						return (
							Utils.getLocDistance(
								invite.geoLocation.loc,
								info.location
							) <= InvitesService.InviteWorkingDistance &&
							invite.code === info.inviteCode
						);
					})
				)
			)
		);
	}

	/**
	 * Get Invite by Customer Location
	 *
	 * @param {IEnterByLocation} info
	 * @returns {(Observable<Invite | null>)}
	 * @memberof InvitesService
	 */
	@observableListener()
	getByLocation(info: IEnterByLocation): Observable<Invite | null> {
		const findObject = {
			'geoLocation.city': info.city,
			'geoLocation.streetAddress': info.streetAddress,
			'geoLocation.house': info.house,
			'geoLocation.countryId': info.countryId,
			apartment: info.apartment,
		};

		if (info.postcode != null) {
			findObject['geoLocation.postcode'] = info.postcode;
		}

		return from(
			this.findOne({ ...findObject, isDeleted: { $eq: false } })
		).pipe(
			concat(
				this.existence.pipe(
					filter(
						(event) => event.type !== ExistenceEventType.Removed
					),
					map((event) => event.value as Invite),
					filter((invite) => {
						return (
							invite.geoLocation.city === info.city &&
							invite.geoLocation.streetAddress ===
								info.streetAddress &&
							invite.geoLocation.house === info.house &&
							invite.geoLocation.countryId === info.countryId &&
							invite.apartment === info.apartment
						);
					})
				)
			)
		);
	}

	@asyncListener()
	async getInvites(
		findInput: any,
		pagingOptions: IPagingOptions
	): Promise<any> {
		const sortObj = {};
		if (pagingOptions.sort) {
			sortObj[pagingOptions.sort.field] = pagingOptions.sort.sortBy;
		}

		return this.Model.find({
			...findInput,
			isDeleted: { $eq: false },
		})
			.sort(sortObj)
			.skip(pagingOptions.skip)
			.limit(pagingOptions.limit)
			.lean()
			.exec();
	}

	async throwIfNotExists(inviteId: string) {
		const invite = await super.get(inviteId).pipe(first()).toPromise();

		if (!invite || invite.isDeleted) {
			throw Error(`Invite with id '${inviteId}' does not exists!`);
		}
	}

	/**
	 * Generates Fake Invites, connected to Fake Invite Requests
	 * TODO: rename, make async and add 1000 as parameter. Move to separate Fake Data service
	 *
	 * @param {number} defaultLng
	 * @param {number} defaultLat
	 * @memberof InvitesService
	 */
	generate1000InvitesConnectedToInviteRequests(
		defaultLng: number,
		defaultLat: number
	): {
		invitesRequestsToCreate: IInviteRequestCreateObject[];
		invitesToCreate: IInviteCreateObject[];
	} {
		const invitesToCreate: IInviteCreateObject[] = [];
		const invitesRequestsToCreate: IInviteRequestCreateObject[] = [];

		let inviteCount = 1;

		while (inviteCount <= 1000) {
			const apartment: string = `${inviteCount}`;
			const houseNumber = `${inviteCount}`;
			const geoLocation: IGeoLocationCreateObject = this._getInviteGeoLocationCreateObj(
				houseNumber,
				defaultLng,
				defaultLat
			);

			invitesRequestsToCreate.push({
				apartment,
				geoLocation,
				isInvited: true,
				invitedDate: new Date(),
			});

			invitesToCreate.push({
				code: `${999 + inviteCount}`,
				apartment,
				geoLocation,
			});

			inviteCount += 1;
		}

		return {
			invitesRequestsToCreate,
			invitesToCreate,
		};
	}

	private _getInviteGeoLocationCreateObj(
		houseNumber: string,
		defaultLng: number,
		defaultLat: number
	): IGeoLocationCreateObject {
		// TODO: make TSlint happy
		// tslint:disable-next-line:no-object-literal-type-assertion
		return {
			countryId: faker.random.number(Country.ZW) as Country,
			city: faker.address.city(),
			house: houseNumber,
			loc: {
				type: 'Point',
				coordinates: [defaultLng, defaultLat],
			},
			streetAddress: faker.address.streetAddress(),
		} as IGeoLocationCreateObject;
	}

	private async _getInvitedStreetLocations(): Promise<IStreetLocation[]> {
		const results = await this.Model.aggregate()
			.group({
				_id: {
					streetAddress: '$geoLocation.streetAddress',
					city: '$geoLocation.city',
					country: '$geoLocation.countryId',
				},
			})
			.exec();

		return _.map(results, (result: { _id: IStreetLocation }) => result._id);
	}
}
