import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router, RouterFactory } from '../lib/router';
import { Injectable } from '@angular/core';
import {
	IDeviceRawObject,
	IDeviceCreateObject,
} from '@modules/server.common/interfaces/IDevice';
import Device from '@modules/server.common/entities/Device';
import IDeviceRouter from '@modules/server.common/routers/IDeviceRouter';
import ILanguage from '@modules/server.common/interfaces/ILanguage';

@Injectable()
export class DeviceRouter implements IDeviceRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('device');
	}

	async create(deviceCreateObject: IDeviceCreateObject): Promise<Device> {
		return this._deviceFactory(
			await this.router.run<IDeviceRawObject>(
				'create',
				deviceCreateObject
			)
		);
	}

	get(id: string): Observable<Device> {
		return this.router
			.runAndObserve<IDeviceRawObject>('get', id)
			.pipe(map((device) => this._deviceFactory(device)));
	}

	/*public getByUUIDAndPlatform(uuid: string, platform: IPlatform): Observable<Device> {
	 return this.router.runAndObserve<IDeviceRawObject>('getByUUIDAndPlatform', uuid, platform)
	 .map((device) => this._deviceFactory(device));
	 }*/

	async updateLanguage(
		deviceId: string,
		language: ILanguage
	): Promise<Device> {
		return this._deviceFactory(
			await this.router.run<IDeviceRawObject>(
				'updateLanguage',
				deviceId,
				language
			)
		);
	}

	protected _deviceFactory(device: null): null;
	protected _deviceFactory(device: IDeviceRawObject): Device;
	protected _deviceFactory(device: IDeviceRawObject | null) {
		return device == null ? null : new Device(device);
	}
}
