// Spec for common-angular's Request (packages/common-angular/src/lib/
// router/Request.ts). common-angular has no working test runner, so it
// runs in this package's Karma suite.
import { Request } from '@modules/client.common.angular2/lib/router/Request';
import { FakeSocket, settle, track } from './fake-socket';

describe('Request', () => {
	const run = (socket: FakeSocket, event: string = 'payWithStripe') =>
		new Request<any>(socket.asSocket(), event, ['order-1', 'card-1']).run();

	const listeners = (socket: FakeSocket) =>
		socket.listenerCount('connect') + socket.listenerCount('disconnect');

	it('resolves with the server answer', async () => {
		const socket = new FakeSocket();
		const outcome = track(run(socket));

		expect(socket.sent.map((sent) => sent.args)).toEqual([
			['order-1', 'card-1'],
		]);

		socket.answer('payWithStripe', null, { id: 'order-1' });
		await settle();

		expect(outcome.value).toEqual({ id: 'order-1' });
	});

	it('rejects with the server error', async () => {
		const socket = new FakeSocket();
		const outcome = track(run(socket));

		socket.answer('payWithStripe', {
			__isError__: true,
			name: 'Error',
			message: 'Your card was declined.',
		});
		await settle();

		expect(outcome.error.message).toBe('Your card was declined.');
	});

	it('rejects a sent request when the socket disconnects before the answer', async () => {
		const socket = new FakeSocket();
		const outcome = track(run(socket));
		await settle();

		expect(outcome.settled).toBe(false);

		socket.disconnect();
		await settle();

		expect(outcome.settled).toBe(true);
		expect(outcome.error instanceof Error).toBe(true);
		expect(outcome.error).toEqual(
			expect.objectContaining({
				name: 'SocketDisconnectedError',
				message: expect.stringContaining('"payWithStripe"'),
			})
		);
	});

	it('keeps a request emitted offline until connect sends it, then resolves on its ack', async () => {
		const socket = new FakeSocket(false);
		const outcome = track(run(socket));

		// socket.io can fire disconnect before the socket ever connected
		// (the namespace connect failed). The request is still in the
		// send buffer, so it must keep waiting.
		socket.disconnect('io server disconnect');
		await settle();

		expect(socket.sent.length).toBe(0);
		expect(outcome.settled).toBe(false);

		socket.connect();

		expect(socket.sent.map((sent) => sent.event)).toEqual([
			'payWithStripe',
		]);

		socket.answer('payWithStripe', null, { id: 'order-1' });
		await settle();

		expect(outcome.value).toEqual({ id: 'order-1' });
	});

	it('rejects a request emitted offline when the socket drops after connect sent it', async () => {
		const socket = new FakeSocket(false);
		const outcome = track(run(socket));

		socket.connect();
		socket.disconnect();
		await settle();

		expect(outcome.settled).toBe(true);
		expect(outcome.error).toEqual(
			expect.objectContaining({ name: 'SocketDisconnectedError' })
		);
	});

	it('listens for the disconnect while the request is pending and stops once the ack settles it', async () => {
		const socket = new FakeSocket();
		const answered = track(run(socket, 'confirm'));
		const failed = track(run(socket, 'payWithStripe'));

		expect(socket.listenerCount('disconnect')).toBe(2);

		socket.answer('confirm', null, { id: 'order-1' });
		await settle();

		expect(answered.settled).toBe(true);
		expect(socket.listenerCount('disconnect')).toBe(1);

		socket.answer('payWithStripe', { message: 'declined' });
		await settle();

		expect(failed.error).toEqual({ message: 'declined' });
		expect(listeners(socket)).toBe(0);
	});

	it('removes its listeners after a disconnect rejects it', async () => {
		const socket = new FakeSocket();
		const outcome = track(run(socket));

		expect(socket.listenerCount('disconnect')).toBe(1);

		socket.disconnect();
		await settle();

		expect(outcome.settled).toBe(true);
		expect(listeners(socket)).toBe(0);
	});
});
