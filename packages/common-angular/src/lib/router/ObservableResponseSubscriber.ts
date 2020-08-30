import { v4 as uuid } from 'uuid';
import { exhaustMap, merge, share, takeUntil } from 'rxjs/operators';
import { Socket } from '../socket.service';
import { Observable, throwError } from 'rxjs';

export class ObservableResponseSubscriber<T> {
	private readonly response: Observable<T>;
	private readonly subscriptionId: string;

	constructor(
		private readonly socket: Socket,
		private readonly callId: string
	) {
		this.subscriptionId = uuid();
		this.response = this.createResponseObservable();
	}

	getResponse(): Observable<T> {
		return this.response;
	}

	private createResponseObservable(): Observable<T> {
		return Observable.create(() => {
			this.socket.emit(`${this.callId}_subscribe`, this.subscriptionId);

			return () => {
				this.socket.emit(`${this.subscriptionId}_unsubscribe`);
			};
		}).pipe(
			merge(this.nexts(), this.errors()),
			takeUntil(this.completes()),
			share()
		);
	}

	private nexts() {
		return this.socket.fromEvent<T>(`${this.subscriptionId}_next`);
	}

	private errors() {
		return this.socket
			.fromEvent(`${this.subscriptionId}_error`)
			.pipe(
				exhaustMap((error) => throwError(this.deserializeError(error)))
			);
	}

	private completes() {
		return this.socket.fromEvent(`${this.subscriptionId}_complete`);
	}

	private deserializeError(error) {
		if (error.__isError__) {
			const _error = new Error(error.message);
			_error.name = error.name;
			return _error;
		} else {
			return error;
		}
	}
}
