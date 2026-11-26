import { TestBed } from '@angular/core/testing';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { UserAuthRouter } from '@modules/client.common.angular2/routers/user-auth-router.service';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';
import { ServerSettings } from './server-settings';
import { Store } from './store';

describe('ServerSettings', () => {
	let settings: ServerSettings;
	let store: Store;
	const inviteRouter = { getInvitesSettings: vi.fn() };
	const userAuthRouter = { getRegistrationsSettings: vi.fn() };

	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
		TestBed.configureTestingModule({
			providers: [
				{ provide: InviteRouter, useValue: inviteRouter },
				{ provide: UserAuthRouter, useValue: userAuthRouter },
				{ provide: UserRouter, useValue: {} },
			],
		});
		settings = TestBed.inject(ServerSettings);
		store = TestBed.inject(Store);
		// What ServerConnectionService stores for a reachable API (its root answers 404)
		store.serverConnection = '404';
	});

	afterEach(() => localStorage.clear());

	it('stores the invite and registration settings of the API', async () => {
		inviteRouter.getInvitesSettings.mockResolvedValue({ isEnabled: true });
		userAuthRouter.getRegistrationsSettings.mockResolvedValue({
			registrationRequiredOnStart: true,
		});

		await expect(settings.load()).resolves.toBe(true);

		expect(store.inviteSystem).toBe(true);
		expect(store.registrationSystem).toBe(RegistrationSystem.Enabled);
	});

	it('marks registration as disabled when it is not required on start', async () => {
		inviteRouter.getInvitesSettings.mockResolvedValue({ isEnabled: false });
		userAuthRouter.getRegistrationsSettings.mockResolvedValue({
			registrationRequiredOnStart: false,
		});

		await settings.load();

		expect(store.inviteSystem).toBe(false);
		expect(store.registrationSystem).toBe(RegistrationSystem.Disabled);
	});

	it('does not ask the API while the server is down', async () => {
		store.serverConnection = '0';

		await expect(settings.load()).resolves.toBe(true);

		expect(inviteRouter.getInvitesSettings).not.toHaveBeenCalled();
		expect(userAuthRouter.getRegistrationsSettings).not.toHaveBeenCalled();
	});

	it('does not ask the API in maintenance mode', async () => {
		localStorage.setItem('maintenanceMode', 'api');

		await settings.load();

		expect(inviteRouter.getInvitesSettings).not.toHaveBeenCalled();
	});
});
