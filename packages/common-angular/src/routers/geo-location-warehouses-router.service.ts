import _ from 'lodash';
import { map } from 'rxjs/operators';
import { RouterFactory, Router } from '../lib/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import IWarehouse from '@modules/server.common/interfaces/IWarehouse';
import Warehouse from '@modules/server.common/entities/Warehouse';
import IGeoLocationWarehousesRouter, {
	IGeoLocationWarehousesRouterGetOptions,
} from '@modules/server.common/routers/IGeoLocationWarehousesRouter';
import GeoLocation from '@modules/server.common/entities/GeoLocation';

@Injectable()
export class GeoLocationWarehousesRouter
	implements IGeoLocationWarehousesRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('geo-location-warehouses');
	}

	get(
		geoLocation: GeoLocation,
		options?: IGeoLocationWarehousesRouterGetOptions
	): Observable<Warehouse[]> {
		return this.router
			.runAndObserve<IWarehouse[]>('get', geoLocation, options)
			.pipe(
				map((warehouses) =>
					_.map(warehouses, (warehouse) =>
						this._warehouseFactory(warehouse)
					)
				)
			);
	}

	protected _warehouseFactory(warehouse: IWarehouse) {
		return warehouse == null ? null : new Warehouse(warehouse);
	}
}
