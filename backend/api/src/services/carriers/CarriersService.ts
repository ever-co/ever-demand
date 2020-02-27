import * as Logger from 'bunyan';
import CarrierStatus from '@modules/server.common/enums/CarrierStatus';
import Carrier from '@modules/server.common/entities/Carrier';
import { createEverLogger } from '../../helpers/Log';
import { DBService, IDbService } from '@pyro/db-server';
import { inject, injectable } from 'inversify';
import ICarrierRouter, {
	ICarrierLoginResponse,
	ICarrierRegistrationInput
} from '@modules/server.common/routers/ICarrierRouter';
import {
	asyncListener,
	observableListener,
	routerName,
	serialization
} from '@pyro/io';
import IService from '../IService';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import { concat, of, Observable, from } from 'rxjs';
import { exhaustMap, filter, first, map, switchMap } from 'rxjs/operators';
import { env } from '../../env';
import { AuthService, AuthServiceFactory } from '../auth';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';
import { Repository } from 'typeorm';

@injectable()
@routerName('carrier')
export class CarriersService extends DBService<Carrier>
	implements ICarrierRouter, IService {
	public readonly DBObject = Carrier;
	protected readonly log: Logger = createEverLogger({
		name: 'carriersService'
	});

	private readonly authService: AuthService<Carrier>;
	private databaseService: IDbService<Carrier>;

	constructor(
		@inject('Factory<AuthService>')
		private readonly authServiceFactory: AuthServiceFactory,
		@inject('CarrierRepository')
		private readonly _carrierRepository: Repository<Carrier>,
		@inject('DatabaseService')
		private databaseServiceFactory: (type) => IDbService<Carrier>
	) {
		super();
		_carrierRepository
			.count()
			.then((c) => {
				console.log('Cariers count: ' + c);
			})
			.catch((e) => {
				console.log(e);
			});
		this.authService = this.authServiceFactory({
			role: 'carrier',
			Entity: Carrier,
			saltRounds: env.CARRIER_PASSWORD_BCRYPT_SALT_ROUNDS
		});
		this.databaseService = this.databaseServiceFactory('Carrier');
	}

	@observableListener()
	get(id: Carrier['id']) {
		return from(this.databaseService.get(id)).pipe(
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
		return this.databaseService.find({ isActive: true, isDeleted: false });
	}

	async getMultipleByIds(
		carrierIds: string[]
	): Promise<Observable<Carrier[]>> {
		return this.databaseService
			.getMultiple(carrierIds)
			.pipe(map((arr) => arr.filter((elem) => !elem.isDeleted)));
	}

	@asyncListener()
	async register(input: ICarrierRegistrationInput) {
		const carrier = await this.databaseService.create({
			...input.carrier,
			...(input.password
				? {
						hash: await this.authService.getPasswordHash(
							input.password
						)
				  }
				: {})
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
			token: res.token
		};
	}

	@asyncListener()
	async updateStatus(
		carrierId: Carrier['id'],
		status: CarrierStatus
	): Promise<Carrier> {
		await this.throwIfNotExists(carrierId);
		return this.databaseService.update(carrierId, { status });
	}

	@asyncListener()
	async updateActivity(
		carrierId: Carrier['id'],
		isActive: boolean
	): Promise<Carrier> {
		await this.throwIfNotExists(carrierId);
		return this.databaseService.update(carrierId, { isActive });
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
		return this.databaseService.update(carrierId, { geoLocation });
	}

	@asyncListener()
	async updateById(
		id: Carrier['id'],
		updateObject: Partial<Carrier>
	): Promise<Carrier> {
		await this.throwIfNotExists(id);
		return this.databaseService.update(id, updateObject);
	}

	async increaseNumberOfDeliveries(
		carrierId: Carrier['id'],
		n: number
	): Promise<Carrier> {
		await this.throwIfNotExists(carrierId);

		return this.databaseService.update(carrierId, {
			numberOfDeliveries: n
		});
	}

	async throwIfNotExists(carrierId: string) {
		const carrier = await this.databaseService
			.get(carrierId)
			.pipe(first())
			.toPromise();

		if (!carrier || carrier.isDeleted) {
			throw Error(`Carrier with id '${carrierId}' does not exists!`);
		}
	}

	async getCarriers(findInput, pagingOptions: IPagingOptions) {
		const sortObj = {};
		if (pagingOptions.sort) {
			sortObj[pagingOptions.sort.field] = pagingOptions.sort.sortBy;
		}

		return this.databaseService.find({
			...findInput,
			isDeleted: false
		});
	}
}

export default CarriersService;
