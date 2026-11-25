import { of } from 'rxjs';
import type { RpcClient } from './client';
import { createRouters } from './routers';

function fakeClient() {
	const calls: Array<{ router: string; kind: 'run' | 'observe'; method: string; args: unknown[] }> = [];
	const client = {
		router: (router: string) => ({
			run: jest.fn(async (method: string, ...args: unknown[]) => {
				calls.push({ router, kind: 'run', method, args });
				return null;
			}),
			runAndObserve: jest.fn((method: string, ...args: unknown[]) => {
				calls.push({ router, kind: 'observe', method, args });
				return of(null);
			}),
		}),
	} as unknown as RpcClient;
	return { client, calls };
}

describe('createRouters: pyro namespaces, methods and args of the Ionic routers', () => {
	it.each([
		['device.create', (r: ReturnType<typeof createRouters>) => r.device.create({ channelId: null, language: 'en-US', type: 'ios', uuid: 'u' }), 'device', 'run', 'create', [{ channelId: null, language: 'en-US', type: 'ios', uuid: 'u' }]],
		['invite.getInvitesSettings', (r: ReturnType<typeof createRouters>) => r.invite.getInvitesSettings(), 'invite', 'run', 'getInvitesSettings', []],
		['invite.getByCode', (r: ReturnType<typeof createRouters>) => r.invite.getByCode({ inviteCode: '1234' }).subscribe(), 'invite', 'observe', 'getByCode', [{ inviteCode: '1234' }]],
		['invite-request.create', (r: ReturnType<typeof createRouters>) => r.inviteRequest.create({ geoLocation: {} as never, apartment: '0', deviceId: 'd' }), 'invite-request', 'run', 'create', [{ geoLocation: {}, apartment: '0', deviceId: 'd' }]],
		['user-auth.register', (r: ReturnType<typeof createRouters>) => r.userAuth.register({ user: { apartment: '3', geoLocation: {} as never } }), 'user-auth', 'run', 'register', [{ user: { apartment: '3', geoLocation: {} } }]],
		['user.getAboutUs', (r: ReturnType<typeof createRouters>) => r.user.getAboutUs('u', 'd', 'he-IL').subscribe(), 'user', 'observe', 'getAboutUs', ['u', 'd', 'he-IL']],
		['user.addPaymentMethod', (r: ReturnType<typeof createRouters>) => r.user.addPaymentMethod('u', 'tok_1'), 'user', 'run', 'addPaymentMethod', ['u', 'tok_1']],
		['user-products.getPlaceholder', (r: ReturnType<typeof createRouters>) => r.userProducts.getPlaceholder('u', 'd').subscribe(), 'user-products', 'observe', 'getPlaceholder', ['u', 'd']],
		['geo-location.getAddressByCoordinatesUsingArcGIS', (r: ReturnType<typeof createRouters>) => r.geoLocation.getAddressByCoordinatesUsingArcGIS(42, 23), 'geo-location', 'run', 'getAddressByCoordinatesUsingArcGIS', [42, 23]],
		['warehouse.get (full products by default)', (r: ReturnType<typeof createRouters>) => r.warehouse.get('w').subscribe(), 'warehouse', 'observe', 'get', ['w', true]],
		['warehouse-products.get', (r: ReturnType<typeof createRouters>) => r.warehouseProducts.get('w', false).subscribe(), 'warehouse-products', 'observe', 'get', ['w', false]],
		['warehouse-orders.addMore', (r: ReturnType<typeof createRouters>) => r.warehouseOrders.addMore('w', 'u', 'o', [{ count: 1, productId: 'p' }]), 'warehouse-orders', 'run', 'addMore', ['w', 'u', 'o', [{ count: 1, productId: 'p' }]]],
		['warehouse-orders.userComplete', (r: ReturnType<typeof createRouters>) => r.warehouseOrders.userComplete('o'), 'warehouse-orders', 'run', 'userComplete', ['o']],
		['order.get', (r: ReturnType<typeof createRouters>) => r.order.get('o', { populateWarehouse: true, populateCarrier: true }).subscribe(), 'order', 'observe', 'get', ['o', { populateWarehouse: true, populateCarrier: true }]],
		['order.payWithStripe, saved card (2 args)', (r: ReturnType<typeof createRouters>) => r.order.payWithStripe('o', 'card'), 'order', 'run', 'payWithStripe', ['o', 'card']],
		['order.payWithStripe, new card (3 args)', (r: ReturnType<typeof createRouters>) => r.order.payWithStripe('o', 'card', 'USD'), 'order', 'run', 'payWithStripe', ['o', 'card', 'USD']],
		['order.addProductComment', (r: ReturnType<typeof createRouters>) => r.order.addProductComment('o', 'op', 'no onions'), 'order', 'run', 'addProductComment', ['o', 'op', 'no onions']],
		['order.removeProducts', (r: ReturnType<typeof createRouters>) => r.order.removeProducts('o', ['p']), 'order', 'run', 'removeProducts', ['o', ['p']]],
		['order.refundWithStripe', (r: ReturnType<typeof createRouters>) => r.order.refundWithStripe('o'), 'order', 'run', 'refundWithStripe', ['o']],
	])('%s', async (_name, call, router, kind, method, args) => {
		const { client, calls } = fakeClient();
		await call(createRouters(client));
		expect(calls).toEqual([{ router, kind, method, args }]);
	});
});
