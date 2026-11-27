import { IRouter } from '../../router/router';
import { IListenerHandler } from './handler';
import * as _ from 'lodash';
import Logger from 'bunyan';
import { BaseListenerHandler } from './base';
import { ObservableListener } from '../observable';
import { Socket } from 'socket.io';
import { TenantContext } from '../../../../tenant/tenant-context';
import { throwError } from 'rxjs';

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

	/** Keeps the `<callId>_subscribe` events that arrive before handleRequest runs. */
	protected receivedCall(_args: any[]): EarlySubscribes {
		const callId: string = _.last(_args);
		const early: EarlySubscribes = { pending: [], subscribe: null };

		this.socket.on(`${callId}_subscribe`, (subscriptionId: string) => {
			if (early.subscribe) {
				early.subscribe(subscriptionId);
			} else {
				early.pending.push(subscriptionId);
			}
		});

		return early;
	}

	async handleRequest(_args: any[], early?: EarlySubscribes): Promise<void> {
		const callId: string = _.last(_args);

		const args: any[] = this.serializer(_.initial(_args));

		this.logCall(callId, args);

		const denied = this.accessError();

		if (denied) {
			this.log.info(
				{ ...this.baseLogDetails, callId, reason: denied.message },
				`Listener call refused`,
			);
		}

		const observable = denied
			? throwError(() => denied)
			: Reflect.apply(this.listener, this.router, args);

		// The client subscribes in a later socket event, outside the tenant
		// context of this call: subscribe in the context of the call.
		const tenantCtx = TenantContext.capture();

		const subscribe = (subscriptionId: string) => {
			const subscription = TenantContext.run(tenantCtx, () => observable.subscribe({
				next: (value) => {
					this.log.info(
						{
							...this.baseLogDetails,
							callId,
							value: this.toLoggable(value),
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
			}));

			this.socket.on(`${subscriptionId}_unsubscribe`, () =>
				subscription.unsubscribe()
			);

			this.socket.on('disconnect', () => subscription.unsubscribe());
		};

		if (early) {
			early.subscribe = subscribe;
			early.pending.splice(0).forEach(subscribe);
		} else {
			this.socket.on(`${callId}_subscribe`, subscribe);
		}
	}
}

/** `<callId>_subscribe` events of a call, kept until the call ran. */
interface EarlySubscribes {
	pending: string[];
	subscribe: ((subscriptionId: string) => void) | null;
}
