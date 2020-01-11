import * as Logger from 'bunyan';
import { injectable, inject } from 'inversify';
import { createEverLogger } from '../../helpers/Log';
import { DBService } from '@pyro/db-server';
import IProductsCategoryRouter from '@modules/server.common/routers/IProductsCategoryRouter';
import { Observable } from 'rxjs';
import { asyncListener, observableListener, routerName } from '@pyro/io';
import IService from '../IService';
import { UpdateObject } from '@pyro/db/db-update-object';
import { CreateObject } from '@pyro/db/db-create-object';
import { first, switchMap, map } from 'rxjs/operators';
import { Repository } from 'typeorm';
import ProductCategory from '@modules/server.common/entities/ProductsCategory';

@injectable()
@routerName('products-category')
export class ProductsCategoriesService extends DBService<ProductCategory>
	implements IProductsCategoryRouter, IService {
	public readonly DBObject = ProductCategory;

	protected readonly log: Logger = createEverLogger({
		name: 'productsCategoriesService'
	});

	constructor(
		@inject('ProductCategoryRepository')
		private readonly _productCategoryRepository: Repository<ProductCategory>
	) {
		super();
		_productCategoryRepository
			.count()
			.then((c) => {
				console.log('Product Categories count: ' + c);
			})
			.catch((e) => {
				console.log(e);
			});
	}

	/**
	 * Get Product Category by Id
	 *
	 * @param {ProductCategory['id']} id
	 * @returns {(Observable<ProductCategory | null>)}
	 * @memberof ProductsCategoriesService
	 */
	@observableListener()
	get(id: ProductCategory['id']): Observable<ProductCategory | null> {
		return super.get(id).pipe(
			map(async (category) => {
				await this.throwIfNotExists(id);
				return category;
			}),
			switchMap((category) => category)
		);
	}

	/**
	 * Create new Product Category
	 *
	 * @param {CreateObject<ProductCategory>} category
	 * @returns {Promise<ProductCategory>}
	 * @memberof ProductsCategoriesService
	 */
	@asyncListener()
	async create(
		category: CreateObject<ProductCategory>
	): Promise<ProductCategory> {
		return super.create(category);
	}

	/**
	 * Updates existed Product Category
	 *
	 * @param {string} id
	 * @param {UpdateObject<ProductCategory>} updateObject
	 * @returns {Promise<ProductCategory>}
	 * @memberof ProductsCategoriesService
	 */
	@asyncListener()
	async update(
		id: string,
		updateObject: UpdateObject<ProductCategory>
	): Promise<ProductCategory> {
		await this.throwIfNotExists(id);
		return super.update(id, updateObject);
	}

	/**
	 * Removes Product Category
	 *
	 * @param {string} id
	 * @returns {Promise<void>}
	 * @memberof ProductsCategoriesService
	 */
	@asyncListener()
	async remove(id: string): Promise<void> {
		await this.throwIfNotExists(id);
		return super.remove(id);
	}

	async throwIfNotExists(categoryId: string): Promise<void> {
		const category = await super
			.get(categoryId)
			.pipe(first())
			.toPromise();

		if (!category || category.isDeleted) {
			throw Error(`Category with id '${categoryId}' does not exists!`);
		}
	}
}
