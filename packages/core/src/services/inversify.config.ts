import 'reflect-metadata';
import { Container, interfaces, ContainerModule } from 'inversify';
import _ from 'lodash';
import { IRoutersManager, RoutersManager, RouterSymbol } from '@pyro/io';
import { CarriersOrdersService, CarriersService } from './carriers';
import {
	SocialRegisterService,
	SocialStrategiesService,
	UsersOrdersService,
	UsersProductsService,
	UsersService,
	UserCommandService,
} from './users';
import { ProductsCategoriesService, ProductsService } from './products';
import {
	WarehousesCarriersService,
	WarehousesOrdersService,
	WarehousesProductsService,
	WarehousesService,
	WarehousesUsersService,
} from './warehouses';
import { OrdersService } from './orders';
import { InvitesRequestsService, InvitesService } from './invites';
import {
	GeoLocationsOrdersService,
	GeoLocationsProductsService,
	GeoLocationsWarehousesService,
	GeoLocationsService,
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

function getRepository(t: any): any {
	const conn = getConnection('typeorm');
	return conn.getRepository(t);
}

const bindings = new ContainerModule((bind: interfaces.Bind) => {
	bind<Repository<Admin>>('AdminRepository')
		.toDynamicValue(() => {
			return getRepository(Admin);
		})
		.inRequestScope();

	bind<Repository<Device>>('DeviceRepository')
		.toDynamicValue(() => {
			return getRepository(Device);
		})
		.inRequestScope();

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
			CurrenciesService,
		],
		(Service: any) => {
			bind(Service).to(Service).inSingletonScope();

			bind<any>(ServiceSymbol).toFactory<any>((context) => {
				return context.container.get<any>(Service);
			});

			bind<any>(RouterSymbol).toFactory<any>((context) => {
				return context.container.get<any>(Service);
			});
		}
	);

	bind(AuthService).toSelf();

	bind('Factory<AuthService>').toFactory(authServiceFactory);

	bind<IRoutersManager>('RoutersManager')
		.to(RoutersManager)
		.inSingletonScope();

	bind<ServicesApp>(ServicesApp).toSelf().inSingletonScope();
});

const container = new Container();

container.load(bindings);

export const servicesContainer = container;
