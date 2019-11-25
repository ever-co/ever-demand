import { Observable } from 'rxjs';
import { Router, RouterFactory } from '../lib/router';
import { map } from 'rxjs/operators';
import _ from 'lodash';
import { Injectable } from '@angular/core';
import IWarehouseCarriersRouter from '@modules/server.common/routers/IWarehouseCarriersRouter';
import Carrier from '@modules/server.common/entities/Carrier';
import ICarrier from '@modules/server.common/interfaces/ICarrier';

@Injectable()
export class WarehouseCarriersRouter implements IWarehouseCarriersRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('warehouse-carriers');
	}

	get(warehouseId: string): Observable<Carrier[]> {
		return this.router
			.runAndObserve<ICarrier[]>('get', warehouseId)
			.pipe(
				map((carriers) =>
					_.map(carriers, (carrier) => this._carrierFactory(carrier))
				)
			);
	}

	async updatePassword(id: string, password: string): Promise<void> {
		await this.router.run('updatePassword', id, password);
	}

	protected _carrierFactory(carrier: ICarrier) {
		return carrier == null ? null : new Carrier(carrier);
	}
}
