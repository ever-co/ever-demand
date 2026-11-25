import { firstValueFrom, take, toArray } from 'rxjs';
import { RpcClient } from './client';
import { deserializeError, RpcRouter, SOCKET_DISCONNECTED_ERROR } from './router';
import { ConnectionStatus, RpcSocket, type SocketLike } from './socket';

/** In-memory socket.io client: records emits, lets the test play the server. */
class FakeSocket implements SocketLike {
	connected = false;
	readonly emitted: Array<{ event: string; args: any[] }> = [];
	readonly connectCalls: number[] = [];
	private listeners = new Map<string, Set<(...args: any[]) => void>>();

	constructor(readonly url = '') {}

	on(event: string, listener: (...args: any[]) => void) {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}
		this.listeners.get(event)!.add(listener);
		return this;
	}

	off(event: string, listener?: (...args: any[]) => void) {
		if (listener) {
			this.listeners.get(event)?.delete(listener);
		} else {
			this.listeners.delete(event);
		}
		return this;
	}

	emit(event: string, ...args: any[]) {
		this.emitted.push({ event, args });
		return this;
	}

	connect() {
		this.connectCalls.push(Date.now());
		return this;
	}

	disconnect() {
		return this;
	}

	/** The server side: fire an event at the client. */
	serverEmit(event: string, ...args: any[]) {
		[...(this.listeners.get(event) ?? [])].forEach((listener) => listener(...args));
	}

	listenerCount(event: string) {
		return this.listeners.get(event)?.size ?? 0;
	}

	goOnline() {
		this.connected = true;
		this.serverEmit('connect');
	}

	goOffline() {
		this.connected = false;
		this.serverEmit('disconnect');
	}

	last(event: string) {
		return [...this.emitted].reverse().find((e) => e.event === event);
	}
}

function setup() {
	const fake = new FakeSocket('http://api/order');
	const socket = new RpcSocket('http://api/order', () => fake);
	const router = new RpcRouter('order', socket);
	return { fake, socket, router };
}

describe('RpcRouter.run (one-shot call)', () => {
	it('emits the method with its args and an ack, and resolves with the normalised result', async () => {
		const { fake, router } = setup();
		fake.goOnline();

		const promise = router.run('confirm', 'order-1');
		const call = fake.last('confirm')!;
		expect(call.args[0]).toBe('order-1');
		const ack = call.args[1];
		expect(typeof ack).toBe('function');

		ack(null, { _id: 'order-1', _createdAt: '2026-01-01', products: [{ _id: 'p1' }] });
		await expect(promise).resolves.toEqual({
			_id: 'order-1',
			id: 'order-1',
			_createdAt: '2026-01-01',
			createdAt: '2026-01-01',
			products: [{ _id: 'p1', id: 'p1' }],
		});
	});

	it('rejects with the server error rebuilt as an Error with its name', async () => {
		const { fake, router } = setup();
		fake.goOnline();

		const promise = router.run('payWithStripe', 'order-1', 'card-1', 'USD');
		fake.last('payWithStripe')!.args[3](
			{ __isError__: true, name: 'StripeCurrencyChangedError', message: 'currency changed' },
			null,
		);

		await expect(promise).rejects.toMatchObject({ name: 'StripeCurrencyChangedError', message: 'currency changed' });
	});

	it('rejects when the socket drops after the call went out (a payment never hangs)', async () => {
		const { fake, router } = setup();
		fake.goOnline();

		const promise = router.run('payWithStripe', 'order-1', 'card-1');
		fake.goOffline();

		await expect(promise).rejects.toMatchObject({ name: SOCKET_DISCONNECTED_ERROR });
		expect(fake.listenerCount('connect')).toBe(1); // only RpcSocket's own listener is left
	});

	it('does not reject a call made while offline until it was sent on the next connect', async () => {
		const { fake, router } = setup();
		const promise = router.run('getStripeCurrency');
		let settled = false;
		promise.then(
			() => (settled = true),
			() => (settled = true),
		);

		fake.serverEmit('disconnect'); // still offline: the call waits in the buffer
		await Promise.resolve();
		expect(settled).toBe(false);

		fake.goOnline();
		fake.last('getStripeCurrency')!.args[0](null, 'usd');
		await expect(promise).resolves.toBe('usd');
	});
});

describe('RpcRouter.runAndObserve (observable call)', () => {
	it('waits for the connection, calls with a call id, subscribes and streams values', async () => {
		const { fake, router } = setup();
		const values: unknown[] = [];
		const subscription = router.runAndObserve('get', 'order-1', { populateWarehouse: true }).subscribe((v) => values.push(v));

		expect(fake.emitted).toHaveLength(0);
		fake.goOnline();

		const call = fake.last('get')!;
		expect(call.args.slice(0, 2)).toEqual(['order-1', { populateWarehouse: true }]);
		const callId = call.args[2];
		expect(callId).toMatch(/^[0-9a-f-]{36}$/);

		const subscribe = fake.last(`${callId}_subscribe`)!;
		const subscriptionId = subscribe.args[0];
		expect(subscriptionId).toMatch(/^[0-9a-f-]{36}$/);

		fake.serverEmit(`${subscriptionId}_next`, { _id: 'order-1', isPaid: false });
		fake.serverEmit(`${subscriptionId}_next`, { _id: 'order-1', isPaid: true });
		expect(values).toEqual([
			{ _id: 'order-1', id: 'order-1', isPaid: false },
			{ _id: 'order-1', id: 'order-1', isPaid: true },
		]);

		subscription.unsubscribe();
		expect(fake.last(`${subscriptionId}_unsubscribe`)).toBeDefined();
		expect(fake.listenerCount(`${subscriptionId}_next`)).toBe(0);
	});

	it('completes on the server complete event (`_${id}_complete`)', async () => {
		const { fake, router } = setup();
		fake.goOnline();
		const all = firstValueFrom(router.runAndObserve<number>('get', 'x').pipe(toArray()));
		const callId = fake.last('get')!.args[1];
		const subscriptionId = fake.last(`${callId}_subscribe`)!.args[0];

		fake.serverEmit(`${subscriptionId}_next`, 1);
		fake.serverEmit(`_${subscriptionId}_complete`);
		await expect(all).resolves.toEqual([1]);
	});

	it('errors with the deserialised server error', async () => {
		const { fake, router } = setup();
		fake.goOnline();
		const value = firstValueFrom(router.runAndObserve('get', 'missing'));
		const callId = fake.last('get')!.args[1];
		const subscriptionId = fake.last(`${callId}_subscribe`)!.args[0];

		fake.serverEmit(`${subscriptionId}_error`, { __isError__: true, name: 'NotFound', message: 'no user' });
		await expect(value).rejects.toMatchObject({ name: 'NotFound', message: 'no user' });
	});

	it('calls the method again with a fresh call id after a reconnect', () => {
		const { fake, router } = setup();
		const values: unknown[] = [];
		router.runAndObserve('get', 'user-1').subscribe((v) => values.push(v));
		fake.goOnline();
		const firstCallId = fake.last('get')!.args[1];

		fake.goOffline();
		fake.goOnline();
		const calls = fake.emitted.filter((e) => e.event === 'get');
		expect(calls).toHaveLength(2);
		const secondCallId = calls[1].args[1];
		expect(secondCallId).not.toBe(firstCallId);

		const subscriptionId = fake.last(`${secondCallId}_subscribe`)!.args[0];
		fake.serverEmit(`${subscriptionId}_next`, { _id: 'user-1' });
		expect(values).toEqual([{ _id: 'user-1', id: 'user-1' }]);
	});

	it('first value of an observable call', async () => {
		const { fake, router } = setup();
		fake.goOnline();
		const first = firstValueFrom(router.runAndObserve('getByCode', { inviteCode: '1234' }).pipe(take(1)));
		const callId = fake.last('getByCode')!.args[1];
		const subscriptionId = fake.last(`${callId}_subscribe`)!.args[0];
		fake.serverEmit(`${subscriptionId}_next`, null);
		await expect(first).resolves.toBeNull();
	});
});

describe('RpcSocket', () => {
	beforeEach(() => jest.useFakeTimers());
	afterEach(() => jest.useRealTimers());

	it('reconnects by hand 1 s after a disconnect or a connect error', () => {
		const fake = new FakeSocket();
		const socket = new RpcSocket('http://api/user', () => fake);
		const statuses: ConnectionStatus[] = [];
		socket.status$.subscribe((s) => statuses.push(s));

		fake.serverEmit('connect_error');
		expect(fake.connectCalls).toHaveLength(0);
		jest.advanceTimersByTime(1000);
		expect(fake.connectCalls).toHaveLength(1);

		fake.goOnline();
		fake.goOffline();
		jest.advanceTimersByTime(999);
		expect(fake.connectCalls).toHaveLength(1);
		jest.advanceTimersByTime(1);
		expect(fake.connectCalls).toHaveLength(2);

		expect(statuses).toEqual([
			ConnectionStatus.NotConnected,
			ConnectionStatus.ConnectError,
			ConnectionStatus.Connected,
			ConnectionStatus.Disconnected,
		]);

		socket.close();
		fake.serverEmit('disconnect');
		jest.advanceTimersByTime(2000);
		expect(fake.connectCalls).toHaveLength(2);
	});
});

describe('RpcClient', () => {
	it('opens one namespace per router on the services endpoint', () => {
		const urls: string[] = [];
		const client = new RpcClient('http://localhost:5500', (url) => {
			urls.push(url);
			return new FakeSocket(url);
		});
		expect(client.router('order')).toBe(client.router('order'));
		client.router('user');
		expect(urls).toEqual(['http://localhost:5500/order', 'http://localhost:5500/user']);
		client.close();
	});
});

describe('deserializeError', () => {
	it('keeps non-serialised errors as they are', () => {
		expect(deserializeError('boom')).toBe('boom');
		const error = deserializeError({ __isError__: true, name: 'X', message: 'y' }) as Error;
		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe('X');
	});
});
