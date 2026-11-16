import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FakeDataGuard } from '../../auth/guards/fake-data.guard';
import { InvitesService } from '../../services/invites/InvitesService';
import { AdminsService } from '../../services/admins';
import { CarriersService } from '../../services/carriers';
import { InvitesRequestsService } from '../../services/invites';
import { OrdersService } from '../../services/orders';
import { UsersService } from '../../services/users';
import { WarehousesService } from '../../services/warehouses';
import { DevicesService } from '../../services/devices';
import {
	ProductsService,
	ProductsCategoriesService,
} from '../../services/products';

@Resolver('Data')
export class DataResolver {
	//
	constructor(
		private readonly _adminsService: AdminsService,
		private readonly _carriersService: CarriersService,
		private readonly _inviteRequestsService: InvitesRequestsService,
		private readonly _invitesService: InvitesService,
		private readonly _ordersService: OrdersService,
		private readonly _usersService: UsersService,
		private readonly _storesService: WarehousesService,
		private readonly _devicesService: DevicesService,
		private readonly _productsService: ProductsService,
		private readonly _productsCategoriesService: ProductsCategoriesService
	) {}

	@Query('clearAll')
	@UseGuards(FakeDataGuard)
	async clearAll() {
		const services = [
			this._adminsService,
			this._carriersService,
			this._devicesService,
			this._invitesService,
			this._inviteRequestsService,
			this._ordersService,
			this._productsService,
			this._productsCategoriesService,
			this._usersService,
			this._storesService,
		];

		await Promise.all(
			services.map((s) =>
				s.Model.updateMany({}, { isDeleted: true }).exec()
			)
		);

		return true;
	}
}
