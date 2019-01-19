import { Resolver, Query } from '@nestjs/graphql';
import { WarehousesCarriersService } from '../../services/warehouses';
import { first } from 'rxjs/operators';

@Resolver('WarehouseCarriers')
export class WarehouseCarriersResolver {
	constructor(
		private readonly _warehousesCarriersService: WarehousesCarriersService
	) {}

	@Query()
	async getStoreCarriers(_, { storeId }: { storeId: string }) {
		const result = await this._warehousesCarriersService
			.get(storeId)
			.pipe(first())
			.toPromise();

		return result;
	}
}
