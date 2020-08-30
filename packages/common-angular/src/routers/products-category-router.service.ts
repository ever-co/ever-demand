import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, RouterFactory } from '../lib/router';
import { Injectable } from '@angular/core';
import IProductsCategoryRouter from '@modules/server.common/routers/IProductsCategoryRouter';
import ProductsCategory from '@modules/server.common/entities/ProductsCategory';
import {
	IProductsCategory,
	IProductsCategoryCreateObject,
} from '@modules/server.common/interfaces/IProductsCategory';

@Injectable()
export class ProductsCategoryRouter implements IProductsCategoryRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('productsCategory');
	}

	get(id: string): Observable<ProductsCategory> {
		return this.router
			.runAndObserve<IProductsCategory>('get', id)
			.pipe(map((category) => new ProductsCategory(category)));
	}

	async create(c: IProductsCategoryCreateObject): Promise<ProductsCategory> {
		const category = await this.router.run<IProductsCategory>('create', c);
		return new ProductsCategory(category);
	}

	async update(id: string, updateObject): Promise<ProductsCategory> {
		const category = await this.router.run<IProductsCategory>(
			'update',
			id,
			updateObject
		);
		return new ProductsCategory(category);
	}

	remove(id: string): any {
		return this.router.run<IProductsCategory>('remove', id);
	}
}
