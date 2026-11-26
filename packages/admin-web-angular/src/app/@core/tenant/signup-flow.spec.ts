import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ApolloTestingController } from 'apollo-angular/testing';
import { RoutersService } from '@modules/client.common.angular2/lib/router/routers.service';
import {
	expectOperation,
	setupApolloTesting,
} from '../../../testing/apollo-testing';
import { Store } from '../data/store.service';
import { TenantsService } from '../data/tenants.service';
import { ServerSettingsService } from '../services/server-settings.service';
import { BrowserNavigation } from '../utils/browser-navigation';
import { AdminSessionService } from './admin-session.service';
import { SignupFlowService } from './signup-flow.service';

const tenant = {
	id: 't1',
	name: 'Green Grocer',
	slug: 'green-grocer',
	status: 'active',
	plan: 'starter',
	ownerId: 'a1',
	isPlatform: false,
	createdAt: null,
	billing: { hasCustomer: false, hasSubscription: false },
	settings: {},
};

const signupResult = {
	token: 'owner-jwt',
	tenant,
	admin: {
		_id: 'a1',
		id: 'a1',
		email: 'owner@green.test',
		name: 'Ada Owner',
		pictureUrl: '',
		role: 'owner',
		isSuperAdmin: false,
		tenantId: 't1',
	},
};

const input = {
	businessName: '  Green Grocer ',
	slug: ' Green-Grocer ',
	email: ' Owner@Green.test ',
	password: 'secret-pass',
	firstName: ' Ada ',
	lastName: '',
};

describe('tenant signup flow and session', () => {
	let controller: ApolloTestingController;
	let store: Store;
	let router: { navigate: ReturnType<typeof vi.fn>; navigateByUrl: ReturnType<typeof vi.fn> };
	let routers: { reconnectAll: ReturnType<typeof vi.fn> };
	let browser: { assign: ReturnType<typeof vi.fn> };
	let settings: { load: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		localStorage.clear();
		router = {
			navigate: vi.fn().mockResolvedValue(true),
			navigateByUrl: vi.fn().mockResolvedValue(true),
		};
		routers = { reconnectAll: vi.fn() };
		browser = { assign: vi.fn() };
		settings = { load: vi.fn().mockResolvedValue(true) };
		({ controller } = setupApolloTesting([
			Store,
			TenantsService,
			{ provide: Router, useValue: router },
			{ provide: RoutersService, useValue: routers },
			{ provide: BrowserNavigation, useValue: browser },
			{ provide: ServerSettingsService, useValue: settings },
		]));
		store = TestBed.inject(Store);
	});

	afterEach(() => {
		controller.verify();
		localStorage.clear();
	});

	async function flushSignup() {
		const op = await expectOperation(controller, 'SignupTenant');
		expect(op.operation.variables).toEqual({
			input: {
				businessName: 'Green Grocer',
				slug: 'green-grocer',
				email: 'owner@green.test',
				password: 'secret-pass',
				firstName: 'Ada',
				lastName: undefined,
			},
		});
		op.flush({ data: { signupTenant: signupResult } });
	}

	it('Starter: signs up, keeps the session like a login, reconnects, opens the dashboard', async () => {
		store.isSuperAdmin = true;
		store.switchedTenant = 'old-tenant';

		const flow = TestBed.inject(SignupFlowService);
		const outcome = flow.signup(input, { plan: 'starter', paid: false });
		await flushSignup();

		await expect(outcome).resolves.toEqual({ kind: 'dashboard' });
		expect(store.token).toBe('owner-jwt');
		expect(store.adminId).toBe('a1');
		expect(store.adminRole).toBe('owner');
		expect(store.isSuperAdmin).toBe(false);
		expect(store.adminTenantId).toBe('t1');
		// a new login never keeps a previous super-admin switch
		expect(localStorage.getItem('_superAdminTenant')).toBeNull();
		expect(routers.reconnectAll).toHaveBeenCalledTimes(1);
		expect(settings.load).toHaveBeenCalled();
		expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
		expect(browser.assign).not.toHaveBeenCalled();
		// no Checkout for the free plan: controller.verify() finds no open operation
	});

	it('paid plan: opens Stripe Checkout for the plan and interval', async () => {
		const flow = TestBed.inject(SignupFlowService);
		const outcome = flow.signup(
			input,
			{ plan: 'small_business', paid: true },
			'annual',
		);
		await flushSignup();

		const checkout = await expectOperation(controller, 'CreateBillingCheckout');
		expect(checkout.operation.variables).toEqual({
			input: { plan: 'small_business', interval: 'annual', extraMembers: 0 },
		});
		// the owner is logged in before Checkout (the mutation is owner-only)
		expect(store.token).toBe('owner-jwt');
		checkout.flush({
			data: {
				createBillingCheckout: {
					url: 'https://checkout.stripe.com/c/pay/cs_test_1',
				},
			},
		});

		await expect(outcome).resolves.toEqual({
			kind: 'checkout',
			url: 'https://checkout.stripe.com/c/pay/cs_test_1',
		});
		expect(browser.assign).toHaveBeenCalledWith(
			'https://checkout.stripe.com/c/pay/cs_test_1',
		);
		expect(router.navigate).not.toHaveBeenCalled();
	});

	it('paid plan, Checkout fails: the owner lands in Settings → Billing', async () => {
		const flow = TestBed.inject(SignupFlowService);
		const outcome = flow.signup(input, { plan: 'enterprise', paid: true });
		await flushSignup();

		(await expectOperation(controller, 'CreateBillingCheckout')).flush({
			errors: [{ message: 'Billing is not configured on this server' } as any],
		});

		const result = await outcome;
		expect(result.kind).toBe('checkout-failed');
		expect((result as any).error).toContain('Billing is not configured');
		expect(router.navigate).toHaveBeenCalledWith(['/settings/billing'], {
			queryParams: { checkout: 'failed' },
		});
		expect(browser.assign).not.toHaveBeenCalled();
		expect(store.token).toBe('owner-jwt');
	});

	it('a refused signup keeps nobody logged in', async () => {
		const flow = TestBed.inject(SignupFlowService);
		const outcome = flow.signup(input, { plan: 'starter', paid: false });

		(await expectOperation(controller, 'SignupTenant')).flush({
			errors: [{ message: 'The address "green-grocer" is taken' } as any],
		});

		await expect(outcome).rejects.toThrow(/is taken/);
		expect(store.token).toBeNull();
		expect(routers.reconnectAll).not.toHaveBeenCalled();
		expect(router.navigate).not.toHaveBeenCalled();
	});

	describe('super-admin tenant switch', () => {
		it('is refused to a normal admin', async () => {
			const session = TestBed.inject(AdminSessionService);
			await expect(session.switchTenant('tenant-b')).rejects.toThrow(
				/super-admin/,
			);
			expect(store.switchedTenant).toBeNull();
			expect(routers.reconnectAll).not.toHaveBeenCalled();
		});

		it('keeps the slug, reconnects the sockets and loads the screens again', async () => {
			store.isSuperAdmin = true;
			const session = TestBed.inject(AdminSessionService);

			await session.switchTenant('Tenant-A');
			expect(store.switchedTenant).toBe('tenant-a');
			expect(routers.reconnectAll).toHaveBeenCalledTimes(1);
			expect(router.navigateByUrl).toHaveBeenCalledWith('/sign-in-redirect');

			// "Platform (default)"
			await session.switchTenant(null);
			expect(store.switchedTenant).toBeNull();
			expect(routers.reconnectAll).toHaveBeenCalledTimes(2);
		});

		it('a super-admin flag that is gone drops the switch', () => {
			store.isSuperAdmin = true;
			store.switchedTenant = 'tenant-a';
			const session = TestBed.inject(AdminSessionService);

			session.refresh({ role: 'admin', isSuperAdmin: false });
			expect(store.isSuperAdmin).toBe(false);
			expect(store.adminRole).toBe('admin');
			expect(localStorage.getItem('_superAdminTenant')).toBeNull();
			expect(session.permissions().canManageBilling).toBe(false);
		});
	});
});
