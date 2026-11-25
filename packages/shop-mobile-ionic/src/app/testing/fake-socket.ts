import { Socket } from '@modules/client.common.angular2/lib/socket.service';

export interface FakeSocketRequest {
	event: string;
	args: any[];
	ack?: (err: any, res?: any) => void;
}

/**
 * Stands in for common-angular's Socket in specs. It behaves like the
 * socket.io-client 4.4.0 socket under the real one: an emit while
 * offline waits in a send buffer and goes out on the next connect, and
 * an ack the server has not sent before a disconnect is never called.
 */
export class FakeSocket {
	readonly ioSocket = { connected: false };

	// Requests the server got, in the order it got them.
	readonly sent: FakeSocketRequest[] = [];

	private readonly buffered: FakeSocketRequest[] = [];
	private readonly listeners = new Map<string, ((...args) => void)[]>();

	constructor(connected: boolean = true) {
		this.ioSocket.connected = connected;
	}

	asSocket(): Socket {
		return this as unknown as Socket;
	}

	on(eventName: string, callback: (...args) => void) {
		this.listenersOf(eventName).push(callback);
	}

	removeListener(eventName: string, callback?: (...args) => void) {
		const remaining = callback
			? this.listenersOf(eventName).filter((cb) => cb !== callback)
			: [];
		this.listeners.set(eventName, remaining);
	}

	listenerCount(eventName: string): number {
		return this.listenersOf(eventName).length;
	}

	emit(eventName: string, ...args: any[]) {
		const ack =
			typeof args[args.length - 1] === 'function'
				? args.pop()
				: undefined;
		const request: FakeSocketRequest = { event: eventName, args, ack };

		if (this.ioSocket.connected) {
			this.sent.push(request);
		} else {
			this.buffered.push(request);
		}
	}

	// Like socket.io: send the buffered emits, then fire connect.
	connect() {
		this.ioSocket.connected = true;
		this.sent.push(...this.buffered.splice(0));
		this.fire('connect');
	}

	disconnect(reason: string = 'transport close') {
		this.ioSocket.connected = false;
		this.fire('disconnect', reason);
	}

	// Calls the ack of the last request the server got for eventName.
	answer(eventName: string, err: any, res?: any) {
		const request = this.sent
			.filter((sent) => sent.event === eventName)
			.pop();

		if (!request || !request.ack) {
			throw new Error(`No request for ${eventName} reached the server`);
		}

		request.ack(err, res);
	}

	private fire(eventName: string, ...args: any[]) {
		this.listenersOf(eventName)
			.slice()
			.forEach((callback) => callback(...args));
	}

	private listenersOf(eventName: string): ((...args) => void)[] {
		if (!this.listeners.has(eventName)) {
			this.listeners.set(eventName, []);
		}
		return this.listeners.get(eventName);
	}
}

export interface Outcome<T> {
	settled: boolean;
	value?: T;
	error?: any;
}

// Records how a promise settles, so a spec can check a promise that
// may never settle without waiting for it.
export function track<T>(promise: Promise<T>): Outcome<T> {
	const outcome: Outcome<T> = { settled: false };
	promise.then(
		(value) => {
			outcome.settled = true;
			outcome.value = value;
		},
		(error) => {
			outcome.settled = true;
			outcome.error = error;
		}
	);
	return outcome;
}

// Lets every pending promise callback run.
export function settle(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}
