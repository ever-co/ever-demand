import _ from 'lodash';
import { map } from 'rxjs/operators';
import { Router, RouterFactory } from '../lib/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import IGeoLocationProductsRouter from '@modules/server.common/routers/IGeoLocationProductsRouter';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import IProductInfo from '@modules/server.common/interfaces/IProductInfo';
import GeoLocation from '@modules/server.common/entities/GeoLocation';

@Injectable()
export class GeoLocationProductsRouter implements IGeoLocationProductsRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('geo-location-products');
	}

	get(
		geoLocation: GeoLocation,
		options?: { isDeliveryRequired?: boolean; isTakeaway?: boolean }
	): Observable<ProductInfo[]> {
		return this.router
			.runAndObserve<IProductInfo[]>('get', geoLocation, options)
			.pipe(
				map((products) =>
					_.map(products, (productInfo) =>
						this._productInfoFactory(productInfo)
					)
				)
			);
	}

	protected _productInfoFactory(productInfo: IProductInfo) {
		return productInfo == null ? null : new ProductInfo(productInfo);
	}
}
