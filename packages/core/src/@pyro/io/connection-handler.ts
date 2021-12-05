import { getListeners, getRouterName, IRouter } from './router/router';
import Logger from 'bunyan';
import { IListenerHandler } from './listener/handler/handler';
import { AsyncListenerHandler } from './listener/handler/async';
import { ObservableListenerHandler } from './listener/handler/observable';
import { getListenerType, Listener } from './listener/listener';
import { ListenerType } from './listener/types';
import { AsyncListener } from './listener/async';
import { ObservableListener } from './listener/observable';
import { Socket } from 'socket.io';

export class ConnectionHandler {
	private readonly listeners: Array<Listener<any>> = getListeners(
		this.router
	);

	private readonly routerName: string = getRouterName(this.router);

	constructor(
		private readonly socket: Socket,
		private readonly router: IRouter,
		private readonly log: Logger
	) {}

	handle() {
		this.log.info(
			{
				socketId: this.socket.id,
				listeners: this.listeners.map((listener) => listener.name),
				routerName: this.routerName,
			},
			`Socket connected! Starting listeners listening!`
		);

		try {
			this.listeners.forEach((listener) => {
				const handler = this.listenerHandlerFactory(listener);
				handler.handle();
			});
		} catch (err) {
			this.log.fatal("Couldn't start listeners listening!", { err });
		}

		this.socket.on('disconnect', () => {
			this.onDisconnection();
		});
	}

	protected listenerHandlerFactory<T>(
		listener: Listener<T>
	): IListenerHandler<T> {
		switch (getListenerType(listener)) {
			case ListenerType.Async:
				return new AsyncListenerHandler(
					this.router,
					listener as AsyncListener<T>,
					this.socket,
					this.log
				);
			case ListenerType.Observable:
				return new ObservableListenerHandler(
					this.router,
					listener as ObservableListener<T>,
					this.socket,
					this.log
				);
			default:
				throw new Error(
					`Bad listener type! ${getListenerType(listener)}`
				);
		}
	}

	private onDisconnection() {
		this.log.info(
			{
				socketId: this.socket.id,
				listeners: this.listeners.map((listener) => listener.name),
				routerName: this.routerName,
			},
			`Socket disconnected!`
		);
	}
}
