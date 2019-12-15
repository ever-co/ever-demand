import { Inject, Injectable } from '@angular/core';
import { API_URL, Router } from './router.service';
import { RoutersService } from './routers.service';
import { SocketFactory } from '../socket.factory';

@Injectable()
export class RouterFactory {
	constructor(
		private readonly socketFactory: SocketFactory,
		private readonly routersService: RoutersService,
		@Inject(API_URL) private readonly apiUrl: string
	) {}

	create(name: string): Router {
		return new Router(
			this.socketFactory,
			this.routersService,
			name,
			this.apiUrl
		);
	}
}
