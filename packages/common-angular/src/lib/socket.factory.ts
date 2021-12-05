import { Socket, SOCKET_IO } from './socket.service';
import { Inject, Injectable } from '@angular/core';
import { io as _io } from 'socket.io-client';

@Injectable({
    providedIn: 'root'
})
export class SocketFactory {
	constructor(
		@Inject(SOCKET_IO) private readonly io: typeof _io
	) {}

	build(socketUrl: string): Socket {
		return new Socket(socketUrl, this.io);
	}
}
