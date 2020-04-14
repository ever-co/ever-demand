import { injectable } from 'inversify';
import { IDeviceCreateObject } from '@modules/server.common/interfaces/IDevice';
import Device from '@modules/server.common/entities/Device';
import { DBService } from '@pyro/db-server';
import { createEverLogger } from '../../helpers/Log';
import { Observable } from 'rxjs';
import { asyncListener, observableListener, routerName } from '@pyro/io';
import IDeviceRouter from '@modules/server.common/routers/IDeviceRouter';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import IService from '../IService';
import { first, switchMap, map } from 'rxjs/operators';
import Logger from 'bunyan';

@injectable()
@routerName('device')
export class DevicesService extends DBService<Device>
	implements IDeviceRouter, IService {
	public readonly DBObject: any = Device;

	protected readonly log: Logger = createEverLogger({
		name: 'devicesService',
	});

	@observableListener()
	get(id: string): Observable<Device | null> {
		return super.get(id).pipe(
			map(async (device) => {
				await this.throwIfNotExists(id);
				return device;
			}),
			switchMap((device) => device)
		);
	}

	async getMultipleDevices(
		ids: Array<Device['id']>
	): Promise<Observable<Device[]>> {
		const devices = await this.find({
			_id: { $in: ids },
			isDeleted: { $eq: false },
		});

		const devicesIds = devices.map((device) => device.id);

		return super.getMultiple(devicesIds);
	}

	@asyncListener()
	async create(device: IDeviceCreateObject): Promise<Device> {
		return super.create(device);
	}

	@asyncListener()
	async updateLanguage(
		deviceId: string,
		language: ILanguage
	): Promise<Device> {
		await this.throwIfNotExists(deviceId);

		return this.update(deviceId, {
			language,
		});
	}

	async throwIfNotExists(deviceId: string) {
		const device = await super.get(deviceId).pipe(first()).toPromise();

		if (!device || device.isDeleted) {
			throw Error(`Device with id '${deviceId}' does not exists!`);
		}
	}
}
