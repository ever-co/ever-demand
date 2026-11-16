import 'reflect-metadata';
import sift from 'sift';
import * as _ from 'lodash';
import { Subject } from 'rxjs';

// Keep the heavy service graph (mongoose models, env, router wiring, the push
// HTTP client) out of this unit test: only which invite requests the launch
// push is sent for is exercised.
jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	observableListener: () => () => undefined,
	routerName: () => () => undefined,
}));
jest.mock('@pyro/db-server', () => ({
	DBService: class {},
	ExistenceEventType: { Created: 0, Updated: 1, Removed: 2 },
}));
jest.mock('../../../env', () => ({
	env: { URBAN_AIRSHIP_KEY: 'test-key', URBAN_AIRSHIP_SECRET: 'test' },
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('request-promise', () => jest.fn());
jest.mock('faker', () => ({}));
jest.mock('../../../services/invites/InvitesService', () => ({
	InvitesService: class {},
}));
jest.mock('../../../services/devices', () => ({ DevicesService: class {} }));

import { ExistenceEventType } from '@pyro/db-server';
import { InvitesRequestsService } from '../../../services/invites/InvitesRequestsService';

interface SampleInviteRequest {
	deviceId?: string | null;
	apartment: string;
	isDeleted: boolean;
	isInvited: boolean;
	_createdAt: string;
	geoLocation: {
		countryId: number;
		city: string;
		streetAddress: string;
		house: string;
	};
}

describe('InvitesRequestsService launch push', () => {
	const address = {
		countryId: 33,
		city: 'Sofia',
		streetAddress: 'Vitosha Blvd',
		house: '12',
	};

	const invite = {
		_id: 'invite-1',
		code: '1234',
		apartment: '4',
		isDeleted: false,
		geoLocation: {
			...address,
			loc: { type: 'Point', coordinates: [23.32, 42.69] },
		},
	};

	let existence: Subject<any>;
	let service: InvitesRequestsService;
	let notifyAboutLaunch: jest.SpyInstance;
	let storedRequests: SampleInviteRequest[];
	let matchQueries: object[];

	// Stands in for `Model.aggregate()`: records every `$match` and runs the
	// stages over `storedRequests` the way MongoDB would (`$sort` does not
	// change which devices are found, `$group` by `$deviceId` keeps one row
	// per device and a missing deviceId groups as null).
	function aggregateOverStoredRequests() {
		let rows: any[] = storedRequests;

		const builder = {
			match: jest.fn((query: object) => {
				matchQueries.push(query);
				rows = rows.filter((row) => sift(query)(row));
				return builder;
			}),
			sort: jest.fn(() => builder),
			group: jest.fn((spec: { _id: string }) => {
				const key = spec._id.replace(/^\$/, '');
				rows = _.uniqBy(rows, key).map((row) => ({
					_id: _.get(row, key, null),
				}));
				return builder;
			}),
			exec: jest.fn(async () => rows),
		};

		return builder;
	}

	function inviteRequest(
		overrides: Partial<SampleInviteRequest> = {}
	): SampleInviteRequest {
		return {
			deviceId: 'device-at-address',
			apartment: invite.apartment,
			isDeleted: false,
			isInvited: false,
			_createdAt: '2026-11-16T10:00:00.000Z',
			geoLocation: { ...address },
			...overrides,
		};
	}

	function atAddress(
		geoOverrides: Partial<SampleInviteRequest['geoLocation']>,
		overrides: Partial<SampleInviteRequest> = {}
	): SampleInviteRequest {
		return inviteRequest({
			geoLocation: { ...address, ...geoOverrides },
			...overrides,
		});
	}

	beforeEach(() => {
		existence = new Subject<any>();
		storedRequests = [];
		matchQueries = [];

		service = new InvitesRequestsService({ existence } as any, {} as any);

		(service as any).Model = {
			aggregate: jest.fn(() => aggregateOverStoredRequests()),
		};

		// notifyAboutLaunch is private (internal to the invite-created
		// subscription), so it is reached through `any`.
		notifyAboutLaunch = jest
			.spyOn(service as any, 'notifyAboutLaunch')
			.mockResolvedValue(undefined);
	});

	async function inviteCreated() {
		existence.next({ type: ExistenceEventType.Created, value: invite });

		// the subscriber is async: let the aggregate and the push call settle
		await new Promise((resolve) => setImmediate(resolve));
	}

	async function launchFilter() {
		await inviteCreated();

		expect(matchQueries).toHaveLength(1);

		return (request: SampleInviteRequest) => sift(matchQueries[0])(request);
	}

	it('matches a request for the same address and apartment', async () => {
		const matches = await launchFilter();

		expect(matches(inviteRequest())).toBe(true);
	});

	it.each([
		['another street', atAddress({ streetAddress: 'Graf Ignatiev 1' })],
		['another house', atAddress({ house: '14' })],
		['another city', atAddress({ city: 'Plovdiv' })],
		['another country', atAddress({ countryId: 34 })],
		['another apartment', inviteRequest({ apartment: '5' })],
		['a deleted request', inviteRequest({ isDeleted: true })],
		['a request without a deviceId', _.omit(inviteRequest(), 'deviceId')],
		['a request with a null deviceId', inviteRequest({ deviceId: null })],
	])('does not match %s', async (_label, request: SampleInviteRequest) => {
		const matches = await launchFilter();

		expect(matches(request)).toBe(false);
	});

	it('sends the push only to devices that requested this address', async () => {
		storedRequests = [
			inviteRequest({ deviceId: 'device-a' }),
			inviteRequest({ deviceId: 'device-a' }),
			atAddress(
				{ streetAddress: 'Graf Ignatiev 1' },
				{ deviceId: 'device-b' }
			),
			inviteRequest({ apartment: '5', deviceId: 'device-c' }),
			inviteRequest({ isDeleted: true, deviceId: 'device-d' }),
			_.omit(inviteRequest(), 'deviceId'),
		];

		await inviteCreated();

		expect(notifyAboutLaunch).toHaveBeenCalledTimes(1);
		expect(notifyAboutLaunch).toHaveBeenCalledWith(invite, ['device-a']);
	});

	it('does not send a push when nobody requested this address', async () => {
		storedRequests = [
			atAddress(
				{ streetAddress: 'Graf Ignatiev 1' },
				{ deviceId: 'device-b' }
			),
			inviteRequest({ apartment: '5', deviceId: 'device-c' }),
			inviteRequest({ isDeleted: true, deviceId: 'device-d' }),
		];

		await inviteCreated();

		expect(notifyAboutLaunch).not.toHaveBeenCalled();
	});
});
