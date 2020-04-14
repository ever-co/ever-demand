import { Mutation, Query, ResolveProperty, Resolver } from '@nestjs/graphql';
import { CarriersService } from '../../services/carriers';
import { default as ICarrier } from '@modules/server.common/interfaces/ICarrier';
import Carrier from '@modules/server.common/entities/Carrier';
import { first, map } from 'rxjs/operators';
import { DevicesService } from '../../services/devices';
import {
	ICarrierRegistrationInput,
	ICarrierLoginResponse,
} from '@modules/server.common/routers/ICarrierRouter';
import CarrierStatus from '@modules/server.common/enums/CarrierStatus';
import Device from '@modules/server.common/entities/Device';

@Resolver('Carrier')
export class CarrierResolver {
	constructor(
		private readonly _carriersService: CarriersService,
		private readonly _devicesService: DevicesService
	) {}

	@Query('getActiveCarriers')
	async getActiveCarriers(): Promise<Carrier[]> {
		return this._carriersService.getAllActive().pipe(first()).toPromise();
	}

	@Query('getCarriers')
	async getCarriers(
		_,
		{ carriersFindInput, pagingOptions = {} }
	): Promise<Carrier[]> {
		// set default paging options
		if (!pagingOptions || (pagingOptions && !pagingOptions['sort'])) {
			pagingOptions['sort'] = { field: '_createdAt', sortBy: 'desc' };
		}

		const carriers = await this._carriersService.getCarriers(
			carriersFindInput,
			pagingOptions
		);

		return carriers.map((c: ICarrier) => new Carrier(c));
	}

	@Query('getCarrierByUsername')
	async getCarrierByUsername(
		_,
		{ username }: { username: string }
	): Promise<Carrier> {
		return this._carriersService.findOne({
			username,
			isDeleted: { $eq: false },
		});
	}

	@Query('getCarrier')
	async getCarrier(_, { id }: { id: string }): Promise<Carrier> {
		return this._carriersService.get(id).pipe(first()).toPromise();
	}

	/**
	 * Get total amount of Carriers in the system (not deleted)
	 *
	 * @returns {Promise<number>}
	 * @memberof CarrierResolver
	 */
	@Query('getCountOfCarriers')
	async getCountOfCarriers(_, { carriersFindInput }): Promise<number> {
		return this._carriersService.Model.find({
			...carriersFindInput,
			isDeleted: { $eq: false },
		})
			.countDocuments()
			.exec();
	}

	@Mutation('updateCarrierEmail')
	async updateCarrierEmail(
		_,
		{ carrierId, email }: { carrierId: string; email: string }
	) {
		return this._carriersService.updateEmail(carrierId, email);
	}

	@Mutation('registerCarrier')
	async registerCarrier(
		_,
		{ registerInput }: { registerInput: ICarrierRegistrationInput }
	): Promise<Carrier> {
		return this._carriersService.register(registerInput);
	}

	@Mutation('updateCarrierStatus')
	async updateCarrierStatus(
		_,
		{ id, status }: { id: string; status: string }
	): Promise<void> {
		this._carriersService.updateStatus(id, CarrierStatus[status]);
	}

	@Mutation('updateCarrier')
	async updateCarrier(
		_,
		{ id, updateInput }: { id: string; updateInput }
	): Promise<Carrier> {
		await this._carriersService.throwIfNotExists(id);
		return this._carriersService.update(id, updateInput);
	}

	@Mutation('removeCarrier')
	async removeCarrier(_, { id }: { id: string }): Promise<void> {
		await this._carriersService.throwIfNotExists(id);
		return this._carriersService.remove(id);
	}

	@Mutation('removeCarriersByIds')
	async removeCarriersByIds(_, { ids }: { ids: string[] }): Promise<void> {
		const carriers = await this._carriersService.find({
			_id: { $in: ids },
			isDeleted: { $eq: false },
		});

		const carriersIds = carriers.map((d) => d.id);

		return this._carriersService.removeMultipleByIds(carriersIds);
	}

	@ResolveProperty('devices')
	async getDevices(_carrier: ICarrier): Promise<Device[]> {
		const carrier = new Carrier(_carrier);

		return this._devicesService
			.getMultiple(carrier.devicesIds)
			.pipe(
				map((devices) => devices.filter((d) => !d.isDeleted)),
				first()
			)
			.toPromise();
	}

	@Mutation('carrierLogin')
	async carrierLogin(
		_,
		{ username, password }: { username: string; password: string }
	): Promise<ICarrierLoginResponse> {
		return this._carriersService.login(username, password);
	}

	@Mutation('updateCarrierPassword')
	async updateCarrierPassword(
		_,
		{
			id,
			password,
		}: { id: Carrier['id']; password: { current: string; new: string } }
	): Promise<void> {
		return this._carriersService.updatePassword(id, password);
	}
}
