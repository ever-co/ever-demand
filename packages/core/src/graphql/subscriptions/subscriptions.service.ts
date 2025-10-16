import WebSocket from 'ws';
import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { SUBSCRIPTION_SERVER } from './subscription.constants';
import { ServerOptions, SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';

@Injectable()
export class SubscriptionsService implements OnModuleDestroy {
	private subscriptionServer: SubscriptionServer;

	constructor(@Inject(SUBSCRIPTION_SERVER) private readonly ws) {}

	createSubscriptionServer(
		schema: any,
		options: ServerOptions = {},
		socketOptions: WebSocket.ServerOptions = {}
	) {

		const o: ServerOptions  = {
			execute,
			subscribe,
			schema,
			...options,
		};

		this.subscriptionServer = new SubscriptionServer(
			o,
			{
				server: this.ws,
				path: '/subscriptions',
				...socketOptions,
			}
		);
	}

	onModuleDestroy() {
		this.ws.close();
	}
}
