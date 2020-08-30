import { DynamicModule, Module } from '@nestjs/common';
import { createSubscriptionProviders } from './subscription.providers';
import { SubscriptionsService } from './subscriptions.service';

@Module({
	providers: [SubscriptionsService],
	exports: [SubscriptionsService],
})
export class SubscriptionsModule {
	static forRoot(port: number): DynamicModule {
		const providers = createSubscriptionProviders(port);
		return {
			module: SubscriptionsModule,
			providers: [...providers],
			exports: [...providers],
		};
	}
}
