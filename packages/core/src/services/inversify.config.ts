import 'reflect-metadata';
import { Container, ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import * as _ from 'lodash';
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
import {
	AuthenticationService,
	AuthService,
	authServiceFactory,
	AuthServiceFactory,
} from './auth';
import { UsersAuthService } from './users/UsersAuthService';
import { AdminsService } from './admins';
import { Repository } from 'typeorm';
import { TenantScopedRepository } from '../tenant/tenant-repository';
import { getTypeORMDataSource } from '../helpers/typeorm';
import Admin from '@modules/server.common/entities/Admin';
import Device from '@modules/server.common/entities/Device';
import { FakeOrdersService } from './fake-data/FakeOrdersService';
import { CurrenciesService } from './currency/CurrencyService';
import { PromotionService } from './products/PromotionService';
import { AppsSettingsService } from './apps-settings';

function getRepository(t: any): any {
	return getTypeORMDataSource().getRepository(t);
}

/** TypeORM repositories of tenant-owned entities are limited to the current tenant. */
function getTenantRepository(t: any): any {
	return new TenantScopedRepository(getRepository(t), t.modelName ?? t.name);
}

const bindings = new ContainerModule(({ bind }: ContainerModuleLoadOptions) => {
	bind<Repository<Admin>>('AdminRepository')
		.toDynamicValue(() => {
			return getTenantRepository(Admin);
		})
		.inRequestScope();

	bind<Repository<Device>>('DeviceRepository')
		.toDynamicValue(() => {
			return getTenantRepository(Device);
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
			PromotionService,
			AppsSettingsService
		],
		(Service: any) => {
			bind(Service).to(Service).inSingletonScope();

			// Every service is also reachable through the multi-bindings below
			// (ServicesApp, the NestJS ServicesModule and the socket.io routers
			// get all of them), resolving to the same singleton.
			bind<any>(ServiceSymbol).toDynamicValue((context) => {
				return context.get<any>(Service);
			});

			bind<any>(RouterSymbol).toDynamicValue((context) => {
				return context.get<any>(Service);
			});
		}
	);

	bind(AuthService).toSelf();

	bind<AuthServiceFactory>('Factory<AuthService>').toFactory(authServiceFactory);

	bind<IRoutersManager>('RoutersManager')
		.to(RoutersManager)
		.inSingletonScope();

	bind<ServicesApp>(ServicesApp).toSelf().inSingletonScope();
});

const container = new Container();

container.load(bindings);

export const servicesContainer = container;
