import Logger from 'bunyan';
import CarrierStatus from '@modules/server.common/enums/CarrierStatus';
import Carrier from '@modules/server.common/entities/Carrier';
import { createEverLogger } from '../../helpers/Log';
import { DBService } from '@pyro/db-server';
import { inject, injectable } from 'inversify';
import ICarrierRouter, {
	ICarrierLoginResponse,
	ICarrierRegistrationInput,
} from '@modules/server.common/routers/ICarrierRouter';
import {
	asyncListener,
	observableListener,
	routerName,
	serialization,
} from '@pyro/io';
import IService from '../IService';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import { concat, of, Observable } from 'rxjs';
import { exhaustMap, filter, first, map, switchMap } from 'rxjs/operators';
import { env } from '../../env';
import { AuthService, AuthServiceFactory } from '../auth';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';

@injectable()
@routerName('carrier')
export class CarriersService extends DBService<Carrier>
	implements ICarrierRouter, IService {
	public readonly DBObject: any = Carrier;
	protected readonly log: Logger = createEverLogger({
		name: 'carriersService',
	});

	private readonly authService: AuthService<Carrier>;

	constructor(
		@inject('Factory<AuthService>')
		private readonly authServiceFactory: AuthServiceFactory
	) {
		super();
		this.authService = this.authServiceFactory({
			role: 'carrier',
			Entity: Carrier,
			saltRounds: env.CARRIER_PASSWORD_BCRYPT_SALT_ROUNDS,
		});
	}

	@observableListener()
	get(id: Carrier['id']) {
		return super.get(id).pipe(
			map(async (carrier) => {
				await this.throwIfNotExists(id);
				return carrier;
			}),
			switchMap((carrier) => {
				return carrier;
			})
		);
	}

	@observableListener()
	getAllActive(): Observable<Carrier[]> {
		return concat(of(null), this.existence).pipe(
			exhaustMap(() => this._getAllActive())
		);
	}

	protected async _getAllActive() {
		return super.find({ isActive: true, isDeleted: { $eq: false } });
	}

	async getMultipleByIds(
		carrierIds: string[]
	): Promise<Observable<Carrier[]>> {
		const carriers = await this.find({
			_id: { $in: carrierIds },
			isDeleted: { $eq: false },
		});

		const carriersIdsToReturn = carriers.map((c) => c.id);
		return this.getMultiple(carriersIdsToReturn);
	}

	@asyncListener()
	async register(input: ICarrierRegistrationInput) {
		const carrier = await super.create({
			...input.carrier,
			...(input.password
				? {
						hash: await this.authService.getPasswordHash(
							input.password
						),
				  }
				: {}),
		});
		return carrier;
	}

	async updatePassword(
		id: Carrier['id'],
		password: { current: string; new: string }
	): Promise<void> {
		await this.throwIfNotExists(id);
		await this.authService.updatePassword(id, password);
	}

	@asyncListener()
	async login(
		username: string,
		password: string
	): Promise<ICarrierLoginResponse | null> {
		const res = await this.authService.login({ username }, password);

		if (!res) {
			return null;
		} else if (res.entity.isDeleted) {
			return null;
		}

		return {
			carrier: res.entity,
			token: res.token,
		};
	}

	@asyncListener()
	async updateStatus(
		carrierId: Carrier['id'],
		status: CarrierStatus
	): Promise<Carrier> {
		await this.throwIfNotExists(carrierId);
		return super.update(carrierId, { status });
	}

	@asyncListener()
	async updateActivity(
		carrierId: Carrier['id'],
		isActive: boolean
	): Promise<Carrier> {
		await this.throwIfNotExists(carrierId);
		return super.update(carrierId, { isActive });
	}

	/**
	 * Update email for given Carrier (by carrier Id)
	 *
	 * @param {string} carrierId
	 * @param {string} email
	 * @returns {Promise<Carrier>}
	 * @memberof CarriersService
	 */
	@asyncListener()
	async updateEmail(carrierId: string, email: string): Promise<Carrier> {
		await this.throwIfNotExists(carrierId);
		return this.update(carrierId, { email });
	}

	@asyncListener()
	async updateGeoLocation(
		carrierId: Carrier['id'],
		@serialization((gl: IGeoLocation) => new GeoLocation(gl))
		geoLocation: GeoLocation
	): Promise<Carrier> {
		await this.throwIfNotExists(carrierId);
		return super.update(carrierId, { geoLocation });
	}

	@asyncListener()
	async updateById(
		id: Carrier['id'],
		updateObject: Partial<Carrier>
	): Promise<Carrier> {
		await this.throwIfNotExists(id);
		return super.update(id, updateObject);
	}

	async increaseNumberOfDeliveries(
		carrierId: Carrier['id'],
		n: number
	): Promise<Carrier> {
		await this.throwIfNotExists(carrierId);

		return super.update(carrierId, {
			$inc: { numberOfDeliveries: n },
		});
	}

	async throwIfNotExists(carrierId: string) {
		const carrier = await super.get(carrierId).pipe(first()).toPromise();

		if (!carrier || carrier.isDeleted) {
			throw Error(`Carrier with id '${carrierId}' does not exists!`);
		}
	}

	async getCarriers(findInput, pagingOptions: IPagingOptions) {
		const sortObj = {};
		if (pagingOptions.sort) {
			sortObj[pagingOptions.sort.field] = pagingOptions.sort.sortBy;
		}

		return this.Model.find({
			...findInput,
			isDeleted: { $eq: false },
		})
			.sort(sortObj)
			.skip(pagingOptions.skip)
			.limit(pagingOptions.limit)
			.lean()
			.exec();
	}
}

export default CarriersService;
