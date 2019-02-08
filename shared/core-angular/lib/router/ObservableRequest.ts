import { Observable } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { exhaustMap, first, switchMap } from 'rxjs/operators';
import { ObservableResponseSubscriber } from './ObservableResponseSubscriber';
import { Socket } from '../socket.service';

export class ObservableRequest<T> {
	private callId: string;

	constructor(
		private readonly socket: Socket,
		private readonly event: string,
		private readonly args: any[]
	) {
		this.callId = uuid();
	}

	run(): Observable<T> {
		return this.socket.connection.pipe(
			first(),
			switchMap(() => {
				this.socket.emit(this.event, ...this.args, this.callId);

				return this.socket.connection.pipe(
					exhaustMap(() => {
						const subscriber = new ObservableResponseSubscriber<T>(
							this.socket,
							this.callId
						);
						return subscriber.getResponse();
					})
				);
			})
		);
	}
}
