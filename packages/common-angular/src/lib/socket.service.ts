import { InjectionToken } from '@angular/core';
import { Observable, of, fromEvent } from 'rxjs';
import {
	delay,
	filter,
	map,
	merge,
	publishReplay,
	refCount,
	share,
} from 'rxjs/operators';
import 'rxjs/add/observable/fromEvent';
import _io from 'socket.io-client';

export enum ConnectionStatus {
	NotConnected,
	Disconnected,
	Connected,
	ConnectError,
}

export const SOCKET_IO = new InjectionToken('socket.io');

export class Socket {
	public subscribersCounter: number = 0;
	public ioSocket: SocketIOClient.Socket;

	public connectionStatus: Observable<ConnectionStatus> = of(
		ConnectionStatus.NotConnected
	).pipe(
		merge(
			this.fromEvent('connect').pipe(
				map(() => ConnectionStatus.Connected)
			),
			this.fromEvent('disconnect').pipe(
				map(() => ConnectionStatus.Disconnected)
			),
			this.fromEvent('connect_error').pipe(
				map(() => ConnectionStatus.ConnectError)
			)
		),
		publishReplay(1),
		refCount()
	);

	public connection: Observable<
		ConnectionStatus
	> = this.connectionStatus.pipe(
		filter((status) => status === ConnectionStatus.Connected)
	);

	public disconnection: Observable<
		ConnectionStatus
	> = this.connectionStatus.pipe(
		filter((status) => status === ConnectionStatus.Disconnected)
	);

	public connectionErrors: Observable<
		ConnectionStatus
	> = this.connectionStatus.pipe(
		filter((status) => status === ConnectionStatus.ConnectError)
	);

	constructor(
		private readonly socketUrl: string,
		private readonly io: typeof _io
	) {
		console.log(`Socket with url ${socketUrl} created!`);

		const ioCallable = <any>this.io;

		this.ioSocket = ioCallable(`${this.socketUrl}`, {
			reconnection: false,
		});

		this.connectionStatus
			.pipe(
				filter(
					(status) =>
						status === ConnectionStatus.Disconnected ||
						status === ConnectionStatus.ConnectError
				),
				delay(1000)
			)
			.subscribe(() => {
				this.connect();
			});
	}

	on(eventName: string, callback: () => void) {
		this.ioSocket.on(eventName, callback);
	}

	once(eventName: string, callback: () => void) {
		this.ioSocket.once(eventName, callback);
	}

	connect() {
		return this.ioSocket.connect();
	}

	disconnect(close?: any) {
		return this.ioSocket.disconnect.apply(this.ioSocket, <any>arguments);
	}

	emit(eventName: string, ...args: any[]) {
		return this.ioSocket.emit.apply(this.ioSocket, <any>arguments);
	}

	removeListener(eventName: string, callback?: () => void) {
		return this.ioSocket.removeListener.apply(
			this.ioSocket,
			<any>arguments
		);
	}

	removeAllListeners(eventName?: string) {
		return this.ioSocket.removeAllListeners.apply(
			this.ioSocket,
			<any>arguments
		);
	}

	/**
	 * create an Observable from an event
	 *
	 * @template T
	 * @param {string} eventName
	 * @returns {Observable<T>}
	 * @memberof Socket
	 */
	fromEvent<T>(eventName: string): Observable<T> {
		this.subscribersCounter++;

		return Observable.create((observer: any) => {
			this.ioSocket.on(eventName, (data: T) => {
				observer.next(data);
			});
			return () => {
				if (this.subscribersCounter === 1) {
					this.ioSocket.removeListener(eventName);
				}
			};
		}).pipe(share());
	}
}
