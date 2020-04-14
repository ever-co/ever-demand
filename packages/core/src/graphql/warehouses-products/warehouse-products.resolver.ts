import { Mutation, Resolver, Query } from '@nestjs/graphql';
import { IWarehouseProductCreateObject } from '@modules/server.common/interfaces/IWarehouseProduct';
import { WarehousesProductsService } from '../../services/warehouses';
import { Exception } from 'handlebars';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { first } from 'rxjs/operators';

@Resolver('Warehouse-products')
export class WarehouseProductsResolver {
	constructor(
		private readonly _warehousesProductsService: WarehousesProductsService
	) {}

	@Query()
	async getProductsWithPagination(_, { id, pagingOptions = {} }) {
		const warehouseProducts = await this._warehousesProductsService.getProductsWithPagination(
			id,
			pagingOptions
		);

		return warehouseProducts.map((p) => new WarehouseProduct(p));
	}

	@Query()
	async getProductsCount(_, { id }: { id: string }) {
		return this._warehousesProductsService.getProductsCount(id);
	}

	@Query()
	async getWarehouseProduct(
		_,
		{
			warehouseId,
			warehouseProductId,
		}: { warehouseId: string; warehouseProductId: string }
	) {
		return await this._warehousesProductsService
			.getProduct(warehouseId, warehouseProductId)
			.pipe(first())
			.toPromise();
	}

	@Mutation()
	async addWarehouseProducts(
		_,
		{
			warehouseId,
			products,
		}: { warehouseId: string; products: IWarehouseProductCreateObject[] }
	) {
		return this._warehousesProductsService.add(warehouseId, products);
	}

	@Mutation()
	async removeWarehouseProducts(
		_,
		{
			warehouseId,
			productsIds,
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
			updateInput,
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
