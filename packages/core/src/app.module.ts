import chalk from 'chalk';
import fs from 'fs';
import {
	MiddlewareConsumer,
	Module,
	NestModule,
	OnModuleInit
} from '@nestjs/common';
import mongoose from 'mongoose';
import { GraphQLSchema } from 'graphql';
import { GraphQLModule } from '@nestjs/graphql';
import { SubscriptionsModule } from './graphql/subscriptions/subscriptions.module';
import { SubscriptionsService } from './graphql/subscriptions/subscriptions.service';
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
import { CommandBus, EventBus, CqrsModule } from '@nestjs/cqrs';
import { TestController } from './controllers/test.controller';
import { ModuleRef } from '@nestjs/core';
import { GeoLocationsModule } from './graphql/geo-locations/geo-locations.module';
import { SCALARS } from './graphql/scalars';
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
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginLandingPageGraphQLPlayground, ApolloServerPluginLandingPageGraphQLPlaygroundOptions } from 'apollo-server-core';

// See https://www.apollographql.com/docs/apollo-server/migration/
import { makeExecutableSchema } from '@graphql-tools/schema';

// See https://www.graphql-tools.com/docs/migration/migration-from-merge-graphql-schemas
import { mergeTypeDefs } from '@graphql-tools/merge';
import { loadFilesSync } from '@graphql-tools/load-files';

import { GetAboutUsHandler } from './services/users';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ServicesModule } from './services/services.module';
import { ServicesApp } from './services/services.app';
import { CurrencyModule } from './graphql/currency/currency.module';
import { PromotionModule } from './graphql/products/promotions/promotion.module';
import { AppsSettingsModule } from './graphql/apps-settings/apps-settings.module';

type Config = Parameters<typeof mergeTypeDefs>[1];

const mergeTypes = (types: any[], options?: { schemaDefinition?: boolean, all?: boolean } & Partial<Config>) => {
	const schemaDefinition = options && typeof options.schemaDefinition === 'boolean'
	  ? options.schemaDefinition
	  : true;

	return mergeTypeDefs(types, {
	  useSchemaDefinition: schemaDefinition,
	  forceSchemaDefinition: schemaDefinition,
	  throwOnConflict: true,
	  commentDescriptions: true,
	  reverseDirectives: true,
	  ...options,
	});
  };

const port = env.GQLPORT;
const host = env.API_HOST;

const log: Logger = createEverLogger({
	name: 'NestJS ApplicationModule',
});

// Add here all CQRS command handlers
export const CommandHandlers = [GetAboutUsHandler];

// Add here all CQRS event handlers
export const EventHandlers = [];

const entities = ServicesApp.getEntities();

const isSSL = process.env.DB_SSL_MODE && process.env.DB_SSL_MODE !== 'false';

// let's temporary save Cert in ./tmp/logs folder because we have write access to it
let sslCertPath = `${env.LOGS_PATH}/ca-certificate.crt`;

if (isSSL) {
	const base64data = process.env.DB_CA_CERT;
	const buff = Buffer.from(base64data, 'base64');
	const sslCert = buff.toString('ascii');
	fs.writeFileSync(sslCertPath, sslCert);
}

// TODO: put to config
const connectTimeoutMS: number = 40000;

// TODO: put to config (we also may want to increase it)
const poolSize: number = 50;

// We creating default connection for TypeORM.
// It might be used in every place where we do not explicitly require connection with some name.
// For example, we are using connection named "typeorm" inside our repositories
const connectionSettings: TypeOrmModuleOptions = {
	// Note: do not change this connection name, it should be default one!
	// TODO: put this into settings (it's mongo only during testing of TypeORM integration!)
	type: 'mongodb',
	url: env.DB_URI,
	ssl: isSSL,
	sslCA: isSSL ? [sslCertPath] : undefined,
	host: process.env.DB_HOST || 'localhost',
	username: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME || 'ever_development',
	port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 27017,
	entities,
	synchronize: true,
	useNewUrlParser: true,
	// autoReconnect: true,
	// reconnectTries: Number.MAX_VALUE,
	// poolSize: poolSize,
	connectTimeoutMS: connectTimeoutMS,
	logging: true,
	logger: 'file', // Removes console logging, instead logs all queries in a file ormlogs.log
	useUnifiedTopology: true,
};

@Module({
	controllers: [TestController],
	providers: [...CommandHandlers, ...EventHandlers],
	imports: [
		DataModule,
		ServicesModule,
		CqrsModule,
		AuthModule,
		AdminsModule,
		AppsSettingsModule,
		ConfigModule,
		// configure TypeORM Connection which will be possible to use inside NestJS (e.g. resolvers)
		TypeOrmModule.forRoot(connectionSettings),
		// define which repositories shall be registered in the current scope (each entity will have own repository).
		// Thanks to that we can inject the XXXXRepository to the NestJS using the @InjectRepository() decorator
		// NOTE: this could be used inside NestJS only, not inside our services
		TypeOrmModule.forFeature(entities),
		SubscriptionsModule.forRoot(env.GQLPORT_SUBSCRIPTIONS),
		GraphQLModule.forRoot({
			typePaths: ['./**/*.graphql'],
			installSubscriptionHandlers: true,
			debug: !env.isProd,
			playground: true,
			context: ({ req, res }) => ({
				req,
			}),

		}),
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
export class ApplicationModule implements NestModule, OnModuleInit {
	constructor(
		// @Inject(HTTP_SERVER_REF)
		// private readonly httpServerRef: HttpServer,
		private readonly subscriptionsService: SubscriptionsService,
		// Next required for NestJS CQRS (see https://docs.nestjs.com/recipes/cqrs)
		private readonly moduleRef: ModuleRef,
		private readonly command$: CommandBus,
		private readonly event$: EventBus
	) {}

	onModuleInit() {
		// initialize CQRS
		this.event$.register(EventHandlers);
		this.command$.register(CommandHandlers);
	}

	configure(consumer: MiddlewareConsumer) {

		console.log(chalk.green(`Configuring NestJS ApplicationModule`));

		// trick for GraphQL vs MongoDB ObjectId type.
		// See https://github.com/apollographql/apollo-server/issues/1633 and
		// https://github.com/apollographql/apollo-server/issues/1649#issuecomment-420840287
		const { ObjectId } = mongoose.Types;

		ObjectId.prototype.valueOf = function () {
			return this.toString();
		};

		/* Next is code which could be used to manually create GraphQL Server instead of using GraphQLModule.forRoot(...)

		const schema: GraphQLSchema = this.createSchema();
		const server: ApolloServer = this.createServer(schema);

		// this creates manually GraphQL subscriptions server (over ws connection)
		this.subscriptionsService.createSubscriptionServer(server);

		const app: any = this.httpServerRef;

		const graphqlPath = '/graphql';

		server.applyMiddleware({app, path: graphqlPath});

		*/

		log.info(`GraphQL Playground available at http://${host}:${port}/graphql`);
		console.log(chalk.green(`GraphQL Playground available at http://${host}:${port}/graphql`));
	}

	/*
		Creates GraphQL Apollo Server manually
	*/
	createServer(schema: GraphQLSchema): ApolloServer {

		const playgroundOptions: ApolloServerPluginLandingPageGraphQLPlaygroundOptions =
			{
				endpoint: `http://${host}:${port}/graphql`,
				subscriptionEndpoint: `ws://${host}:${port}/subscriptions`,
				settings: {
					'editor.theme': 'dark'
				}
			};

		return new ApolloServer({
			schema,
			context: ({ req, res }) => ({
				req,
			}),
			plugins: [
				ApolloServerPluginLandingPageGraphQLPlayground(playgroundOptions)
			]
		});
	}


	/*
		Creates GraphQL Schema manually.
		See also code in https://github.com/nestjs/graphql/blob/master/lib/graphql.module.ts how it's done by Nest
	*/
	createSchema(): GraphQLSchema {
		const graphqlPath = './**/*.graphql';

		console.log(`Searching for *.graphql files`);

		const typesArray = loadFilesSync(graphqlPath);

		const typeDefs = mergeTypes(typesArray, { all: true });

		// we can save all GraphQL types into one file for later usage by other systems
		// import { writeFileSync } from 'fs';
		// writeFileSync('./all.graphql', typeDefs);

		const schema = makeExecutableSchema({
			typeDefs,
			resolvers: {
				...SCALARS,
			},
		});

		return schema;
	}
}
