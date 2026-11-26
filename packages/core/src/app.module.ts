import { styleText } from 'node:util';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import mongoose from 'mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { SubscriptionsModule } from './graphql/subscriptions/subscriptions.module';
import { InvitesModule } from './graphql/invites/invites.module';
import { DevicesModule } from './graphql/devices/devices.module';
import { ConfigModule } from './config/config.module';
import { ProductModule } from './controllers/product/product.module';
import { UsersModule } from './graphql/users/users.module';
import { WarehousesModule } from './graphql/warehouses/warehouses.module';
import { OrdersModule } from './graphql/orders/orders.module';
import { CarriersModule } from './graphql/carriers/carriers.module';
import { ProductsModule } from './graphql/products/products.module';
import Logger from 'bunyan';
import { env } from './env';
import { createEverLogger } from './helpers/Log';
import { CqrsModule } from '@nestjs/cqrs';
import { TestController } from './controllers/test.controller';
import { HealthController } from './controllers/health/health.controller';
import { GeoLocationsModule } from './graphql/geo-locations/geo-locations.module';
import { WarehousesProductsModule } from './graphql/warehouses-products/warehouses-products.modules';
import { WarehousesCarriersModule } from './graphql/warehouses-carriers/warehouses-carriers.module';
import { WarehousesOrdersModule } from './graphql/warehouses-orders/warehouses-orders.module';
import { InvitesRequestsModule } from './graphql/invites-requests/invites-requests.module';
import { AuthModule } from './auth/auth.module';
import { AdminsModule } from './graphql/admin/admins.module';
import { DataModule } from './graphql/data/data.module';
import { CarriersOrdersModule } from './graphql/carriers-orders/carriers-orders.module';
import { GeoLocationOrdersModule } from './graphql/geo-locations/orders/geo-location-orders.module';
import { GeoLocationMerchantsModule } from './graphql/geo-locations/merchants/geo-location-merchants.module';
import { GetAboutUsHandler } from './services/users';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from './services/services.module';
import { CurrencyModule } from './graphql/currency/currency.module';
import { PromotionModule } from './graphql/products/promotions/promotion.module';
import { AppsSettingsModule } from './graphql/apps-settings/apps-settings.module';
import { getTypeORMEntities, getTypeORMOptions } from './helpers/typeorm';
import { createGraphQLContext } from './graphql/graphql-context';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLAccessGuard } from './graphql/access/graphql-access.guard';

const port = env.GQLPORT;
const host = env.API_HOST;

const log: Logger = createEverLogger({
	name: 'NestJS ApplicationModule',
});

// Add here all CQRS command handlers (CqrsModule finds them among the providers)
export const CommandHandlers = [GetAboutUsHandler];

// Add here all CQRS event handlers
export const EventHandlers = [];

const entities = getTypeORMEntities();

@Module({
	controllers: [TestController, HealthController],
	providers: [
		...CommandHandlers,
		...EventHandlers,
		// default-deny access to every GraphQL operation (graphql/access)
		{ provide: APP_GUARD, useClass: GraphQLAccessGuard },
	],
	imports: [
		DataModule,
		ServicesModule,
		CqrsModule.forRoot(),
		AuthModule,
		AdminsModule,
		AppsSettingsModule,
		ConfigModule,
		// Default TypeORM connection, which can be used inside NestJS (e.g. resolvers).
		// Our services use their own one, see helpers/typeorm.ts.
		TypeOrmModule.forRoot(getTypeORMOptions()),
		// define which repositories shall be registered in the current scope (each entity will have own repository).
		// Thanks to that we can inject the XXXXRepository to the NestJS using the @InjectRepository() decorator
		// NOTE: this could be used inside NestJS only, not inside our services
		TypeOrmModule.forFeature(entities),
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			// schema-first: the schema is built from all *.graphql files
			typePaths: ['./**/*.graphql'],
			debug: !env.isProd,
			// GraphiQL landing page at /graphql (Apollo Server 5 has no Playground)
			graphiql: true,
			context: createGraphQLContext,
		}),
		// graphql-ws server (subscriptions) on its own port, GQLPORT_SUBSCRIPTIONS
		SubscriptionsModule.forRoot(env.GQLPORT_SUBSCRIPTIONS),
		InvitesModule,
		DevicesModule,
		ProductModule,
		WarehousesModule,
		GeoLocationsModule,
		UsersModule,
		OrdersModule,
		CarriersModule,
		CarriersOrdersModule,
		ProductsModule,
		WarehousesProductsModule,
		WarehousesOrdersModule,
		WarehousesCarriersModule,
		InvitesRequestsModule,
		GeoLocationOrdersModule,
		GeoLocationMerchantsModule,
		CurrencyModule,
		PromotionModule,
	],
})
export class ApplicationModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		console.log(styleText('green', `Configuring NestJS ApplicationModule`));

		// trick for GraphQL vs MongoDB ObjectId type.
		// See https://github.com/apollographql/apollo-server/issues/1633 and
		// https://github.com/apollographql/apollo-server/issues/1649#issuecomment-420840287
		const { ObjectId } = mongoose.Types;

		ObjectId.prototype.valueOf = function () {
			return this.toString();
		};

		log.info(`GraphQL GraphiQL available at http://${host}:${port}/graphql`);
		console.log(
			styleText(
				'green',
				`GraphQL GraphiQL available at http://${host}:${port}/graphql`
			)
		);
	}
}
