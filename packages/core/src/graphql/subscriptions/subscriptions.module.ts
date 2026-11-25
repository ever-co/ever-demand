import { DynamicModule, Module } from '@nestjs/common';
import { SUBSCRIPTIONS_PORT } from './subscription.constants';
import { SubscriptionsService } from './subscriptions.service';

/**
 * Serves GraphQL subscriptions (and any other operation) over the graphql-ws
 * protocol on its own port: ws://<host>:<port>/subscriptions.
 * The schema is the one GraphQLModule builds, so it has to be imported after it.
 */
@Module({})
export class SubscriptionsModule {
	static forRoot(port: number): DynamicModule {
		return {
			module: SubscriptionsModule,
			providers: [
				{ provide: SUBSCRIPTIONS_PORT, useValue: port },
				SubscriptionsService,
			],
			exports: [SubscriptionsService],
		};
	}
}
