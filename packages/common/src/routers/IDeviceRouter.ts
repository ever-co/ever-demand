import { IDeviceCreateObject } from '../interfaces/IDevice';
import Device from '../entities/Device';
import { Observable } from 'rxjs';
import ILanguage from '../interfaces/ILanguage';

interface IDeviceRouter {
	get(id: Device['id']): Observable<Device | null>;

	// getByUUIDAndPlatform(uuid: string, platform: IPlatform): Observable<Device>;

	create(device: IDeviceCreateObject): Promise<Device>;

	updateLanguage(
		deviceId: Device['id'],
		language: ILanguage
	): Promise<Device>;
}

export default IDeviceRouter;
