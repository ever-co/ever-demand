import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from '@app/@core/toaster';
import { Store } from '@app/@core/data/store.service';
import { TenantsService } from '@app/@core/data/tenants.service';
import { AdminSessionService } from '@app/@core/tenant/admin-session.service';
import { tenantPermissions } from '@app/@core/tenant/tenant-rules';
import { BrowserNavigation } from '@app/@core/utils/browser-navigation';
import { MembersComponent } from './members/members.component';
import { BillingComponent } from './billing/billing.component';

@Pipe({ name: 'translate', standalone: false })
class TranslateStubPipe implements PipeTransform {
	transform(key: string): string {
		return key;
	}
}

const MEMBERS = [
	{
		id: 'o1',
		name: 'Olga Owner',
		email: 'owner@a.test',
		role: 'owner',
		isSuperAdmin: false,
	},
	{
		id: 'a1',
		name: 'Adam Admin',
		email: 'admin@a.test',
		role: 'admin',
		isSuperAdmin: false,
	},
	{
		id: 's1',
		name: 'Sam Staff',
		email: 'staff@a.test',
		role: 'staff',
		isSuperAdmin: false,
	},
];

const PLANS = [
	{
		plan: 'starter',
		label: 'Starter',
		includedMembers: 15,
		extraMembers: false,
		maxStores: 3,
		monthlyPrice: 0,
		annualMonthlyPrice: 0,
		paid: false,
	},
	{
		plan: 'small_business',
		label: 'Business',
		includedMembers: 25,
		extraMembers: true,
		maxStores: 3,
		monthlyPrice: 49,
		annualMonthlyPrice: 34,
		extraMemberPrice: 5,
		paid: true,
	},
	{
		plan: 'enterprise',
		label: 'Unlimited',
		includedMembers: 50,
		extraMembers: true,
		maxStores: null,
		monthlyPrice: 499,
		annualMonthlyPrice: 349,
		extraMemberPrice: 10,
		paid: true,
	},
];

const USAGE = {
	plan: 'starter',
	effectivePlan: 'starter',
	members: 4,
	admins: 3,
	carriers: 0,
	stores: 1,
	includedMembers: 15,
	extraMembers: 0,
	memberLimit: 15,
	storeLimit: 3,
	enforced: true,
};

function tenantWith(billing: Record<string, unknown> = {}) {
	return {
		id: 't1',
		name: 'Tenant A',
		slug: 'tenant-a',
		status: 'active',
		plan: 'starter',
		isPlatform: false,
		settings: {},
		billing: { hasCustomer: false, hasSubscription: false, ...billing },
	};
}

describe('Settings screens: what each role sees', () => {
	let tenants: Record<string, ReturnType<typeof vi.fn>>;
	let browser: { assign: ReturnType<typeof vi.fn> };
	let toaster: { pop: ReturnType<typeof vi.fn> };
	let role: string;
	let superAdmin: boolean;
	let checkout: string | null;

	beforeEach(() => {
		role = 'owner';
		superAdmin = false;
		checkout = null;
		tenants = {
			members: vi.fn().mockResolvedValue(MEMBERS),
			invite: vi.fn().mockResolvedValue({ id: 'n1' }),
			setRole: vi.fn().mockResolvedValue({}),
			remove: vi.fn().mockResolvedValue(true),
			current: vi.fn().mockResolvedValue(tenantWith()),
			usage: vi.fn().mockResolvedValue(USAGE),
			plans: vi.fn().mockResolvedValue(PLANS),
			checkout: vi.fn().mockResolvedValue({
				url: 'https://checkout.stripe.com/c/pay/cs_test_1',
			}),
			portal: vi.fn().mockResolvedValue({
				url: 'https://billing.stripe.com/p/session/test_1',
			}),
		};
		browser = { assign: vi.fn() };
		toaster = { pop: vi.fn() };
	});

	function configure() {
		const store = {
			adminId: role === 'owner' ? 'o1' : role === 'admin' ? 'a1' : 's1',
		};
		TestBed.configureTestingModule({
			imports: [ReactiveFormsModule, FormsModule],
			declarations: [
				MembersComponent,
				BillingComponent,
				TranslateStubPipe,
			],
			providers: [
				{ provide: TenantsService, useValue: tenants },
				{ provide: Store, useValue: store },
				{
					provide: AdminSessionService,
					useValue: {
						permissions: () => tenantPermissions(role, superAdmin),
					},
				},
				{ provide: ToasterService, useValue: toaster },
				{
					provide: TranslateService,
					useValue: { instant: (k: string) => k },
				},
				{ provide: NgbModal, useValue: { open: vi.fn() } },
				{ provide: BrowserNavigation, useValue: browser },
				{
					provide: ActivatedRoute,
					useValue: {
						snapshot: {
							queryParamMap: convertToParamMap(
								checkout ? { checkout } : {},
							),
						},
					},
				},
			],
			schemas: [NO_ERRORS_SCHEMA],
		});
	}

	async function render<T>(
		type: new (...args: any[]) => T,
	): Promise<ComponentFixture<T>> {
		configure();
		const fixture = TestBed.createComponent(type);
		fixture.detectChanges();
		await fixture.whenStable();
		await vi.waitFor(() =>
			expect((fixture.componentInstance as any).loading).toBe(false),
		);
		fixture.detectChanges();
		return fixture;
	}

	const q = (f: ComponentFixture<unknown>, sel: string): HTMLElement[] =>
		Array.from((f.nativeElement as HTMLElement).querySelectorAll(sel));

	describe('Members', () => {
		it('owner: adds members, changes roles (incl. ownership), removes others', async () => {
			const f = await render(MembersComponent);

			expect(q(f, 'form.invite').length).toBe(1);
			// the owner row has a fixed role; admin and staff rows get a select
			expect(q(f, 'tr[data-member="owner@a.test"] select').length).toBe(
				0,
			);
			const staffRoles = q(
				f,
				'tr[data-member="staff@a.test"] select option',
			).map((o) => o.textContent.trim());
			expect(staffRoles).toEqual([
				'TENANT_VIEW.MEMBERS.ROLES.owner',
				'TENANT_VIEW.MEMBERS.ROLES.admin',
				'TENANT_VIEW.MEMBERS.ROLES.staff',
			]);
			// nobody removes the owner or themselves
			expect(q(f, 'tr[data-member="owner@a.test"] button').length).toBe(
				0,
			);
			expect(q(f, 'tr[data-member="admin@a.test"] button').length).toBe(
				1,
			);
			expect(q(f, 'tr[data-member="staff@a.test"] button').length).toBe(
				1,
			);
		});

		it('admin: no ownership handover, cannot remove themselves', async () => {
			role = 'admin';
			const f = await render(MembersComponent);

			expect(q(f, 'form.invite').length).toBe(1);
			const staffRoles = q(
				f,
				'tr[data-member="staff@a.test"] select option',
			).map((o) => o.textContent.trim());
			expect(staffRoles).toEqual([
				'TENANT_VIEW.MEMBERS.ROLES.admin',
				'TENANT_VIEW.MEMBERS.ROLES.staff',
			]);
			expect(q(f, 'tr[data-member="admin@a.test"] button').length).toBe(
				0,
			);
			expect(q(f, 'tr[data-member="staff@a.test"] button').length).toBe(
				1,
			);
		});

		it('staff: read-only list', async () => {
			role = 'staff';
			const f = await render(MembersComponent);

			expect(q(f, 'tr[data-member]').length).toBe(3);
			expect(q(f, 'form.invite').length).toBe(0);
			expect(q(f, 'select.role-select').length).toBe(0);
			expect(q(f, 'tbody button').length).toBe(0);
			expect(f.nativeElement.textContent).toContain(
				'TENANT_VIEW.MEMBERS.READ_ONLY',
			);
		});

		it('adds a member with the chosen role through registerAdmin', async () => {
			const f = await render(MembersComponent);
			const c = f.componentInstance;

			c.form.setValue({
				name: 'New Staff',
				email: 'new@a.test',
				password: 'long-enough',
				role: 'admin',
			});
			await c.invite();

			expect(tenants.invite).toHaveBeenCalledWith({
				name: 'New Staff',
				email: 'new@a.test',
				password: 'long-enough',
				role: 'admin',
			});
			expect(toaster.pop).toHaveBeenCalledWith(
				'success',
				'TENANT_VIEW.MEMBERS.ADDED',
			);
			expect(tenants.members).toHaveBeenCalledTimes(2);
		});

		it('a role change outside what the role may do is not sent', async () => {
			role = 'admin';
			const f = await render(MembersComponent);
			const staff = f.componentInstance.members.find(
				(m) => m.id === 's1',
			);

			await f.componentInstance.changeRole(staff, 'owner');
			expect(tenants.setRole).not.toHaveBeenCalled();

			await f.componentInstance.changeRole(staff, 'admin');
			expect(tenants.setRole).toHaveBeenCalledWith('s1', 'admin');
		});
	});

	describe('Billing', () => {
		it('owner without a subscription: usage, limits and the upgrade', async () => {
			const f = await render(BillingComponent);

			expect(
				q(f, '[data-test="members-usage"]')[0].textContent,
			).toContain('TENANT_VIEW.BILLING.USED_OF');
			expect(q(f, '#billing-upgrade').length).toBe(1);
			// no Stripe customer yet: no portal
			expect(q(f, '#billing-manage').length).toBe(0);
			expect(f.componentInstance.chosenPlan).toBe('small_business');

			f.componentInstance.interval = 'annual';
			f.componentInstance.extraMembers = 2;
			await f.componentInstance.checkout();
			expect(tenants.checkout).toHaveBeenCalledWith({
				plan: 'small_business',
				interval: 'annual',
				extraMembers: 2,
			});
			expect(browser.assign).toHaveBeenCalledWith(
				'https://checkout.stripe.com/c/pay/cs_test_1',
			);
		});

		it('owner with a subscription: the portal instead of a new Checkout', async () => {
			tenants.current.mockResolvedValue(
				tenantWith({
					hasCustomer: true,
					hasSubscription: true,
					status: 'trialing',
				}),
			);
			const f = await render(BillingComponent);

			expect(q(f, '#billing-upgrade').length).toBe(0);
			expect(q(f, '#billing-manage').length).toBe(1);
			await f.componentInstance.manage();
			expect(browser.assign).toHaveBeenCalledWith(
				'https://billing.stripe.com/p/session/test_1',
			);
		});

		it('admin and staff: billing is read-only (owner only)', async () => {
			for (const r of ['admin', 'staff']) {
				TestBed.resetTestingModule();
				role = r;
				tenants.current.mockResolvedValue(
					tenantWith({ hasCustomer: true }),
				);
				const f = await render(BillingComponent);

				expect(q(f, '#billing-upgrade').length).toBe(0);
				expect(q(f, '#billing-manage').length).toBe(0);
				expect(f.nativeElement.textContent).toContain(
					'TENANT_VIEW.BILLING.OWNER_ONLY',
				);

				await f.componentInstance.checkout();
				await f.componentInstance.manage();
				expect(tenants.checkout).not.toHaveBeenCalled();
				expect(tenants.portal).not.toHaveBeenCalled();
			}
		});

		it('a super-admin acting in the tenant counts as its owner', async () => {
			role = 'staff';
			superAdmin = true;
			const f = await render(BillingComponent);
			expect(q(f, '#billing-upgrade').length).toBe(1);
		});

		it('shows the result Stripe Checkout came back with', async () => {
			checkout = 'cancelled';
			const f = await render(BillingComponent);
			expect(
				q(f, '[data-test="checkout-notice"]')[0].textContent,
			).toContain('TENANT_VIEW.BILLING.CHECKOUT_CANCELLED');
		});

		it('a Checkout URL that is not http(s) is not followed', async () => {
			tenants.checkout.mockResolvedValue({ url: 'javascript:alert(1)' });
			const f = await render(BillingComponent);
			await f.componentInstance.checkout();
			expect(browser.assign).not.toHaveBeenCalled();
			expect(toaster.pop).toHaveBeenCalledWith(
				'error',
				expect.stringMatching(/no valid address/),
			);
		});
	});
});
