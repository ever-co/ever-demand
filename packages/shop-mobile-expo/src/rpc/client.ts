import { io } from 'socket.io-client';
import { RpcRouter } from './router';
import { RpcSocket, type SocketFactory } from './socket';

/** socket.io options of the Angular client: no automatic reconnection (we reconnect by hand). */
export const defaultSocketFactory: SocketFactory = (url) =>
	io(url, {
		reconnection: false,
		// React Native has no XHR long-polling upgrade path worth using; websocket also avoids CORS.
		transports: ['websocket'],
	});

/** One socket.io namespace (and socket) per pyro router, created on first use. */
export class RpcClient {
	private readonly routers = new Map<string, RpcRouter>();
	private readonly sockets: RpcSocket[] = [];

	constructor(
		private readonly servicesEndpoint: string,
		private readonly socketFactory: SocketFactory = defaultSocketFactory,
	) {}

	router(name: string): RpcRouter {
		let router = this.routers.get(name);
		if (!router) {
			const socket = new RpcSocket(`${this.servicesEndpoint}/${name}`, this.socketFactory);
			this.sockets.push(socket);
			router = new RpcRouter(name, socket);
			this.routers.set(name, router);
		}
		return router;
	}

	close(): void {
		for (const socket of this.sockets) {
			socket.close();
		}
		this.sockets.length = 0;
		this.routers.clear();
	}
}
