import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ApolloTestingController } from 'apollo-angular/testing';
import { firstValueFrom } from 'rxjs';
import { RoutersService } from '@modules/client.common.angular2/lib/router/routers.service';
import {
	expectOperation,
	setupApolloTesting,
} from '../../../testing/apollo-testing';
import { Store } from '../data/store.service';
import { AppModuleGuard } from '../../app.module.guard';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminAuthStrategy } from './admin-auth-strategy.service';
import { ServerSettingsService } from '../services/server-settings.service';

describe('admin authentication', () => {
	let controller: ApolloTestingController;
	let store: Store;
	let router: { navigate: ReturnType<typeof vi.fn> };
	let routers: { reconnectAll: ReturnType<typeof vi.fn> };
	let settings: { load: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		localStorage.clear();
		router = { navigate: vi.fn() };
		routersInit();
		({ controller } = setupApolloTesting([
			AdminAuthStrategy,
			AdminAuthGuard,
			AppModuleGuard,
			Store,
			{ provide: Router, useValue: router },
			{ provide: ActivatedRoute, useValue: {} },
			// socket routers and the admin-only app settings of the session
			{ provide: RoutersService, useValue: routers },
			{ provide: ServerSettingsService, useValue: settings },
		]));
		store = TestBed.inject(Store);
	});

	afterEach(() => controller.verify());

	function routersInit() {
		routers = { reconnectAll: vi.fn() };
		settings = { load: vi.fn().mockResolvedValue(true) };
	}

	describe('AdminAuthStrategy.authenticate', () => {
		it('stores the token and admin id on success', async () => {
			const strategy = TestBed.inject(AdminAuthStrategy);
			const result = firstValueFrom(
				strategy.authenticate({
					email: 'admin@ever.co',
					password: 'admin',
				}),
			);
			const op = await expectOperation(controller, 'Login');
			expect(op.operation.variables).toEqual({
				email: 'admin@ever.co',
				password: 'admin',
			});
			op.flush({
				data: {
					adminLogin: {
						token: 'jwt',
						admin: {
							_id: 'a1',
							id: 'a1',
							email: 'admin@ever.co',
							name: 'Admin',
							pictureUrl: '',
							role: 'owner',
							isSuperAdmin: true,
							tenantId: 't0',
						},
					},
				},
			});

			const auth = await result;
			expect(auth.isSuccess()).toBe(true);
			expect(auth.getRedirect()).toBe('/');
			expect(store.token).toBe('jwt');
			expect(store.adminId).toBe('a1');
			// multi-tenant: the role and the super-admin flag, then the sockets reconnect
			expect(store.adminRole).toBe('owner');
			expect(store.isSuperAdmin).toBe(true);
			expect(store.adminTenantId).toBe('t0');
			expect(routers.reconnectAll).toHaveBeenCalledTimes(1);
			expect(settings.load).toHaveBeenCalled();
		});

		it('fails with the default message when the API returns no login', async () => {
			const strategy = TestBed.inject(AdminAuthStrategy);
			const result = firstValueFrom(
				strategy.authenticate({
					email: 'admin@ever.co',
					password: 'nope',
				}),
			);
			(await expectOperation(controller, 'Login')).flush({
				data: { adminLogin: null },
			});

			const auth = await result;
			expect(auth.isFailure()).toBe(true);
			expect(auth.getErrors()[0]).toMatch(/not correct/);
			expect(store.token).toBeNull();
			expect(routers.reconnectAll).not.toHaveBeenCalled();
		});

		it('fails with the GraphQL errors (Apollo 4 `error`) instead of throwing', async () => {
			const strategy = TestBed.inject(AdminAuthStrategy);
			const result = firstValueFrom(
				strategy.authenticate({
					email: 'admin@ever.co',
					password: 'nope',
				}),
			);
			(await expectOperation(controller, 'Login')).flush({
				data: { adminLogin: null },
				errors: [{ message: 'Invalid credentials' } as any],
			});

			const auth = await result;
			expect(auth.isFailure()).toBe(true);
			expect(auth.getErrors().join()).toContain('Invalid credentials');
			expect(store.token).toBeNull();
		});
	});

	describe('AdminAuthGuard', () => {
		it('lets an authenticated admin in', async () => {
			const guard = TestBed.inject(AdminAuthGuard);
			const allowed = guard.canActivate(
				{} as any,
				{ url: '/stores' } as any,
			);
			(await expectOperation(controller, 'IsAdminAuthenticated')).flush({
				data: { adminAuthenticated: true },
			});
			await expect(allowed).resolves.toBe(true);
			expect(router.navigate).not.toHaveBeenCalled();
		});

		it('sends a signed-out visitor to the login page with the return url', async () => {
			const guard = TestBed.inject(AdminAuthGuard);
			const allowed = guard.canActivate(
				{} as any,
				{ url: '/stores' } as any,
			);
			(await expectOperation(controller, 'IsAdminAuthenticated')).flush({
				data: { adminAuthenticated: false },
			});
			await expect(allowed).resolves.toBe(false);
			expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], {
				queryParams: { returnUrl: '/stores' },
			});
		});
	});

	describe('AppModuleGuard', () => {
		it('lets the app open when the server is reachable and not in maintenance', () => {
			const guard = TestBed.inject(AppModuleGuard);
			store.serverConnection = '200';
			expect(guard.canActivate({} as any, {} as any)).toBe(true);
		});

		it('shows the server-down page when the server is unreachable', () => {
			const guard = TestBed.inject(AppModuleGuard);
			store.serverConnection = '0';
			expect(guard.canActivate({} as any, {} as any)).toBe(false);
			expect(router.navigate).toHaveBeenCalledWith(['server-down']);
		});

		it('shows the maintenance page in maintenance mode', () => {
			const guard = TestBed.inject(AppModuleGuard);
			localStorage.setItem('maintenanceMode', 'admin');
			expect(guard.canActivate({} as any, {} as any)).toBe(false);
			expect(router.navigate).toHaveBeenCalledWith(['maintenance-info']);
		});
	});

	describe('Store', () => {
		it('keeps the session in localStorage and clears it', () => {
			store.token = 'jwt';
			store.adminId = 'a1';
			expect(localStorage.getItem('token')).toBe('jwt');
			expect(store.adminId).toBe('a1');

			store.token = null;
			expect(store.token).toBeNull();

			store.clear();
			expect(store.adminId).toBeNull();
		});
	});
});
