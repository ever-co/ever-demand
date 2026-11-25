/**
 * socket.io connection of one pyro router namespace, the React Native version of
 * `packages/common-angular/src/lib/socket.service.ts`.
 *
 * Like the Angular client it turns socket.io's own reconnection off and reconnects by hand one
 * second after a `disconnect` or `connect_error`.
 */
import { BehaviorSubject, Observable, filter } from 'rxjs';

export enum ConnectionStatus {
	NotConnected,
	Disconnected,
	Connected,
	ConnectError,
}

type Listener = (...args: any[]) => void;

/** The part of a socket.io-client `Socket` the RPC client uses (mocked in tests). */
export interface SocketLike {
	readonly connected: boolean;
	on(event: string, listener: Listener): unknown;
	off(event: string, listener?: Listener): unknown;
	emit(event: string, ...args: any[]): unknown;
	connect(): unknown;
	disconnect(): unknown;
}

export type SocketFactory = (url: string) => SocketLike;

export class RpcSocket {
	readonly status$ = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.NotConnected);

	/** Emits each time the socket (re)connects, and at once when it is connected already. */
	readonly connection$: Observable<ConnectionStatus> = this.status$.pipe(
		filter((status) => status === ConnectionStatus.Connected),
	);

	readonly io: SocketLike;

	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	private closed = false;

	constructor(
		readonly url: string,
		factory: SocketFactory,
		private readonly reconnectDelayMs = 1000,
	) {
		this.io = factory(url);

		this.io.on('connect', () => this.status$.next(ConnectionStatus.Connected));
		this.io.on('disconnect', () => {
			this.status$.next(ConnectionStatus.Disconnected);
			this.scheduleReconnect();
		});
		this.io.on('connect_error', () => {
			this.status$.next(ConnectionStatus.ConnectError);
			this.scheduleReconnect();
		});

		if (this.io.connected) {
			this.status$.next(ConnectionStatus.Connected);
		}
	}

	get connected(): boolean {
		return this.io.connected;
	}

	on(event: string, listener: Listener): void {
		this.io.on(event, listener);
	}

	off(event: string, listener: Listener): void {
		this.io.off(event, listener);
	}

	emit(event: string, ...args: any[]): void {
		this.io.emit(event, ...args);
	}

	/**
	 * Observable of an event. Unsubscribing removes only this subscriber's listener (the Angular
	 * client removed every listener of the event).
	 */
	fromEvent<T>(event: string): Observable<T> {
		return new Observable<T>((subscriber) => {
			const listener = (value: T) => subscriber.next(value);
			this.io.on(event, listener);
			return () => this.io.off(event, listener);
		});
	}

	close(): void {
		this.closed = true;
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
		this.io.disconnect();
		this.status$.complete();
	}

	private scheduleReconnect(): void {
		if (this.closed || this.reconnectTimer) {
			return;
		}
		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null;
			if (!this.closed && !this.io.connected) {
				this.io.connect();
			}
		}, this.reconnectDelayMs);
	}
}
