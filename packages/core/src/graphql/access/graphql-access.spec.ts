jest.mock('../../tenant/tenant-directory', () => ({
	tenantDirectory: { getDefaultTenantId: () => 'platform-tenant' },
}));

import fs from 'fs';
import path from 'path';
import {
	GRAPHQL_ACCESS,
	GRAPHQL_FIELD_ACCESS,
	isFieldAllowed,
} from './graphql-access';
import { isAllowed } from './graphql-access.guard';
import type { TenantCtx } from '../../tenant/tenant-context';

/** Every field of Query, Mutation and Subscription in the schema files. */
function schemaOperations(): string[] {
	const root = path.join(__dirname, '..');
	const files: string[] = [];

	const walk = (dir: string) => {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) walk(full);
			else if (entry.name.endsWith('.graphql')) files.push(full);
		}
	};

	walk(root);

	const ops = new Set<string>();

	for (const file of files) {
		const text = fs.readFileSync(file, 'utf8');
		const blocks = text.matchAll(
			/(?:extend\s+)?type\s+(?:Query|Mutation|Subscription)\s*\{([\s\S]*?)\n\}/g,
		);

		for (const [, body] of blocks) {
			let depth = 0;

			for (const line of body.split('\n')) {
				const m = /^\s+([A-Za-z_]\w*)\s*[(:]/.exec(line);

				if (depth === 0 && m && !line.trim().startsWith('#')) {
					ops.add(m[1]);
				}

				depth +=
					(line.match(/\(/g) ?? []).length -
					(line.match(/\)/g) ?? []).length;
			}
		}
	}

	return [...ops].sort();
}

describe('GRAPHQL_ACCESS', () => {
	it('has an entry for every operation of the schema (unlisted ones are refused)', () => {
		const ops = schemaOperations();
		expect(ops.length).toBeGreaterThan(140);
		expect(ops.filter((op) => !(op in GRAPHQL_ACCESS))).toEqual([]);
	});

	it('lists no operation the schema does not have', () => {
		const ops = new Set(schemaOperations());
		expect(
			Object.keys(GRAPHQL_ACCESS).filter((op) => !ops.has(op)),
		).toEqual([]);
	});

	it('keeps member management, billing and the tenant list away from staff', () => {
		const staff: TenantCtx = {
			tenantId: 't',
			actor: { id: 'a', role: 'admin', tenantRole: 'staff' },
		};

		for (const op of [
			'registerAdmin',
			'setAdminRole',
			'updateTenant',
			'createBillingCheckout',
			'tenants',
			'createCurrency',
		]) {
			expect(isAllowed(GRAPHQL_ACCESS[op], staff)).toBe(false);
		}

		expect(isAllowed(GRAPHQL_ACCESS.tenantUsage, staff)).toBe(true);
	});
});

describe('isAllowed', () => {
	const t = 'tenant-a';

	it('refuses an operation without an entry', () => {
		expect(
			isAllowed(undefined, {
				tenantId: t,
				actor: { id: 'x', role: 'admin', isSuperAdmin: true },
			}),
		).toBe(false);
	});

	it('lets platform operations run without a tenant', () => {
		expect(isAllowed('platform', undefined)).toBe(true);
		expect(isAllowed('platform', { tenantId: null })).toBe(true);
	});

	it('needs a tenant for public operations', () => {
		expect(isAllowed('public', { tenantId: null })).toBe(false);
		expect(isAllowed('public', { tenantId: t })).toBe(true);
	});

	it('needs a login with an allowed role', () => {
		const access = { roles: ['admin', 'warehouse'] as any };

		expect(isAllowed(access, { tenantId: t })).toBe(false);
		expect(
			isAllowed(access, {
				tenantId: t,
				actor: { id: 'u', role: 'user' },
			}),
		).toBe(false);
		expect(
			isAllowed(access, {
				tenantId: t,
				actor: { id: 'w', role: 'warehouse' },
			}),
		).toBe(true);
	});

	it('limits admins by tenant role, except super-admins', () => {
		const owner = { roles: ['admin'] as any, adminRoles: ['owner'] as any };

		expect(
			isAllowed(owner, {
				tenantId: t,
				actor: { id: 'a', role: 'admin', tenantRole: 'admin' },
			}),
		).toBe(false);
		expect(
			isAllowed(owner, {
				tenantId: t,
				actor: { id: 'a', role: 'admin', tenantRole: 'owner' },
			}),
		).toBe(true);
		expect(
			isAllowed(owner, {
				tenantId: t,
				actor: {
					id: 's',
					role: 'admin',
					tenantRole: 'staff',
					isSuperAdmin: true,
				},
			}),
		).toBe(true);
	});

	it('keeps super-admin operations to super-admins', () => {
		expect(
			isAllowed('superAdmin', {
				tenantId: t,
				actor: { id: 'a', role: 'admin', tenantRole: 'owner' },
			}),
		).toBe(false);
		expect(
			isAllowed('superAdmin', {
				tenantId: t,
				actor: { id: 's', role: 'admin', isSuperAdmin: true },
			}),
		).toBe(true);
	});
});

/** `<Type>.<field>` of every @ResolveField of the resolvers. */
function fieldResolvers(): string[] {
	const root = path.join(__dirname, '..');
	const keys = new Set<string>();

	const walk = (dir: string) => {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const full = path.join(dir, entry.name);

			if (entry.isDirectory()) {
				walk(full);
				continue;
			}

			if (!entry.name.endsWith('.resolver.ts')) {
				continue;
			}

			const text = fs.readFileSync(full, 'utf8');
			const type = /@Resolver\('([^']+)'\)/.exec(text)?.[1];

			for (const [, field] of text.matchAll(
				/@ResolveField\('([^']+)'\)/g,
			)) {
				keys.add(`${type}.${field}`);
			}
		}
	};

	walk(root);

	return [...keys].sort();
}

describe('GRAPHQL_FIELD_ACCESS', () => {
	const t = '0000000000000000000000aa';
	const anonymous: TenantCtx = { tenantId: t };
	const storeA: TenantCtx = {
		tenantId: t,
		actor: { id: 'storeA', role: 'warehouse' },
	};
	const owner: TenantCtx = {
		tenantId: t,
		actor: { id: 'o', role: 'admin', tenantRole: 'owner' },
	};
	const customer: TenantCtx = {
		tenantId: t,
		actor: { id: 'u', role: 'user' },
	};

	it('has an entry for every field resolver (unlisted ones are refused)', () => {
		const fields = fieldResolvers();
		expect(fields.length).toBeGreaterThanOrEqual(8);
		expect(fields.filter((f) => !(f in GRAPHQL_FIELD_ACCESS))).toEqual([]);
		expect(
			Object.keys(GRAPHQL_FIELD_ACCESS).filter(
				(f) => !fields.includes(f),
			),
		).toEqual([]);
	});

	it("keeps a store's orders, customers and carriers from public store lookups", () => {
		for (const field of [
			'Warehouse.orders',
			'Warehouse.users',
			'Warehouse.carriers',
			'Warehouse.devices',
		]) {
			expect(isFieldAllowed(field, anonymous, { id: 'storeA' })).toBe(
				false,
			);
			expect(isFieldAllowed(field, customer, { id: 'storeA' })).toBe(
				false,
			);
			// a store reads its own, never another store's
			expect(isFieldAllowed(field, storeA, { id: 'storeA' })).toBe(true);
			expect(isFieldAllowed(field, storeA, { _id: 'storeB' })).toBe(
				false,
			);
			expect(isFieldAllowed(field, owner, { id: 'storeB' })).toBe(true);
		}
	});

	it("keeps devices (push channels) to admins and the carrier's own", () => {
		expect(isFieldAllowed('User.devices', customer, { id: 'u' })).toBe(
			false,
		);
		expect(isFieldAllowed('User.devices', owner, { id: 'u' })).toBe(true);
		expect(
			isFieldAllowed(
				'Carrier.devices',
				{ tenantId: t, actor: { id: 'c1', role: 'carrier' } },
				{ id: 'c2' },
			),
		).toBe(false);
		expect(
			isFieldAllowed(
				'Carrier.devices',
				{ tenantId: t, actor: { id: 'c1', role: 'carrier' } },
				{ id: 'c1' },
			),
		).toBe(true);
	});

	it('lets shops follow the store and carrier of an order', () => {
		expect(isFieldAllowed('Order.warehouse', anonymous, { id: 'o1' })).toBe(
			true,
		);
		expect(isFieldAllowed('Order.carrier', anonymous, { id: 'o1' })).toBe(
			true,
		);
		expect(isFieldAllowed('Order.unknown', owner, { id: 'o1' })).toBe(
			false,
		);
	});
});

describe('platformAdmin (global data such as currencies)', () => {
	it('is for super-admins and the owners / admins of the platform tenant', () => {
		const platformOwner: TenantCtx = {
			tenantId: 'platform-tenant',
			actor: { id: 'o', role: 'admin', tenantRole: 'owner' },
		};
		const platformStaff: TenantCtx = {
			tenantId: 'platform-tenant',
			actor: { id: 's', role: 'admin', tenantRole: 'staff' },
		};
		const otherOwner: TenantCtx = {
			tenantId: 'acme',
			actor: { id: 'a', role: 'admin', tenantRole: 'owner' },
		};
		const superAdmin: TenantCtx = {
			tenantId: 'acme',
			actor: { id: 'x', role: 'admin', isSuperAdmin: true },
		};
		const store: TenantCtx = {
			tenantId: 'platform-tenant',
			actor: { id: 'w', role: 'warehouse' },
		};

		expect(isAllowed(GRAPHQL_ACCESS.createCurrency, platformOwner)).toBe(
			true,
		);
		expect(isAllowed(GRAPHQL_ACCESS.createCurrency, superAdmin)).toBe(true);
		expect(isAllowed(GRAPHQL_ACCESS.createCurrency, platformStaff)).toBe(
			false,
		);
		expect(isAllowed(GRAPHQL_ACCESS.createCurrency, otherOwner)).toBe(
			false,
		);
		expect(isAllowed(GRAPHQL_ACCESS.createCurrency, store)).toBe(false);
	});
});
