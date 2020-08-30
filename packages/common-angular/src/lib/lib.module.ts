import { NgModule } from '@angular/core';
import { SOCKET_IO } from './socket.service';
import io from 'socket.io-client';
import { RouterFactory, RoutersService } from './router';
import { SocketFactory } from './socket.factory';

@NgModule({
	providers: [
		{ provide: SOCKET_IO, useValue: io },
		SocketFactory,
		RouterFactory,
		RoutersService,
	],
	exports: [],
})
export class CommonLibModule {}
