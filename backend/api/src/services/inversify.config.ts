import 'reflect-metadata';
import { Container, interfaces, ContainerModule, injectable } from 'inversify';
import * as _ from 'lodash';
import { IRoutersManager, RoutersManager, RouterSymbol } from '@pyro/io';
import { CarriersOrdersService, CarriersService } from './carriers';
import {
	SocialRegisterService,
	SocialStrategiesService,
	UsersOrdersService,
	UsersProductsService,
	UsersService,
	UserCommandService
} from './users';
import { ProductsCategoriesService, ProductsService } from './products';
import {
	WarehousesCarriersService,
	WarehousesOrdersService,
	WarehousesProductsService,
	WarehousesService,
	WarehousesUsersService
} from './warehouses';
import { OrdersService } from './orders';
import { InvitesRequestsService, InvitesService } from './invites';
import {
	GeoLocationsOrdersService,
	GeoLocationsProductsService,
	GeoLocationsWarehousesService,
	GeoLocationsService
} from './geo-locations';
import { DevicesService } from './devices';
import { ServiceSymbol } from './IService';
import { ConfigService } from '../config/config.service';
import { ServicesApp } from './services.app';
import { AuthenticationService, AuthService, authServiceFactory } from './auth';
import { UsersAuthService } from './users/UsersAuthService';
import { AdminsService } from './admins';
import { getConnection, Repository } from 'typeorm';
import Admin from '@modules/server.common/entities/Admin';
import Device from '@modules/server.common/entities/Device';
import { FakeOrdersService } from './fake-data/FakeOrdersService';
import { CurrenciesService } from './currency/CurrencyService';
import Product from '@modules/server.common/entities/Product';
import { ObjectLiteralExpression } from 'ts-morph';
import Carrier from '@modules/server.common/entities/Carrier';
import Currency from '@modules/server.common/entities/Currency';
import Invite from '@modules/server.common/entities/Invite';
import InviteRequest from '@modules/server.common/entities/InviteRequest';
import Order from '@modules/server.common/entities/Order';
import ProductCategory from '@modules/server.common/entities/ProductsCategory';
import User from '@modules/server.common/entities/User';
import Warehouse from '@modules/server.common/entities/Warehouse';
import {
	TypeORMService,
	typeORMServiceFactory
} from '@pyro/db-server/typeorm-service';

function getRepository(t: any): any {
	const conn = getConnection('typeorm');
	return conn.getRepository(t);
}

const bindings = new ContainerModule((bind: interfaces.Bind) => {
	const database = 'mysql' || process.env.DB;

	console.log(`Database is ${database}`);

	[
		Admin,
		Carrier,
		Device,
		Invite,
		InviteRequest,
		Order,
		Product,
		ProductCategory,
		User,
		Warehouse
	].forEach((el: any) => {
		const { modelName } = el;
		bind<Repository<typeof modelName>>(`${el.modelName}Repository`)
			.toDynamicValue(() => {
				return getRepository(el.modelName);
			})
			.inRequestScope();

		// bind<TypeORMService<typeof modelName>>(
		// 	`TypeORMService<${modelName}>`
		// ).toConstantValue(TypeORMService<modelName>)
	});
	_.each(
		[
			ConfigService,
			UserCommandService,
			AdminsService,
			CarriersOrdersService,
			CarriersService,
			DevicesService,
			GeoLocationsOrdersService,
			GeoLocationsProductsService,
			GeoLocationsWarehousesService,
			GeoLocationsService,
			InvitesRequestsService,
			InvitesService,
			OrdersService,
			ProductsService,
			ProductsCategoriesService,
			UsersOrdersService,
			UsersService,
			UsersAuthService,
			SocialStrategiesService,
			SocialRegisterService,
			WarehousesOrdersService,
			WarehousesProductsService,
			WarehousesUsersService,
			WarehousesCarriersService,
			WarehousesService,
			UsersProductsService,
			AuthenticationService,
			FakeOrdersService,
			CurrenciesService
		],
		(Service: any) => {
			bind(Service)
				.to(Service)
				.inSingletonScope();

			bind<any>(ServiceSymbol).toFactory<any>((context) => {
				return context.container.get<any>(Service);
			});

			bind<any>(RouterSymbol).toFactory<any>((context) => {
				return context.container.get<any>(Service);
			});
		}
	);

	bind(AuthService).toSelf();
	bind(TypeORMService).toSelf();

	bind('Factory<AuthService>').toFactory(authServiceFactory);
	bind('Factory<TypeORMService>').toFactory(typeORMServiceFactory);

	bind<IRoutersManager>('RoutersManager')
		.to(RoutersManager)
		.inSingletonScope();

	bind<ServicesApp>(ServicesApp)
		.toSelf()
		.inSingletonScope();

	// [TypeORMService].forEach((Service) => {
	// 	bind(Service).to(Service);
	// });

	bind('DatabaseService').toFactory((context) => {
		return (model) => {
			if (database === 'mongo') {
				return context.container.get<TypeORMService<typeof model>>(
					TypeORMService
				);
			}
			const repo = context.container.get<Repository<any>>(
				`${model}Repository`
			);
			return typeORMServiceFactory(context)(repo);
			// return context.container.get('Factory<TypeORMService>')(model);
		};
	});
});

const container = new Container();

container.load(bindings);

export const servicesContainer = container;
