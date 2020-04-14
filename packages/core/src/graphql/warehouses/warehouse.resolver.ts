import { Mutation, Query, ResolveProperty, Resolver } from '@nestjs/graphql';
import { default as IWarehouse } from '@modules/server.common/interfaces/IWarehouse';
import Warehouse from '@modules/server.common/entities/Warehouse';
import {
	WarehousesCarriersService,
	WarehousesOrdersService,
	WarehousesService,
	WarehousesUsersService,
	WarehousesProductsService,
} from '../../services/warehouses';
import { DevicesService } from '../../services/devices';
import { OrdersService } from '../../services/orders';
import { UsersService } from '../../services/users';
import { GeoLocationsWarehousesService } from '../../services/geo-locations';
import { first } from 'rxjs/operators';
import { IWarehouseRegistrationInput } from '@modules/server.common/routers/IWarehouseRouter';
import IGeoLocation, {
	IGeoLocationCreateObject,
	ILocation,
} from '@modules/server.common/interfaces/IGeoLocation';
import User from '@modules/server.common/entities/User';
import Utils from '@modules/server.common/utils';
import GeoLocation from '@modules/server.common/entities/GeoLocation';

@Resolver('Warehouse')
export class WarehouseResolver {
	constructor(
		private readonly _geoLocationWarehousesService: GeoLocationsWarehousesService,
		private readonly _warehousesService: WarehousesService,
		private readonly _warehousesOrdersService: WarehousesOrdersService,
		private readonly _warehousesUsersService: WarehousesUsersService,
		private readonly _warehousesCarriersService: WarehousesCarriersService,
		private readonly _warehouseProductsService: WarehousesProductsService,
		private readonly _devicesService: DevicesService,
		private readonly _ordersService: OrdersService,
		private readonly _usersService: UsersService
	) {}

	@Query()
	async hasExistingStores(): Promise<boolean> {
		return (await this._warehousesService.count({})) > 0;
	}

	@Query()
	async getStoreProducts(
		_,
		{ storeId, fullProducts }: { storeId: string; fullProducts: boolean }
	) {
		return this._warehouseProductsService
			.get(storeId, fullProducts)
			.pipe(first())
			.toPromise();
	}

	@Query()
	async getStoreAvailableProducts(_, { storeId }: { storeId: string }) {
		return this._warehouseProductsService
			.getAvailable(storeId)
			.pipe(first())
			.toPromise();
	}

	@Query()
	async getAllActiveStores(_, { fullProducts }: { fullProducts: boolean }) {
		return this._warehousesService
			.getAllActive(fullProducts)
			.pipe(first())
			.toPromise();
	}

	@Query()
	async countStoreCustomers(_, { storeId }: { storeId: string }) {
		const storeOrders = await this._warehousesOrdersService
			.get(storeId)
			.pipe(first())
			.toPromise();

		const storeCustomerIds = storeOrders.map((order) =>
			order.user._id.toString()
		);

		return new Set(storeCustomerIds).size;
	}

	@Query()
	async getCountExistingCustomers() {
		const isDeletedFlag = { isDeleted: { $eq: false } };
		const users: string[] = await this._ordersService.Model.find(
			isDeletedFlag
		)
			.distinct('user._id')
			.lean();

		const storesIds: string[] = await this._ordersService.Model.find(
			isDeletedFlag
		)
			.distinct('warehouse')
			.lean();

		return {
			total: users.length,
			perStore: storesIds.map(async (storeId) => {
				const usersIds: string[] = await this._ordersService.Model.find(
					{
						...isDeletedFlag,
						warehouse: storeId,
					}
				).distinct('user._id');
				return {
					storeId,
					customersCount: usersIds.length,
				};
			}),
		};
	}

	@Query()
	async getCountExistingCustomersToday() {
		const isDeletedFlag = { isDeleted: { $eq: false } };

		const start = new Date();
		const end = new Date();
		start.setHours(0, 0, 0, 0);
		end.setHours(23, 59, 59, 999);

		const users = await this._ordersService.Model.find({
			...isDeletedFlag,
			_createdAt: { $gte: start, $lt: end },
		})
			.distinct('user._id')
			.lean()
			.exec();

		const storesIds: string[] = await this._ordersService.Model.find({
			...isDeletedFlag,
			_createdAt: { $gte: start, $lt: end },
		})
			.distinct('warehouse')
			.lean()
			.exec();

		return {
			total: users.length,
			perStore: storesIds.map(async (storeId) => {
				const usersIds: string[] = await this._ordersService.Model.find(
					{
						...isDeletedFlag,
						'user._id': { $in: users.map((u) => u._id) },
						warehouse: storeId,
					}
				).distinct('user._id');
				return {
					storeId,
					customersCount: usersIds.length,
				};
			}),
		};
	}

	@Query('nearbyStores')
	async getNearbyStores(_, { geoLocation }) {
		return this._geoLocationWarehousesService
			.get(geoLocation)
			.pipe(first())
			.toPromise();
	}

	// @UseGuards(AuthGuard('jwt'))
	@Query('warehouse')
	async getWarehouse(_, { id }: { id: string }) {
		return this._warehousesService.get(id).pipe(first()).toPromise();
	}

	@Query()
	async getAllStores() {
		return this._warehousesService.find({ isDeleted: { $eq: false } });
	}

	@Query('warehouses')
	async getWarehouses(_, { findInput, pagingOptions = {} }) {
		if (!pagingOptions || (pagingOptions && !pagingOptions['sort'])) {
			pagingOptions['sort'] = { field: '_createdAt', sortBy: 'desc' };
		}

		const merchants = await this._warehousesService.getMerchants(
			findInput,
			pagingOptions
		);

		return merchants.map((m) => new Warehouse(m));
	}

	@Query()
	async getStoreCustomers(
		_,
		{ storeId }: { storeId: string }
	): Promise<User[]> {
		return this._warehousesUsersService.getPromise(storeId);
	}

	@Query()
	async getCountOfMerchants() {
		return this._warehousesService.Model.find({ isDeleted: { $eq: false } })
			.countDocuments()
			.exec();
	}

	@Query()
	async getMerchantsBuyName(
		_,
		{
			searchName,
			geoLocation,
		}: { searchName: string; geoLocation: IGeoLocation }
	) {
		const count = await this._warehousesService.Model.find({
			name: { $regex: searchName, $options: 'i' },
		})
			.countDocuments()
			.exec();

		let merchants = await this._warehousesService.getMerchants(
			{ name: { $regex: searchName, $options: 'i' } },
			{ skip: 0, limit: count }
		);

		if (geoLocation) {
			merchants = merchants.sort(
				(m1, m2) =>
					Utils.getDistance(
						new GeoLocation(m1.geoLocation),
						new GeoLocation(geoLocation)
					) -
					Utils.getDistance(
						new GeoLocation(m2.geoLocation),
						new GeoLocation(geoLocation)
					)
			);
		}

		return merchants.map((m) => new Warehouse(m));
	}

	@Mutation()
	async warehouseLogin(
		_,
		{ username, password }: { username: string; password: string }
	) {
		return this._warehousesService.login(username, password);
	}

	@Mutation()
	async updateStoreGeoLocation(
		_,
		{
			storeId,
			geoLocation,
		}: {
			storeId: string;
			geoLocation: IGeoLocationCreateObject;
		}
	) {
		return this._warehousesService.updateGeoLocation(storeId, geoLocation);
	}

	@Mutation()
	async registerWarehouse(
		_,
		{ registerInput }: { registerInput: IWarehouseRegistrationInput }
	) {
		return this._warehousesService.register(registerInput);
	}

	@Mutation()
	async removeWarehousesByIds(_, { ids }: { ids: string[] }) {
		return this._warehousesService.removeMultipleByIds(ids);
	}

	@ResolveProperty('devices')
	async getDevices(_warehouse: IWarehouse) {
		const warehouse = new Warehouse(_warehouse);
		return this._devicesService
			.getMultiple(warehouse.devicesIds)
			.pipe(first())
			.toPromise();
	}

	@ResolveProperty('orders')
	async getOrders(_warehouse: IWarehouse) {
		const warehouse = new Warehouse(_warehouse);
		return this._warehousesOrdersService
			.get(warehouse.id)
			.pipe(first())
			.toPromise();
	}

	@ResolveProperty('users')
	async getUsers(_warehouse: IWarehouse) {
		const warehouse = new Warehouse(_warehouse);

		return this._warehousesUsersService
			.get(warehouse.id)
			.pipe(first())
			.toPromise();
	}

	@ResolveProperty('carriers')
	async getCarriers(_warehouse: IWarehouse) {
		const warehouse = new Warehouse(_warehouse);

		return this._warehousesCarriersService
			.get(warehouse.id)
			.pipe(first())
			.toPromise();
	}

	@Mutation()
	async updateWarehousePassword(
		_,
		{
			id,
			password,
		}: { id: Warehouse['id']; password: { current: string; new: string } }
	) {
		return this._warehousesService.updatePassword(id, password);
	}
}
