import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, RouterFactory } from '../lib/router';
import _ from 'lodash';
import { Injectable } from '@angular/core';
import IWarehouseProduct, {
	IWarehouseProductCreateObject,
} from '@modules/server.common/interfaces/IWarehouseProduct';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import IWarehouseProductsRouter from '@modules/server.common/routers/IWarehouseProductsRouter';

@Injectable()
export class WarehouseProductsRouter implements IWarehouseProductsRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('warehouse-products');
	}

	get(id: string, fullProducts = true): Observable<WarehouseProduct[]> {
		return this.router
			.runAndObserve<IWarehouseProduct[]>('get', id, fullProducts)
			.pipe(
				map((warehouseProducts) =>
					_.map(warehouseProducts, (warehouseProduct) =>
						this._warehouseProductFactory(warehouseProduct)
					)
				)
			);
	}

	getAvailable(warehouseId: string): Observable<WarehouseProduct[]> {
		return this.router
			.runAndObserve<IWarehouseProduct[]>('getAvailable', warehouseId)
			.pipe(
				map((warehouseProducts) =>
					_.map(warehouseProducts, (warehouseProduct) =>
						this._warehouseProductFactory(warehouseProduct)
					)
				)
			);
	}

	async add(
		warehouseId: string,
		products: IWarehouseProductCreateObject[]
	): Promise<WarehouseProduct[]> {
		const warehouseProducts = await this.router.run<IWarehouseProduct[]>(
			'add',
			warehouseId,
			products
		);
		return _.map(warehouseProducts, (warehouseProduct) =>
			this._warehouseProductFactory(warehouseProduct)
		);
	}

	async saveUpdated(
		warehouseId: string,
		updatedWarehouseProduct: IWarehouseProduct
	): Promise<WarehouseProduct> {
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
			'saveUpdated',
			warehouseId,
			updatedWarehouseProduct
		);
		return this._warehouseProductFactory(warehouseProduct);
	}

	async changePrice(
		warehouseId: string,
		productId: string,
		price: number
	): Promise<WarehouseProduct> {
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
			'changePrice',
			warehouseId,
			productId,
			price
		);
		return this._warehouseProductFactory(warehouseProduct);
	}

	async decreaseCount(
		warehouseId: string,
		productId: string,
		count: number
	): Promise<WarehouseProduct> {
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
			'decreaseCount',
			warehouseId,
			productId,
			count
		);
		return this._warehouseProductFactory(warehouseProduct);
	}

	async increaseCount(
		warehouseId: string,
		productId: string,
		count: number
	): Promise<WarehouseProduct> {
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
			'increaseCount',
			warehouseId,
			productId,
			count
		);
		return this._warehouseProductFactory(warehouseProduct);
	}

	async increaseSoldCount(
		warehouseId: string,
		productId: string,
		count: number
	): Promise<WarehouseProduct> {
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
			'increaseSoldCount',
			warehouseId,
			productId,
			count
		);
		return this._warehouseProductFactory(warehouseProduct);
	}

	async decreaseSoldCount(
		warehouseId: string,
		productId: string,
		count: number
	): Promise<WarehouseProduct> {
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
			'decreaseSoldCount',
			warehouseId,
			productId,
			count
		);
		return this._warehouseProductFactory(warehouseProduct);
	}

	getTopProducts(
		warehouseId: string,
		quantity: number
	): Observable<WarehouseProduct[]> {
		return this.router
			.runAndObserve<IWarehouseProduct[]>(
				'getTopProducts',
				warehouseId,
				quantity
			)
			.pipe(
				map((warehouseProducts) =>
					_.map(warehouseProducts, (warehouseProduct) =>
						this._warehouseProductFactory(warehouseProduct)
					)
				)
			);
	}

	protected _warehouseProductFactory(warehouseProduct: IWarehouseProduct) {
		return warehouseProduct == null
			? null
			: new WarehouseProduct(warehouseProduct);
	}
}
