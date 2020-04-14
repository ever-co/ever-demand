import { Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PubSub } from 'graphql-subscriptions';
import { DevicesService } from '../../services/devices';
import { IDeviceCreateObject } from '@modules/server.common/interfaces/IDevice';
import { first } from 'rxjs/operators';
import ILanguage from '@modules/server.common/interfaces/ILanguage';

const pubSub = new PubSub();

@Resolver('Device')
export class DeviceResolver {
	constructor(private readonly _devicesService: DevicesService) {}

	@Query('device')
	async getDevice(_, { id }: { id: string }) {
		return this._devicesService.get(id).pipe(first()).toPromise();
	}

	@Query('devices')
	// @UseGuards(AuthGuard('jwt'))
	async getDevices(_, { findInput }) {
		return this._devicesService.find({
			...findInput,
			isDeleted: { $eq: false },
		});
	}

	@Mutation()
	async updateDeviceLanguage(
		_,
		{
			deviceId,
			language,
		}: {
			deviceId: string;
			language: ILanguage;
		}
	) {
		return this._devicesService.updateLanguage(deviceId, language);
	}

	@Mutation()
	@UseGuards(AuthGuard('jwt'))
	async createDevice(
		_,
		{ createInfo }: { id: string; createInfo: IDeviceCreateObject }
	) {
		return this._devicesService.create(createInfo);
	}

	@Mutation()
	// @UseGuards(AuthGuard('jwt'))
	async updateDevice(_, { id, updateInput }: { id: string; updateInput }) {
		await this._devicesService.throwIfNotExists(id);

		try {
			const device = await this._devicesService.update(id, updateInput);
			pubSub.publish('deviceCreated', { deviceCreated: device });
			return device;
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	@Mutation()
	async removeDevice(_, { id }: { id: string }) {
		await this._devicesService.throwIfNotExists(id);
		return this._devicesService.remove(id);
	}

	@Mutation()
	async removeDeviceByIds(_, { ids }: { ids: string[] }) {
		const devices = await this._devicesService.find({
			_id: { $in: ids },
			isDeleted: { $eq: false },
		});

		const devicesIds = devices.map((d) => d.id);

		return this._devicesService.removeMultipleByIds(devicesIds);
	}

	@Subscription() // TODO rename to deviceUpdated
	deviceCreated() {
		return {
			subscribe: () => pubSub.asyncIterator('deviceCreated'),
		};
	}
}
