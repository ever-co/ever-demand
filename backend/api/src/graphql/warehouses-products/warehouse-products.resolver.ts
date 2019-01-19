import { Mutation, Resolver } from '@nestjs/graphql';
import { IWarehouseProductCreateObject } from '@modules/server.common/interfaces/IWarehouseProduct';
import { WarehousesProductsService } from '../../services/warehouses';
import { Exception } from 'handlebars';

@Resolver('Warehouse-products')
export class WarehouseProductsResolver {
	constructor(
		private readonly _warehousesProductsService: WarehousesProductsService
	) {}

	@Mutation()
	async addWarehouseProducts(
		_,
		{
			warehouseId,
			products
		}: { warehouseId: string; products: IWarehouseProductCreateObject[] }
	) {
		return this._warehousesProductsService.add(warehouseId, products);
	}

	@Mutation()
	async removeWarehouseProducts(
		_,
		{
			warehouseId,
			productsIds
		}: { warehouseId: string; productsIds: string[] }
	) {
		return this._warehousesProductsService.remove(warehouseId, productsIds);
	}

	@Mutation()
	async updateWarehouseProduct(
		_,
		{
			warehouseId,
			productId,
			updateInput
		}: {
			warehouseId: string;
			productId: string;
			updateInput: {
				quantity: {
					increase: number;
					decrease: number;
					to: number;
				};
				price: number;
			};
		}
	) {
		throw new Exception('not implemented');
		/*
		if (updateInput.quantity) {
			if (Object.keys(updateInput.quantity).length !== 1) {
				throw new Error("Can't");
			}

			this._warehousesProductsService.
		}
		return await this._warehousesProductsService.();
		*/
	}
}
