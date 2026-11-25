import { NEVER, of, throwError } from 'rxjs';
import { DeliveryType, RegistrationSystem } from '../domain/enums';
import { createAppStore } from '../store';
import { initialSessionState, type SessionState } from '../store/session';
import { createMockGraphQL, createMockRouters, createTestServices } from '../test/harness';
import * as fx from '../test/fixtures';
import {
	bootstrap,
	checkServer,
	maintenanceModeOf,
	maintenanceStatusOf,
	registerDevice,
	verifyUser,
} from './bootstrap';
import { buy, cancelOpenOrder, closeIssue, openOrderWarehouse } from './orders';
import { CANT_PAY_IN_APP, loadStripeCurrency, payWithNewCard, payWithSavedCard } from './payment';

const storeWith = (session: Partial<SessionState> = {}) =>
	createAppStore({ session: { ...initialSessionState, ...session } });

describe('payment rules (fleet fixes #1645-#1654)', () => {
	const setup = (session: Partial<SessionState> = { userId: 'user-1', orderId: 'order-1' }) => {
		const routers = createMockRouters();
		const store = storeWith(session);
		const tellCustomer = jest.fn();
		return { routers, store, tellCustomer, deps: { routers, store, tellCustomer, stripePublishableKey: 'pk_test' } };
	};

	it('saved card: charges with 2 args and clears the paying flag', async () => {
		const { deps, routers, store } = setup();
		const paid = payWithSavedCard(deps, 'order-1', 'card-1');
		expect(store.getState().ui.payingOrderIds).toEqual(['order-1']);
		await expect(paid).resolves.toMatchObject({ isPaid: true });
		expect(routers.order.payWithStripe).toHaveBeenCalledWith('order-1', 'card-1');
		expect(store.getState().ui.payingOrderIds).toEqual([]);
	});

	it('saved card: a second tap while paying does nothing', async () => {
		const { deps, routers, store } = setup();
		store.dispatch({ type: 'ui/startPaying', payload: 'order-1' });
		await expect(payWithSavedCard(deps, 'order-1', 'card-1')).resolves.toBeUndefined();
		expect(routers.order.payWithStripe).not.toHaveBeenCalled();
	});

	it('saved card: a failure tells the customer PAYMENT_FAILED and resolves', async () => {
		const { deps, routers, tellCustomer, store } = setup();
		(routers.order.payWithStripe as jest.Mock).mockRejectedValueOnce(new Error('card declined'));
		jest.spyOn(console, 'error').mockImplementation(() => undefined);
		await expect(payWithSavedCard(deps, 'order-1', 'card-1')).resolves.toBeUndefined();
		expect(tellCustomer).toHaveBeenCalledWith('BUY_POPUP.PAYMENT_FAILED');
		expect(store.getState().ui.payingOrderIds).toEqual([]);
	});

	it("saved card: no Stripe key means \"Can't pay in app\"", async () => {
		const { deps } = setup();
		await expect(payWithSavedCard({ ...deps, stripePublishableKey: '' }, 'order-1', 'card-1')).rejects.toThrow(CANT_PAY_IN_APP);
	});

	it('new card: email, card, charge with the shown currency, confirm', async () => {
		const { deps, routers } = setup();
		const result = await payWithNewCard(deps, 'order-1', 'user-1', { id: 'tok_1', email: 'a@b.co' }, 'USD');
		expect(result).toEqual({ paid: true, currencyChanged: false });
		expect(routers.user.updateEmail).toHaveBeenCalledWith('user-1', 'a@b.co');
		expect(routers.user.addPaymentMethod).toHaveBeenCalledWith('user-1', 'tok_1');
		expect(routers.order.payWithStripe).toHaveBeenCalledWith('order-1', 'card-1', 'USD');
		expect(routers.order.confirm).toHaveBeenCalledWith('order-1');
	});

	it('new card: an email that cannot be saved stops before the card is charged', async () => {
		const { deps, routers, tellCustomer } = setup();
		jest.spyOn(console, 'error').mockImplementation(() => undefined);
		(routers.user.updateEmail as jest.Mock).mockRejectedValueOnce(new Error('email taken'));
		const result = await payWithNewCard(deps, 'order-1', 'user-1', { id: 'tok_1', email: 'a@b.co' }, 'USD');
		expect(result.paid).toBe(false);
		expect(tellCustomer).toHaveBeenCalledWith('BUY_POPUP.EMAIL_NOT_SAVED');
		expect(routers.user.addPaymentMethod).not.toHaveBeenCalled();
		expect(routers.order.payWithStripe).not.toHaveBeenCalled();
	});

	it('new card: a changed server currency is reported so the client reloads it', async () => {
		const { deps, routers, tellCustomer } = setup();
		jest.spyOn(console, 'error').mockImplementation(() => undefined);
		const error = Object.assign(new Error('currency changed'), { name: 'StripeCurrencyChangedError' });
		(routers.order.payWithStripe as jest.Mock).mockRejectedValueOnce(error);
		const result = await payWithNewCard(deps, 'order-1', 'user-1', { id: 'tok_1', email: 'a@b.co' }, 'USD');
		expect(result).toEqual({ paid: false, currencyChanged: true });
		expect(tellCustomer).toHaveBeenCalledWith('BUY_POPUP.PAYMENT_FAILED');
		expect(routers.order.confirm).not.toHaveBeenCalled();
	});

	it('new card: a failed confirm still counts as paid (only logged)', async () => {
		const { deps, routers, tellCustomer } = setup();
		jest.spyOn(console, 'error').mockImplementation(() => undefined);
		(routers.order.confirm as jest.Mock).mockRejectedValueOnce(new Error('nope'));
		const result = await payWithNewCard(deps, 'order-1', 'user-1', { id: 'tok_1', email: 'a@b.co' }, 'USD');
		expect(result.paid).toBe(true);
		expect(tellCustomer).not.toHaveBeenCalled();
	});

	it('currency is upper-cased; a failure resolves null', async () => {
		const routers = createMockRouters();
		await expect(loadStripeCurrency(routers)).resolves.toBe('USD');
		jest.spyOn(console, 'error').mockImplementation(() => undefined);
		(routers.order.getStripeCurrency as jest.Mock).mockRejectedValueOnce(new Error('down'));
		await expect(loadStripeCurrency(routers)).resolves.toBeNull();
	});
});

describe('buy / cancel / issue', () => {
	const deps = (session: Partial<SessionState>, shoppingCart = false) => ({
		routers: createMockRouters(),
		graphql: createMockGraphQL(),
		store: storeWith(session),
		shoppingCart,
	});

	it('creates an order with the delivery type and auto-confirm, and stores it', async () => {
		const d = deps({ userId: 'user-1', deliveryType: DeliveryType.Takeaway });
		await expect(buy(d, { productId: 'p1', warehouseId: 'warehouse-1', resumeId: 'wp1' })).resolves.toBe('ordered');
		expect(d.routers.warehouseOrders.create).toHaveBeenCalledWith({
			warehouseId: 'warehouse-1',
			products: [{ count: 1, productId: 'p1' }],
			userId: 'user-1',
			orderType: DeliveryType.Takeaway,
			waitForCompletion: false,
			options: { autoConfirm: true },
		});
		expect(d.store.getState().session).toMatchObject({ orderId: 'order-1', orderWarehouseId: 'warehouse-1' });
	});

	it('adds to the open order from the feed (shopping cart)', async () => {
		const d = deps({ userId: 'user-1', orderId: 'order-9' }, true);
		await buy(d, { productId: 'p2', warehouseId: 'warehouse-1', resumeId: 'wp2' });
		expect(d.routers.warehouseOrders.addMore).toHaveBeenCalledWith('warehouse-1', 'user-1', 'order-9', [{ count: 1, productId: 'p2' }]);
		expect(d.routers.warehouseOrders.create).not.toHaveBeenCalled();
	});

	it('product details always creates a new order, without waitForCompletion', async () => {
		const d = deps({ userId: 'user-1', orderId: 'order-9' });
		await buy(d, { productId: 'p2', warehouseId: 'w', resumeId: 'p2', fromDetails: true });
		expect((d.routers.warehouseOrders.create as jest.Mock).mock.calls[0][0]).not.toHaveProperty('waitForCompletion');
	});

	it('"browse first": remembers the product and asks for an invite', async () => {
		const d = deps({ registrationSystem: RegistrationSystem.Disabled });
		await expect(buy(d, { productId: 'p1', warehouseId: 'w1', resumeId: 'p1', fromDetails: true })).resolves.toBe('invite');
		expect(d.store.getState().session).toMatchObject({
			registrationSystem: 'once',
			buyProduct: 'p1',
			warehouseId: 'w1',
			backToDetails: 'p1',
		});
	});

	it('a refused order (sold out) returns failed', async () => {
		const d = deps({ userId: 'user-1' });
		jest.spyOn(console, 'warn').mockImplementation(() => undefined);
		(d.routers.warehouseOrders.create as jest.Mock).mockRejectedValueOnce(new Error('sold out'));
		await expect(buy(d, { productId: 'p1', warehouseId: 'w1', resumeId: 'wp1' })).resolves.toBe('failed');
	});

	it('cancel refunds a paid order and forgets it', async () => {
		const d = deps({ userId: 'user-1', orderId: 'order-1', startOrderDate: 'x' });
		(d.routers.warehouseOrders.cancel as jest.Mock).mockResolvedValueOnce(fx.order({ isPaid: true }));
		await cancelOpenOrder(d);
		expect(d.routers.warehouseOrders.cancel).toHaveBeenCalledWith('order-1');
		expect(d.routers.order.refundWithStripe).toHaveBeenCalledWith('order-1');
		expect(d.store.getState().session).toMatchObject({ orderId: null, startOrderDate: null });
	});

	it('cancel of an unpaid order does not refund', async () => {
		const d = deps({ userId: 'user-1', orderId: 'order-1' });
		await cancelOpenOrder(d);
		expect(d.routers.order.refundWithStripe).not.toHaveBeenCalled();
	});

	it('issue OK cancels, refunds when paid and forgets the order', async () => {
		const d = deps({ userId: 'user-1', orderId: 'order-1' });
		await closeIssue(d, 'order-1', true);
		expect(d.routers.warehouseOrders.cancel).toHaveBeenCalledWith('order-1');
		expect(d.routers.order.refundWithStripe).toHaveBeenCalledWith('order-1');
		expect(d.store.getState().session.orderId).toBeNull();
	});

	it('feed filter: an open order limits to its warehouse; a finished one is forgotten', async () => {
		const open = deps({ orderId: 'order-1', orderWarehouseId: 'w1' });
		await expect(openOrderWarehouse(open)).resolves.toBe('w1');
		const done = deps({ orderId: 'order-1', orderWarehouseId: 'w1' });
		(done.graphql.getOrderStatus as jest.Mock).mockResolvedValueOnce(2);
		await expect(openOrderWarehouse(done)).resolves.toBeNull();
		expect(done.store.getState().session.orderId).toBeNull();
	});
});

describe('app start', () => {
	it('server check: status, opaque answers are up, network errors are 0', async () => {
		const ok = createTestServices();
		await expect(checkServer(ok)).resolves.toBe(200);
		const down = createTestServices({ fetch: jest.fn(async () => Promise.reject(new Error('ECONNREFUSED'))) as unknown as typeof fetch });
		await expect(checkServer(down)).resolves.toBe(0);
	});

	it('maintenance: the api entry or this app entry, and the status check', () => {
		const info = [
			{ type: 'api', status: false, message: '' },
			{ type: 'shop-mobile', status: true, message: 'Back at 10' },
		];
		expect(maintenanceModeOf(info, 'shop-mobile')).toBe('shop-mobile');
		expect(maintenanceModeOf(info, 'admin')).toBeNull();
		expect(maintenanceModeOf(null, 'shop-mobile')).toBeNull();
		expect(maintenanceStatusOf(info, 'shop-mobile')).toBe(false);
		expect(maintenanceStatusOf([{ type: 'api', status: true, message: '' }, { type: 'shop-mobile', status: true, message: '' }], 'shop-mobile')).toBe(true);
	});

	it('bootstrap loads the server settings and registers the device once', async () => {
		const services = createTestServices();
		const store = storeWith({ language: 'en-US' });
		await bootstrap(services, store);
		expect(store.getState().session).toMatchObject({
			serverConnection: 200,
			inviteSystem: true,
			registrationSystem: 'enabled',
			deviceId: 'device-1',
		});
		expect(services.routers.device.create).toHaveBeenCalledWith(
			expect.objectContaining({ channelId: null, language: 'en-US', type: 'ios' }),
		);
		await registerDevice(services, store);
		expect(services.routers.device.create).toHaveBeenCalledTimes(1);
	});

	it('bootstrap skips the RPCs while the server is down', async () => {
		const services = createTestServices({ fetch: jest.fn(async () => Promise.reject(new Error('down'))) as unknown as typeof fetch });
		const store = storeWith();
		await bootstrap(services, store);
		expect(store.getState().session.serverConnection).toBe(0);
		expect(services.routers.invite.getInvitesSettings).not.toHaveBeenCalled();
	});

	it('a stored user the server does not know is forgotten', async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => undefined);
		const services = createTestServices({ routers: createMockRouters({ user: { get: jest.fn(() => of(null)) } }) });
		const store = storeWith({ userId: 'gone' });
		await expect(verifyUser(services, store)).resolves.toBe(false);
		expect(store.getState().session.userId).toBeNull();

		const failing = createTestServices({ routers: createMockRouters({ user: { get: jest.fn(() => throwError(() => new Error('x'))) } }) });
		const store2 = storeWith({ userId: 'gone' });
		await verifyUser(failing, store2);
		expect(store2.getState().session.userId).toBeNull();
	});

	it('a slow server keeps the stored user', async () => {
		jest.useFakeTimers();
		const services = createTestServices({ routers: createMockRouters({ user: { get: jest.fn(() => NEVER) } }) });
		const store = storeWith({ userId: 'user-1' });
		const result = verifyUser(services, store);
		jest.advanceTimersByTime(10000);
		await expect(result).resolves.toBe(true);
		expect(store.getState().session.userId).toBe('user-1');
		jest.useRealTimers();
	});
});
