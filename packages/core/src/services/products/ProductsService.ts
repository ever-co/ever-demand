import Logger from 'bunyan';
import { injectable } from 'inversify';
import { createEverLogger } from '../../helpers/Log';
import Product from '@modules/server.common/entities/Product';
import { DBService } from '@pyro/db-server';
import { default as IProduct } from '@modules/server.common/interfaces/IProduct';
import IProductRouter from '@modules/server.common/routers/IProductRouter';
import { Observable } from 'rxjs';
import {
	asyncListener,
	observableListener,
	routerName,
	serialization,
} from '@pyro/io';
import IService from '../IService';
import { CreateObject } from '@pyro/db/db-create-object';
import { UpdateObject } from '@pyro/db/db-update-object';
import { first, switchMap, map } from 'rxjs/operators';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';

@injectable()
@routerName('product')
export class ProductsService extends DBService<Product>
	implements IProductRouter, IService {
	public readonly DBObject: any = Product;

	protected readonly log: Logger = createEverLogger({
		name: 'productsService',
	});

	@observableListener()
	get(id: Product['id']): Observable<Product | null> {
		return super.get(id).pipe(
			map(async (product) => {
				await this.throwIfNotExists(id);
				return product;
			}),
			switchMap((product) => product)
		);
	}

	@asyncListener()
	async getProducts(
		findInput: any,
		pagingOptions: IPagingOptions,
		existedProductsIds = []
	): Promise<any> {
		const sortObj = {};

		if (pagingOptions.sort) {
			sortObj[pagingOptions.sort.field] = pagingOptions.sort.sortBy;
		}

		return this.Model.find({
			...findInput,
			isDeleted: { $eq: false },
			_id: { $nin: existedProductsIds },
		})
			.sort(sortObj)
			.skip(pagingOptions.skip)
			.limit(pagingOptions.limit)
			.lean()
			.exec();
	}

	@asyncListener()
	async create(product: CreateObject<Product>): Promise<Product> {
		return super.create(product);
	}

	@asyncListener()
	async update(
		id: string,
		updateObject: UpdateObject<Product>
	): Promise<Product> {
		await this.throwIfNotExists(id);
		return super.update(id, updateObject);
	}

	@asyncListener()
	async save(
		@serialization((product: IProduct) => new Product(product))
		updatedProduct: Product
	): Promise<Product> {
		await this.throwIfNotExists(updatedProduct.id);
		return this.update(updatedProduct.id, updatedProduct);
	}

	async throwIfNotExists(productId: string): Promise<void> {
		const product = await super.get(productId).pipe(first()).toPromise();

		if (!product || product.isDeleted) {
			throw Error(`Product with id '${productId}' does not exists!`);
		}
	}
}
