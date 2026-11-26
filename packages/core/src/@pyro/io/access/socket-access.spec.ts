import fs from 'fs';
import path from 'path';
import { SOCKET_ACCESS } from './socket-access';
import { isAllowed } from '../../../graphql/access/graphql-access';

/** `<router>.<method>` of every @asyncListener / @observableListener of the services. */
function socketListeners(): string[] {
	const root = path.join(__dirname, '..', '..', '..', 'services');
	const keys = new Set<string>();

	const walk = (dir: string) => {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const full = path.join(dir, entry.name);

			if (entry.isDirectory()) {
				walk(full);
				continue;
			}

			if (!entry.name.endsWith('.ts') || entry.name.endsWith('.spec.ts')) {
				continue;
			}

			const text = fs.readFileSync(full, 'utf8');
			const router = /@routerName\('([^']+)'\)/.exec(text)?.[1];

			if (!router) {
				continue;
			}

			const listener =
				/@(?:asyncListener|observableListener)\(\)\s*(?:@[^\n]*\n\s*)*(?:async\s+)?(?:get\s+)?([A-Za-z0-9_]+)\s*[(<]/g;

			for (const [, method] of text.matchAll(listener)) {
				keys.add(`${router}.${method}`);
			}
		}
	};

	walk(root);

	return [...keys].sort();
}

describe('SOCKET_ACCESS', () => {
	it('has an entry for every socket listener (unlisted ones are refused)', () => {
		const listeners = socketListeners();
		expect(listeners.length).toBeGreaterThan(110);
		expect(listeners.filter((key) => !(key in SOCKET_ACCESS))).toEqual([]);
	});

	it('lists no listener the services do not have', () => {
		const listeners = new Set(socketListeners());
		expect(Object.keys(SOCKET_ACCESS).filter((key) => !listeners.has(key))).toEqual([]);
	});

	it('keeps logins, money and catalog writes away from anonymous sockets', () => {
		const anonymous = { tenantId: 'tenant-a' };

		for (const key of [
			'warehouse.register',
			'carrier.register',
			'order.paid',
			'warehouse-products.changePrice',
			'warehouse-products.add',
			'carrier.updateById',
			'warehouse.save',
			'warehouse-carriers.updatePassword',
			'geo-location-orders.getOrdersForWork',
			'product.save',
		]) {
			expect([key, isAllowed(SOCKET_ACCESS[key], anonymous)]).toEqual([key, false]);
		}
	});

	it('keeps the shop flows open inside a tenant', () => {
		const anonymous = { tenantId: 'tenant-a' };

		for (const key of [
			'user-auth.register',
			'warehouse-orders.create',
			'order.get',
			'geo-location-warehouses.get',
			'device.create',
		]) {
			expect([key, isAllowed(SOCKET_ACCESS[key], anonymous)]).toEqual([key, true]);
		}
	});

	it('keeps staff from making stores', () => {
		const staff = { tenantId: 't', actor: { id: 's', role: 'admin' as const, tenantRole: 'staff' as const } };
		expect(isAllowed(SOCKET_ACCESS['warehouse.register'], staff)).toBe(false);
		expect(isAllowed(SOCKET_ACCESS['carrier.register'], staff)).toBe(false);
	});
});
