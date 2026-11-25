import 'reflect-metadata';
import { Subject } from 'rxjs';

// The real `@pyro/io` decorators run here, so the router metadata is exactly
// what the socket server reads. Only the heavy service graph (mongoose models,
// env, the push HTTP client) is stubbed.
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
jest.mock('@faker-js/faker', () => ({ faker: {} }));
jest.mock('../../../services/invites/InvitesService', () => ({
	InvitesService: class {},
}));
jest.mock('../../../services/devices', () => ({ DevicesService: class {} }));

import { getListeners, getRouterName } from '../../../@pyro/io/router/router';
import { InvitesRequestsService } from '../../../services/invites/InvitesRequestsService';

describe('InvitesRequestsService socket router', () => {
	let service: InvitesRequestsService;

	// The socket server registers one event per listener, named after it
	// (BaseListenerHandler: `socket.on(listener.name, ...)`).
	function socketEvents(): string[] {
		return getListeners(service).map((listener) => listener.name);
	}

	beforeEach(() => {
		service = new InvitesRequestsService(
			{ existence: new Subject<any>() } as any,
			{} as any
		);
	});

	it('is served on the invite-request socket namespace', () => {
		expect(getRouterName(service)).toBe('invite-request');
	});

	it('does not expose notifyAboutLaunch to socket clients', () => {
		expect(socketEvents()).not.toContain('notifyAboutLaunch');
		expect(getListeners(service)).not.toContain(
			(InvitesRequestsService.prototype as any).notifyAboutLaunch
		);
	});

	it.each(['get', 'create'])(
		'still exposes %s (IInviteRequestRouter)',
		(method) => {
			expect(socketEvents()).toContain(method);
		}
	);
});
