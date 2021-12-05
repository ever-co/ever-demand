import { IRouter } from '../../router/router';
import { IListenerHandler } from './handler';
import * as _ from 'lodash';
import Logger from 'bunyan';
import { BaseListenerHandler } from './base';
import { ObservableListener } from '../observable';
import { Socket } from 'socket.io';

export class ObservableListenerHandler<T> extends BaseListenerHandler<T>
	implements IListenerHandler<T> {
	constructor(
		private readonly router: IRouter,
		private readonly listener: ObservableListener<T>,
		private readonly socket: Socket,
		private readonly log: Logger
	) {
		super(router, listener, socket, log);
	}

	async handleRequest(_args: any[]): Promise<void> {
		const callId: string = _.last(_args);

		const args: any[] = this.serializer(_.initial(_args));

		this.logCall(callId, args);

		const observable = Reflect.apply(this.listener, this.router, args);

		this.socket.on(`${callId}_subscribe`, (subscriptionId) => {
			const subscription = observable.subscribe({
				next: (value) => {
					this.log.info(
						{
							...this.baseLogDetails,
							callId,
							value,
						},
						`Listener emitted next value`
					);
					this.socket.emit(`${subscriptionId}_next`, value);
				},
				error: (err) => {
					this.log.error(
						{
							...this.baseLogDetails,
							callId,
							err,
						},
						`Listener thrown error!`
					);
					this.socket.emit(
						`${subscriptionId}_error`,
						this.serializeError(err)
					);
				},
				complete: () => {
					this.log.info(
						{
							...this.baseLogDetails,
							callId,
						},
						`Listener completed`
					);
					this.socket.emit(`_${subscriptionId}_complete`);
				},
			});

			this.socket.on(`${subscriptionId}_unsubscribe`, () =>
				subscription.unsubscribe()
			);

			this.socket.on('disconnect', () => subscription.unsubscribe());
		});
	}
}
