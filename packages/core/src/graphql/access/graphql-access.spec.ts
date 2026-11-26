import fs from 'fs';
import path from 'path';
import { GRAPHQL_ACCESS } from './graphql-access';
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
			/(?:extend\s+)?type\s+(?:Query|Mutation|Subscription)\s*\{([\s\S]*?)\n\}/g
		);

		for (const [, body] of blocks) {
			let depth = 0;

			for (const line of body.split('\n')) {
				const m = /^\s+([A-Za-z_][A-Za-z0-9_]*)\s*[(:]/.exec(line);

				if (depth === 0 && m && !line.trim().startsWith('#')) {
					ops.add(m[1]);
				}

				depth += (line.match(/\(/g) ?? []).length - (line.match(/\)/g) ?? []).length;
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
		expect(Object.keys(GRAPHQL_ACCESS).filter((op) => !ops.has(op))).toEqual([]);
	});

	it('keeps member management, billing and the tenant list away from staff', () => {
		const staff: TenantCtx = {
			tenantId: 't',
			actor: { id: 'a', role: 'admin', tenantRole: 'staff' },
		};

		for (const op of ['registerAdmin', 'setAdminRole', 'updateTenant', 'createBillingCheckout', 'tenants', 'createCurrency']) {
			expect(isAllowed(GRAPHQL_ACCESS[op], staff)).toBe(false);
		}

		expect(isAllowed(GRAPHQL_ACCESS.tenantUsage, staff)).toBe(true);
	});
});

describe('isAllowed', () => {
	const t = 'tenant-a';

	it('refuses an operation without an entry', () => {
		expect(isAllowed(undefined, { tenantId: t, actor: { id: 'x', role: 'admin', isSuperAdmin: true } })).toBe(false);
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
		expect(isAllowed(access, { tenantId: t, actor: { id: 'u', role: 'user' } })).toBe(false);
		expect(isAllowed(access, { tenantId: t, actor: { id: 'w', role: 'warehouse' } })).toBe(true);
	});

	it('limits admins by tenant role, except super-admins', () => {
		const owner = { roles: ['admin'] as any, adminRoles: ['owner'] as any };

		expect(isAllowed(owner, { tenantId: t, actor: { id: 'a', role: 'admin', tenantRole: 'admin' } })).toBe(false);
		expect(isAllowed(owner, { tenantId: t, actor: { id: 'a', role: 'admin', tenantRole: 'owner' } })).toBe(true);
		expect(isAllowed(owner, { tenantId: t, actor: { id: 's', role: 'admin', tenantRole: 'staff', isSuperAdmin: true } })).toBe(true);
	});

	it('keeps super-admin operations to super-admins', () => {
		expect(isAllowed('superAdmin', { tenantId: t, actor: { id: 'a', role: 'admin', tenantRole: 'owner' } })).toBe(false);
		expect(isAllowed('superAdmin', { tenantId: t, actor: { id: 's', role: 'admin', isSuperAdmin: true } })).toBe(true);
	});
});
