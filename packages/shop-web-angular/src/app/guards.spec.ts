import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';
import { AppModuleGuard } from './app.module.guard';
import { AuthGuard } from './authentication/auth.guard';
import { LoginModuleGuard } from './+login/login.module.guard';
import { SocieModuleGuard } from './+login/socie.module.guard';
import { ByCodeModuleGuard } from './+login/by-code.module.guard';
import { MaintenanceModuleGuard } from './+maintenance-info/maintenance-info.module.guard';
import { ProductsModuleGuard } from './+products/products.module.guard';
import { Store } from './services/store';

/** A plain Store double: the guards only read and write these properties. */
function fakeStore(values: Partial<Record<keyof Store, unknown>> = {}) {
	return {
		maintenanceMode: null,
		serverConnection: null,
		userId: null,
		registrationSystem: null,
		inviteSystem: false,
		isLogged: vi.fn().mockResolvedValue(false),
		...values,
	};
}

function setup<T>(guard: new (...args: any[]) => T, store: object) {
	const router = { navigate: vi.fn() };
	TestBed.configureTestingModule({
		providers: [
			guard,
			{ provide: Router, useValue: router },
			{ provide: Store, useValue: store },
		],
	});
	return { guard: TestBed.inject(guard), router };
}

const route = (params: Record<string, string> = {}, child = {}) =>
	({
		params,
		firstChild: { params: child },
	}) as unknown as ActivatedRouteSnapshot;

describe('AppModuleGuard', () => {
	it('sends the visitor to the maintenance page in maintenance mode', () => {
		const { guard, router } = setup(
			AppModuleGuard,
			fakeStore({ maintenanceMode: 'shop-web' })
		);

		expect(guard.canActivate(route(), null)).toBe(false);
		expect(router.navigate).toHaveBeenCalledWith(['maintenance-info']);
	});

	it('sends the visitor to the server-down page without a server', () => {
		const { guard, router } = setup(
			AppModuleGuard,
			fakeStore({ serverConnection: '0' })
		);

		expect(guard.canActivate(route(), null)).toBe(false);
		expect(router.navigate).toHaveBeenCalledWith(['server-down']);
	});

	it('lets the visitor in otherwise', () => {
		const { guard, router } = setup(
			AppModuleGuard,
			fakeStore({ serverConnection: '404' })
		);

		expect(guard.canActivate(route(), null)).toBe(true);
		expect(router.navigate).not.toHaveBeenCalled();
	});
});

describe('AuthGuard', () => {
	it('sends a visitor who is not logged in to login when registration is required', async () => {
		const { guard, router } = setup(
			AuthGuard,
			fakeStore({ registrationSystem: RegistrationSystem.Enabled })
		);

		expect(await guard.canActivate(route(), null)).toBe(false);
		expect(router.navigate).toHaveBeenCalledWith(['login']);
	});

	it('lets an anonymous visitor in when registration is not required', async () => {
		const { guard } = setup(
			AuthGuard,
			fakeStore({ registrationSystem: RegistrationSystem.Disabled })
		);

		expect(await guard.canActivate(route(), null)).toBe(true);
	});

	it('lets a logged in customer in', async () => {
		const { guard } = setup(
			AuthGuard,
			fakeStore({
				registrationSystem: RegistrationSystem.Enabled,
				isLogged: vi.fn().mockResolvedValue(true),
			})
		);

		expect(await guard.canActivate(route(), null)).toBe(true);
	});
});

describe('LoginModuleGuard', () => {
	it('sends a logged in customer to the products', () => {
		const { guard, router } = setup(
			LoginModuleGuard,
			fakeStore({ userId: 'u1' })
		);

		expect(guard.canActivate(route(), null)).toBe(false);
		expect(router.navigate).toHaveBeenCalledWith(['products']);
	});

	it('skips the login when registration is disabled', () => {
		const { guard, router } = setup(
			LoginModuleGuard,
			fakeStore({ registrationSystem: RegistrationSystem.Disabled })
		);

		expect(guard.canActivate(route(), null)).toBe(false);
		expect(router.navigate).toHaveBeenCalledWith(['products']);
	});

	it('shows the login to finish a social sign-up (an id in the url)', () => {
		const { guard } = setup(
			LoginModuleGuard,
			fakeStore({ registrationSystem: RegistrationSystem.Disabled })
		);

		expect(guard.canActivate(route({}, { id: 'u1' }), null)).toBe(true);
	});

	it('shows the login to a new visitor when registration is required', () => {
		const { guard } = setup(
			LoginModuleGuard,
			fakeStore({ registrationSystem: RegistrationSystem.Enabled })
		);

		expect(guard.canActivate(route(), null)).toBe(true);
	});
});

describe('SocieModuleGuard', () => {
	it('signs in the user of a social login and opens the products', () => {
		const store = fakeStore();
		const { guard, router } = setup(SocieModuleGuard, store);

		expect(guard.canActivate(route({ id: 'u42' }), null)).toBe(false);
		expect(store.userId).toBe('u42');
		expect(router.navigate).toHaveBeenCalledWith(['products']);
	});

	it('does nothing without a user id', () => {
		const { guard } = setup(SocieModuleGuard, fakeStore());

		expect(guard.canActivate(route(), null)).toBe(true);
	});
});

describe('ByCodeModuleGuard', () => {
	it('asks for the address when the invite system is off', () => {
		const { guard, router } = setup(ByCodeModuleGuard, fakeStore());

		expect(guard.canActivate(route(), null)).toBe(false);
		expect(router.navigate).toHaveBeenCalledWith(['login/byLocation']);
	});

	it('asks for an invite code when the invite system is on', () => {
		const { guard } = setup(
			ByCodeModuleGuard,
			fakeStore({ inviteSystem: true })
		);

		expect(guard.canActivate(route(), null)).toBe(true);
	});
});

describe('MaintenanceModuleGuard', () => {
	it('leaves the maintenance page when there is no maintenance', () => {
		const { guard, router } = setup(MaintenanceModuleGuard, fakeStore());

		expect(guard.canActivate(route(), null)).toBe(false);
		expect(router.navigate).toHaveBeenCalledWith(['']);
	});

	it('shows the maintenance page during maintenance', () => {
		const { guard } = setup(
			MaintenanceModuleGuard,
			fakeStore({ maintenanceMode: 'api' })
		);

		expect(guard.canActivate(route(), null)).toBe(true);
	});
});

describe('ProductsModuleGuard', () => {
	it('always lets the visitor see the products', async () => {
		const { guard } = setup(ProductsModuleGuard, fakeStore());

		expect(await guard.canActivate(route(), null)).toBe(true);
	});
});
