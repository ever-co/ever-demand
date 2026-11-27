import {
	billingNotice,
	cleanBaseDomain,
	isHttpUrl,
	isValidSlug,
	memberActions,
	planLabel,
	shopAddress,
	slugProblem,
	suggestSlug,
	tenantPermissions,
} from './tenant-rules';

describe('tenant rules', () => {
	describe('suggestSlug', () => {
		it('turns a business name into a lower case address', () => {
			expect(suggestSlug('Green Grocer')).toBe('green-grocer');
			expect(suggestSlug('  ACME  Foods, Ltd.  ')).toBe('acme-foods-ltd');
			expect(suggestSlug('Bob & Sons')).toBe('bob-and-sons');
		});

		it('drops accents and anything that is not a-z or 0-9', () => {
			expect(suggestSlug('Café Ñandú 24/7')).toBe('cafe-nandu-24-7');
			expect(suggestSlug('--Pizza!!!--')).toBe('pizza');
		});

		it('keeps 40 characters and never ends on a dash', () => {
			const slug = suggestSlug('a'.repeat(39) + ' b c');
			expect(slug.length).toBeLessThanOrEqual(40);
			expect(slug.endsWith('-')).toBe(false);
			expect(isValidSlug(slug)).toBe(true);
		});

		it('suggests nothing when too little is left of the name', () => {
			expect(suggestSlug('')).toBe('');
			expect(suggestSlug(null)).toBe('');
			expect(suggestSlug('AB')).toBe('');
			expect(suggestSlug('Магазин')).toBe('');
		});

		it('every suggestion is a valid address', () => {
			for (const name of [
				'Green Grocer',
				'Bob & Sons',
				'Café 1',
				'x-y-z',
			]) {
				expect(slugProblem(suggestSlug(name))).toBeNull();
			}
		});
	});

	describe('slugProblem', () => {
		it('accepts what the API accepts', () => {
			expect(slugProblem('abc')).toBeNull();
			expect(slugProblem('green-grocer-2')).toBeNull();
			expect(slugProblem('a'.repeat(40))).toBeNull();
		});

		it('names what is wrong', () => {
			expect(slugProblem('')).toBe('REQUIRED');
			expect(slugProblem('  ')).toBe('REQUIRED');
			expect(slugProblem('ab')).toBe('TOO_SHORT');
			expect(slugProblem('a'.repeat(41))).toBe('TOO_LONG');
			expect(slugProblem('Green')).toBe('FORMAT');
			expect(slugProblem('-green')).toBe('FORMAT');
			expect(slugProblem('green-')).toBe('FORMAT');
			expect(slugProblem('green--grocer')).toBe('FORMAT');
			expect(slugProblem('green_grocer')).toBe('FORMAT');
			expect(slugProblem('green grocer')).toBe('FORMAT');
		});
	});

	describe('shop address', () => {
		it('is <slug>.<TENANT_BASE_DOMAIN>', () => {
			expect(shopAddress('acme', 'everdemand.co')).toBe(
				'acme.everdemand.co',
			);
			expect(shopAddress('acme', '.EverDemand.co.')).toBe(
				'acme.everdemand.co',
			);
		});

		it('is null without a base domain, or with the Docker placeholder', () => {
			expect(shopAddress('acme', '')).toBeNull();
			expect(shopAddress('acme', undefined)).toBeNull();
			expect(shopAddress('acme', 'DOCKER_TENANT_BASE_DOMAIN')).toBeNull();
			expect(shopAddress('', 'everdemand.co')).toBeNull();
			expect(cleanBaseDomain('DOCKER_TENANT_BASE_DOMAIN')).toBe('');
		});
	});

	describe('role-based visibility', () => {
		it('owner: everything', () => {
			expect(tenantPermissions('owner')).toEqual({
				canEditTenant: true,
				canManageMembers: true,
				canManageBilling: true,
				canMakeOwner: true,
			});
		});

		it('admin: settings and members, no billing, no ownership', () => {
			expect(tenantPermissions('admin')).toEqual({
				canEditTenant: true,
				canManageMembers: true,
				canManageBilling: false,
				canMakeOwner: false,
			});
		});

		it('staff (and an unknown role): read-only', () => {
			const readOnly = {
				canEditTenant: false,
				canManageMembers: false,
				canManageBilling: false,
				canMakeOwner: false,
			};
			expect(tenantPermissions('staff')).toEqual(readOnly);
			expect(tenantPermissions(null)).toEqual(readOnly);
			expect(tenantPermissions('warehouse')).toEqual(readOnly);
		});

		it('a super-admin counts as the owner of the tenant they act in', () => {
			expect(tenantPermissions('staff', true).canManageBilling).toBe(
				true,
			);
			expect(tenantPermissions(null, true).canMakeOwner).toBe(true);
		});

		it('member actions: the owner row is fixed; nobody removes themselves', () => {
			const owner = tenantPermissions('owner');
			const admin = tenantPermissions('admin');
			const staff = tenantPermissions('staff');

			expect(
				memberActions({ id: 'o', role: 'owner' }, 'a', admin),
			).toEqual({
				roles: [],
				canRemove: false,
			});
			expect(
				memberActions({ id: 's', role: 'staff' }, 'o', owner),
			).toEqual({
				roles: ['owner', 'admin', 'staff'],
				canRemove: true,
			});
			// an admin cannot hand over ownership
			expect(
				memberActions({ id: 's', role: 'staff' }, 'a', admin),
			).toEqual({
				roles: ['admin', 'staff'],
				canRemove: true,
			});
			expect(
				memberActions({ id: 'a', role: 'admin' }, 'a', admin).canRemove,
			).toBe(false);
			// staff see the list only
			expect(
				memberActions({ id: 'x', role: 'admin' }, 's', staff),
			).toEqual({
				roles: [],
				canRemove: false,
			});
		});
	});

	it('plan labels follow the Stripe lookup keys', () => {
		expect(planLabel('starter')).toBe('Starter');
		expect(planLabel('small_business')).toBe('Business');
		expect(planLabel('enterprise')).toBe('Unlimited');
		expect(planLabel('other')).toBe('other');
	});

	it('billing notices: only the values Stripe and the signup send', () => {
		expect(billingNotice('success')).toBe('success');
		expect(billingNotice('cancelled')).toBe('cancelled');
		expect(billingNotice('failed')).toBe('failed');
		expect(billingNotice('<script>')).toBeNull();
		expect(billingNotice(null)).toBeNull();
	});

	it('only http(s) billing URLs are followed', () => {
		expect(isHttpUrl('https://checkout.stripe.com/c/pay/cs_test_1')).toBe(
			true,
		);
		expect(isHttpUrl('javascript:alert(1)')).toBe(false);
		expect(isHttpUrl('')).toBe(false);
		expect(isHttpUrl(null)).toBe(false);
	});
});
