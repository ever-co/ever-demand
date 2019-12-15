import { Socket } from '../socket.service';
import { Observable } from 'rxjs';
import { ObservableRequest } from './ObservableRequest';
import { Request } from './Request';
import { RoutersService } from './routers.service';
import { SocketFactory } from '../socket.factory';
import { InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken<string>('api_url');

export class Router {
	private readonly socket: Socket;

	constructor(
		socketFactory: SocketFactory,
		private readonly routersService: RoutersService,
		private readonly name: string,
		private readonly apiUrl: string
	) {
		this.socket = socketFactory.build(`${apiUrl}/${name}`);
		this.routersService.sockets.next(this.socket);

		console.log(`Router named ${name} created!`);
	}

	runAndObserve<T>(methodName: string, ...args: any[]): Observable<T> {
		const request = new ObservableRequest<T>(this.socket, methodName, args);
		return request.run();
	}

	run<T>(methodName: string, ...args: any[]): Promise<T> {
		const request = new Request<T>(this.socket, methodName, args);
		return request.run();
	}
}
