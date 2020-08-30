import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductsCategoriesService } from '../../../services/products';
import { IProductsCategoryCreateObject } from '@modules/server.common/interfaces/IProductsCategory';
import { first } from 'rxjs/operators';

@Resolver('ProductsCategory')
export class ProductsCategoryResolver {
	constructor(
		private readonly _productsCategoriesService: ProductsCategoriesService
	) {}

	@Query('productsCategory')
	async getProductsCategory(_, { id }: { id: string }) {
		return this._productsCategoriesService
			.get(id)
			.pipe(first())
			.toPromise();
	}

	@Query('productsCategories')
	async getProductsCategories(_, { findInput }) {
		return this._productsCategoriesService.find({
			...findInput,
			isDeleted: { $eq: false },
		});
	}

	@Mutation()
	async createProductsCategory(
		_,
		{ createInput }: { createInput: IProductsCategoryCreateObject }
	) {
		return this._productsCategoriesService.create(createInput);
	}

	@Mutation()
	async updateProductsCategory(
		_,
		{
			id,
			updateInput,
		}: { id: string; updateInput: IProductsCategoryCreateObject }
	) {
		await this._productsCategoriesService.throwIfNotExists(id);
		return this._productsCategoriesService.update(id, updateInput);
	}

	@Mutation()
	async removeProductsCategoriesByIds(_, { ids }: { ids: string[] }) {
		const categories = await this._productsCategoriesService.find({
			_id: { $in: ids },
			isDeleted: { $eq: false },
		});

		const categoriesIds = categories.map((c) => c.id);

		return this._productsCategoriesService.removeMultipleByIds(
			categoriesIds
		);
	}
}
