import { Socket, SOCKET_IO } from './socket.service';
import { Inject } from '@angular/core';
import _io from 'socket.io-client';

export class SocketFactory {
	constructor(@Inject(SOCKET_IO) private readonly io: typeof _io) {}

	build(socketUrl: string): Socket {
		return new Socket(socketUrl, this.io);
	}
}
