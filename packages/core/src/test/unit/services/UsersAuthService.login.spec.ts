import 'reflect-metadata';

// Keep the heavy service graph (mongoose models, env, router wiring, bcrypt and
// jwt) out of this unit test: only which customers `login()` lets in is
// exercised, on top of a stubbed AuthService.login.
jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	routerName: () => () => undefined,
}));
jest.mock('@pyro/db-server/entity-service', () => ({
	EntityService: class {},
}));
jest.mock('../../../env', () => ({
	env: { USER_PASSWORD_BCRYPT_SALT_ROUNDS: 1 },
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('../../../services/users/UsersService', () => ({
	UsersService: class {},
}));
jest.mock('../../../services/invites', () => ({ InvitesService: class {} }));
jest.mock('../../../services/auth', () => ({ AuthService: class {} }));

import { UsersAuthService } from '../../../services/users/UsersAuthService';

describe('UsersAuthService.login', () => {
	let authService: { login: jest.Mock };
	let service: UsersAuthService;

	const loginWith = (entity: any) => {
		authService.login.mockResolvedValue({ entity, token: 't1' });
		return service.login('customer@example.com', 'secret');
	};

	beforeEach(() => {
		authService = { login: jest.fn() };

		service = new UsersAuthService(
			{} as any,
			{} as any,
			(() => authService) as any
		);
	});

	it('logs in a customer who is neither banned nor deleted', async () => {
		const user = { id: 'u1', isBanned: false, isDeleted: false };

		await expect(loginWith(user)).resolves.toEqual({
			user,
			token: 't1',
		});
	});

	it('returns null for a banned customer', async () => {
		await expect(
			loginWith({ id: 'u1', isBanned: true, isDeleted: false })
		).resolves.toBeNull();
	});

	it('returns null for a deleted customer', async () => {
		await expect(
			loginWith({ id: 'u1', isBanned: false, isDeleted: true })
		).resolves.toBeNull();
	});

	it('returns null when the email or password is wrong', async () => {
		authService.login.mockResolvedValue(null);

		await expect(
			service.login('customer@example.com', 'wrong')
		).resolves.toBeNull();
	});
});
