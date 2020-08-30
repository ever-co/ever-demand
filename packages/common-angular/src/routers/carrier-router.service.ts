import _ from 'lodash';
import { map } from 'rxjs/operators';
import { Router, RouterFactory } from '../lib/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import ICarrier from '@modules/server.common/interfaces/ICarrier';
import Carrier from '@modules/server.common/entities/Carrier';
import ICarrierRouter from '@modules/server.common/routers/ICarrierRouter';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import {
	ICarrierLoginResponse,
	ICarrierRegistrationInput,
} from '@modules/server.common/routers/ICarrierRouter';

@Injectable()
export class CarrierRouter implements ICarrierRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('carrier');
	}

	get(id: string): Observable<Carrier | null> {
		return this.router
			.runAndObserve<ICarrier>('get', id)
			.pipe(map((carrier) => this._carrierFactory(carrier)));
	}

	getAllActive(): Observable<Carrier[]> {
		return this.router
			.runAndObserve<ICarrier[]>('getAllActive')
			.pipe(
				map((carriers) =>
					_.map(carriers, (carrier) => this._carrierFactory(carrier))
				)
			);
	}

	async updateStatus(carrierId: string, newStatus: number): Promise<Carrier> {
		const carrier = await this.router.run<ICarrier>(
			'updateStatus',
			carrierId,
			newStatus
		);
		return this._carrierFactory(carrier);
	}

	async updateActivity(
		carrierId: string,
		activity: boolean
	): Promise<Carrier> {
		const carrier = await this.router.run<ICarrier>(
			'updateActivity',
			carrierId,
			activity
		);
		return this._carrierFactory(carrier);
	}

	async updateGeoLocation(
		carrierId: string,
		geoLocation: GeoLocation
	): Promise<Carrier> {
		const carrier = await this.router.run<ICarrier>(
			'updateGeoLocation',
			carrierId,
			geoLocation
		);
		return this._carrierFactory(carrier);
	}

	async updatePassword(
		id: string,
		password: { current?: string; new: string }
	): Promise<void> {
		await this.router.run('updatePassword', id, password);
	}

	async updateById(
		id: string,
		updateObject: Partial<ICarrier>
	): Promise<Carrier> {
		const c = await this.router.run<ICarrier>(
			'updateById',
			id,
			updateObject
		);
		return this._carrierFactory(c);
	}

	async register(input: ICarrierRegistrationInput): Promise<Carrier> {
		const warehouse = await this.router.run<ICarrier>('register', input);
		return this._carrierFactory(warehouse);
	}

	async login(
		username: string,
		password: string
	): Promise<ICarrierLoginResponse | null> {
		const res = await this.router.run<ICarrierLoginResponse | null>(
			'login',
			username,
			password
		);

		if (res == null) {
			return null;
		} else {
			return {
				token: res.token,
				carrier: this._carrierFactory(res.carrier),
			};
		}
	}

	protected _carrierFactory(carrier: ICarrier) {
		return carrier == null ? null : new Carrier(carrier);
	}
}
