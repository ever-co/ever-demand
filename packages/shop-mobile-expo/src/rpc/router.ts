/**
 * The pyro RPC protocol, mirrored from `packages/common-angular/src/lib/router/*` (client) and
 * `packages/core/src/@pyro/io/listener/handler/*` (server).
 *
 * One-shot call: `emit(method, ...args, ack)`, the server answers `ack(err, result)`.
 *
 * Observable call: `emit(method, ...args, callId)`, then `emit(`${callId}_subscribe`, subId)`; the
 * server pushes `${subId}_next` (value), `${subId}_error` (serialised error) and
 * `_${subId}_complete`; the client stops with `emit(`${subId}_unsubscribe`)`.
 */
import { Observable, Subscription } from 'rxjs';
import { randomId } from '../utils/uuid';
import { normalizeEntity } from './normalize';
import type { RpcSocket } from './socket';

export const SOCKET_DISCONNECTED_ERROR = 'SocketDisconnectedError';

interface SerializedError {
	__isError__: true;
	name: string;
	message: string;
}

/** Rebuilds an `Error` from the server's `{ __isError__, name, message }`. */
export function deserializeError(error: unknown): unknown {
	if (error && typeof error === 'object' && (error as SerializedError).__isError__) {
		const serialized = error as SerializedError;
		const rebuilt = new Error(serialized.message);
		rebuilt.name = serialized.name;
		return rebuilt;
	}
	return error;
}

export class RpcRouter {
	constructor(
		readonly name: string,
		private readonly socket: RpcSocket,
	) {}

	/**
	 * One-shot call (`Request.run`). socket.io never calls an ack after a disconnect, so a call in
	 * flight when the socket drops rejects with `SocketDisconnectedError`: a payment must never hang.
	 * A call made while offline waits in socket.io's buffer and counts as sent from the next connect.
	 */
	run<T>(method: string, ...args: unknown[]): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			let sent = this.socket.connected;

			const onConnect = () => {
				sent = true;
			};

			const onDisconnect = () => {
				if (sent) {
					stopListening();
					const error = new Error(
						`Connection lost before the server answered "${method}"; it may or may not have run.`,
					);
					error.name = SOCKET_DISCONNECTED_ERROR;
					reject(error);
				}
			};

			const stopListening = () => {
				this.socket.off('connect', onConnect);
				this.socket.off('disconnect', onDisconnect);
			};

			this.socket.on('connect', onConnect);
			this.socket.on('disconnect', onDisconnect);

			this.socket.emit(method, ...args, (err: unknown, res: T) => {
				stopListening();
				if (err != null) {
					reject(deserializeError(err));
				} else {
					resolve(normalizeEntity(res));
				}
			});
		});
	}

	/**
	 * Observable call (`ObservableRequest`). It starts on the first connection and, unlike the
	 * Angular client, calls the method again on every reconnect: the server forgets a socket's
	 * subscriptions when it disconnects, so resubscribing the old call id would get no answer.
	 */
	runAndObserve<T>(method: string, ...args: unknown[]): Observable<T> {
		return new Observable<T>((subscriber) => {
			let current: Subscription | null = null;

			const connections = this.socket.connection$.subscribe(() => {
				current?.unsubscribe();
				current = this.observeOnce<T>(method, args).subscribe({
					next: (value) => subscriber.next(value),
					error: (error) => subscriber.error(error),
					complete: () => subscriber.complete(),
				});
			});

			return () => {
				connections.unsubscribe();
				current?.unsubscribe();
			};
		});
	}

	private observeOnce<T>(method: string, args: unknown[]): Observable<T> {
		return new Observable<T>((subscriber) => {
			const callId = randomId();
			const subscriptionId = randomId();

			const onNext = (value: T) => subscriber.next(normalizeEntity(value));
			const onError = (error: unknown) => subscriber.error(deserializeError(error));
			const onComplete = () => subscriber.complete();

			// The server emits `_${id}_complete`; the Angular client listened to `${id}_complete`.
			const events: Array<[string, (...a: any[]) => void]> = [
				[`${subscriptionId}_next`, onNext],
				[`${subscriptionId}_error`, onError],
				[`_${subscriptionId}_complete`, onComplete],
				[`${subscriptionId}_complete`, onComplete],
			];

			for (const [event, listener] of events) {
				this.socket.on(event, listener);
			}

			this.socket.emit(method, ...args, callId);
			this.socket.emit(`${callId}_subscribe`, subscriptionId);

			return () => {
				for (const [event, listener] of events) {
					this.socket.off(event, listener);
				}
				// After a disconnect the server has dropped the subscription already.
				if (this.socket.connected) {
					this.socket.emit(`${subscriptionId}_unsubscribe`);
				}
			};
		});
	}
}
