import { io } from 'socket.io-client';
import type { SocketAuth } from '../config/tenant';
import { RpcRouter } from './router';
import { RpcSocket, type SocketFactory } from './socket';

/**
 * socket.io options of the Angular client: no automatic reconnection (we reconnect by hand), and
 * the handshake `auth` (tenant, token) read at every (re)connect (docs/multi-tenant/DESIGN.md §3.3).
 */
export function socketOptions(getAuth: () => SocketAuth = () => ({})) {
	return {
		reconnection: false,
		// React Native has no XHR long-polling upgrade path worth using; websocket also avoids CORS.
		transports: ['websocket'],
		auth: (cb: (auth: SocketAuth) => void) => cb(getAuth()),
	};
}

/** A socket factory whose handshakes send `getAuth()`. */
export const socketIoFactory =
	(getAuth?: () => SocketAuth): SocketFactory =>
	(url) =>
		io(url, socketOptions(getAuth));

export const defaultSocketFactory: SocketFactory = socketIoFactory();

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
