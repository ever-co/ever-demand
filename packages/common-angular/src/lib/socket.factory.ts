import { Socket, SOCKET_IO } from './socket.service';
import { Inject, Injectable, Optional } from '@angular/core';
import { io as _io } from 'socket.io-client';
import { SOCKET_AUTH, SocketAuth } from './tenant';

@Injectable({
    providedIn: 'root'
})
export class SocketFactory {
	constructor(
		@Inject(SOCKET_IO) private readonly io: typeof _io,
		@Optional()
		@Inject(SOCKET_AUTH)
		private readonly auth: (() => SocketAuth) | null
	) {}

	build(socketUrl: string): Socket {
		return new Socket(socketUrl, this.io, this.auth ?? undefined);
	}
}
