import Logger from 'bunyan';
import { injectable } from 'inversify';
import { createEverLogger } from '../../helpers/Log';
import { DBService } from '@pyro/db-server';
import IProductsCategoryRouter from '@modules/server.common/routers/IProductsCategoryRouter';
import { Observable } from 'rxjs';
import { asyncListener, observableListener, routerName } from '@pyro/io';
import IService from '../IService';
import ProductsCategory from '@modules/server.common/entities/ProductsCategory';
import { UpdateObject } from '@pyro/db/db-update-object';
import { CreateObject } from '@pyro/db/db-create-object';
import { first, switchMap, map } from 'rxjs/operators';

@injectable()
@routerName('products-category')
export class ProductsCategoriesService extends DBService<ProductsCategory>
	implements IProductsCategoryRouter, IService {
	public readonly DBObject: any = ProductsCategory;

	protected readonly log: Logger = createEverLogger({
		name: 'productsCategoriesService',
	});

	/**
	 * Get Product Category by Id
	 *
	 * @param {ProductsCategory['id']} id
	 * @returns {(Observable<ProductsCategory | null>)}
	 * @memberof ProductsCategoriesService
	 */
	@observableListener()
	get(id: ProductsCategory['id']): Observable<ProductsCategory | null> {
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
	 * @param {CreateObject<ProductsCategory>} category
	 * @returns {Promise<ProductsCategory>}
	 * @memberof ProductsCategoriesService
	 */
	@asyncListener()
	async create(
		category: CreateObject<ProductsCategory>
	): Promise<ProductsCategory> {
		return super.create(category);
	}

	/**
	 * Updates existed Product Category
	 *
	 * @param {string} id
	 * @param {UpdateObject<ProductsCategory>} updateObject
	 * @returns {Promise<ProductsCategory>}
	 * @memberof ProductsCategoriesService
	 */
	@asyncListener()
	async update(
		id: string,
		updateObject: UpdateObject<ProductsCategory>
	): Promise<ProductsCategory> {
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
		const category = await super.get(categoryId).pipe(first()).toPromise();

		if (!category || category.isDeleted) {
			throw Error(`Category with id '${categoryId}' does not exists!`);
		}
	}
}
