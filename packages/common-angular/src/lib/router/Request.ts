import { Socket } from '../socket.service';

export class Request<T> {
	constructor(
		private readonly socket: Socket,
		private readonly event: string,
		private readonly args: any[]
	) {}

	async run(): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			// socket.io-client never calls a plain ack after a disconnect,
			// so a request in flight when the socket drops would never
			// settle. A request emitted while offline waits in socket.io's
			// send buffer and goes out on the next connect, so it only
			// counts as sent from then on.
			let sent = this.socket.ioSocket.connected;

			const onConnect = () => {
				sent = true;
			};

			const onDisconnect = () => {
				if (sent) {
					this.stopListening(onConnect, onDisconnect);
					reject(this.disconnectedError());
				}
			};

			this.socket.on('connect', onConnect);
			this.socket.on('disconnect', onDisconnect);

			this.socket.emit(this.event, ...this.args, (err, res) => {
				this.stopListening(onConnect, onDisconnect);

				if (err != null) {
					reject(this.deserializeError(err));
				} else {
					resolve(res);
				}
			});
		});
	}

	private stopListening(onConnect: () => void, onDisconnect: () => void) {
		this.socket.removeListener('connect', onConnect);
		this.socket.removeListener('disconnect', onDisconnect);
	}

	private disconnectedError(): Error {
		const error = new Error(
			`Connection lost before the server answered "${this.event}"; ` +
				'it may or may not have run.'
		);
		error.name = 'SocketDisconnectedError';
		return error;
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
