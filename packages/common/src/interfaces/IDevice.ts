import { ITenantScoped } from './ITenant';
import IPlatform from './IPlatform';
import ILanguage from './ILanguage';
import { DBCreateObject, DBRawObject, PyroObjectId } from '../@pyro/db';

export interface IDeviceCreateObject extends DBCreateObject, ITenantScoped {
	channelId: string | null;
	type: IPlatform;
	language?: ILanguage;
	uuid: string;
}

export interface IDeviceRawObject extends IDeviceCreateObject, DBRawObject {
	_id: PyroObjectId;
	language: ILanguage;
}
