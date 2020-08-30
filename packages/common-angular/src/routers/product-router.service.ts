import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, RouterFactory } from '../lib/router';
import { Injectable } from '@angular/core';
import IProductRouter from '@modules/server.common/routers/IProductRouter';
import Product from '@modules/server.common/entities/Product';
import IProduct, {
	IProductCreateObject,
} from '@modules/server.common/interfaces/IProduct';

@Injectable()
export class ProductRouter implements IProductRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('product');
	}

	get(id: string): Observable<Product> {
		return this.router
			.runAndObserve<IProduct>('get', id)
			.pipe(map((product) => new Product(product)));
	}

	async create(p: IProductCreateObject): Promise<Product> {
		const product = await this.router.run<IProduct>('create', p);
		return new Product(product);
	}

	async update(id: string, updateObject): Promise<Product> {
		const product = await this.router.run<IProduct>(
			'update',
			id,
			updateObject
		);
		return new Product(product);
	}

	async save(updatedProduct: IProduct): Promise<Product> {
		const product = await this.router.run<IProduct>('save', updatedProduct);
		return new Product(product);
	}
}
